import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { Edge } from '@xyflow/react';
import { WorkflowDefinition, WorkflowStep, WorkflowStepKind } from '../types/workflow';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { defaultWorkflows } from '../helpers/workflowTemplates';

const validKinds: Set<string> = new Set<string>([
  'trigger', 'action', 'wait_event', 'wait_delay', 'branch', 'end',
]);

function normalizeStep(step: Record<string, any>): WorkflowStep {
  // API may return `type` instead of `kind` — map it
  const rawKind = step.kind ?? step.type ?? 'action';
  const kind: WorkflowStepKind = validKinds.has(rawKind) ? rawKind : 'action';

  // API returns `action` instead of `action_id`, `params` instead of `config`
  const actionId = step.action_id ?? step.action ?? '';
  const config = step.config ?? (Array.isArray(step.params) ? {} : step.params) ?? {};

  return {
    ...step,
    id: step.id ?? '',
    kind,
    action_id: actionId,
    name: step.name ?? '',
    config,
  } as WorkflowStep;
}

function buildEdgesFromSteps(steps: WorkflowStep[]): Edge[] {
  if (steps.length < 2) return [];

  const edges: Edge[] = [];

  for (let i = 0; i < steps.length - 1; i++) {
    const step = steps[i];
    const isBranch = step.kind === 'branch';

    edges.push({
      id: `edge-${step.id}-${steps[i + 1].id}`,
      source: step.id,
      sourceHandle: isBranch ? 'true' : undefined,
      target: steps[i + 1].id,
      type: 'workflow',
    });

    // Restore GOTO edge from branch config
    if (isBranch && step.config?.goto_step) {
      const gotoTarget = step.config.goto_step;
      if (steps.some((s) => s.id === gotoTarget)) {
        edges.push({
          id: `edge-${step.id}-false-${gotoTarget}`,
          source: step.id,
          sourceHandle: 'false',
          target: gotoTarget,
          type: 'workflow',
        });
      }
    }
  }

  return edges;
}

function normalizeWorkflow(data: Record<string, any>): WorkflowDefinition {
  const steps = ((data.steps ?? []) as Record<string, any>[]).map(normalizeStep);
  const edges = data.edges && data.edges.length > 0
    ? data.edges
    : buildEdgesFromSteps(steps);

  // API returns flat trigger_entity / trigger_event / trigger_conditions fields
  // instead of a nested trigger object — map them
  const trigger = data.trigger && typeof data.trigger === 'object' && data.trigger.entity
    ? data.trigger
    : {
        entity: data.trigger_entity ?? '',
        event: data.trigger_event ?? '',
        description: data.trigger_description ?? '',
        conditions: data.trigger_conditions ?? [],
        match: data.trigger_match ?? 'and',
      };

  // API uses is_active boolean instead of status string
  const status = data.status
    ?? (data.is_active === true ? 'active' : data.is_active === false ? 'draft' : 'draft');

  return {
    ...data,
    id: data.id ?? '',
    name: data.name ?? '',
    status,
    trigger,
    steps,
    edges,
    runs_count: data.runs_count ?? 0,
  } as WorkflowDefinition;
}

export function useWorkflowsQuery(params?: {
  status?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams({ sort: 'id|desc' });

  if (params?.status && params.status !== 'all') {
    queryParams.set('status', params.status);
  }

  if (params?.search) {
    queryParams.set('filter', params.search);
  }

  return useQuery<WorkflowDefinition[]>(
    ['/api/v1/workflows', params],
    () =>
      request(
        'GET',
        endpoint(`/api/v1/workflows?${queryParams.toString()}`),
        undefined,
        { skipIntercept: true }
      )
        .then((response: { data?: { data?: WorkflowDefinition[] } }) => {
          const data = response.data?.data;

          if (
            Array.isArray(data) &&
            data.length > 0 &&
            typeof data[0].id === 'string' &&
            typeof data[0].name === 'string'
          ) {
            return data.map(normalizeWorkflow);
          }

          return defaultWorkflows;
        })
        .catch(() => defaultWorkflows),
    { staleTime: 30_000 }
  );
}

export function useWorkflowQuery(id: string | undefined) {
  return useQuery<WorkflowDefinition | undefined>(
    ['/api/v1/workflows', id],
    () => {
      if (!id) {
        return undefined;
      }

      return request(
        'GET',
        endpoint('/api/v1/workflows/:id', { id }),
        undefined,
        { skipIntercept: true }
      )
        .then(
          (response: { data?: { data?: WorkflowDefinition } }) => {
            const data = response.data?.data;

            if (
              data &&
              typeof data === 'object' &&
              typeof data.id === 'string' &&
              typeof data.name === 'string'
            ) {
              return normalizeWorkflow(data);
            }

            const fallback = defaultWorkflows.find((w) => w.id === id);
            return fallback ?? defaultWorkflows[0];
          }
        )
        .catch(() => {
          const fallback = defaultWorkflows.find((w) => w.id === id);
          return fallback ?? defaultWorkflows[0];
        });
    },
    { staleTime: 30_000, enabled: Boolean(id) }
  );
}

/** Map frontend WorkflowDefinition back to API payload format */
function toApiPayload(workflow: WorkflowDefinition): Record<string, any> {
  const trigger = workflow.trigger ?? { entity: '', event: '', description: '', conditions: [], match: 'and' };

  return {
    id: workflow.id,
    name: workflow.name,
    description: workflow.description,
    trigger_entity: trigger.entity,
    trigger_event: trigger.event,
    trigger_description: trigger.description,
    trigger_conditions: trigger.conditions,
    trigger_match: trigger.match,
    is_active: workflow.status === 'active',
    steps: (workflow.steps ?? []).map((step) => ({
      id: step.id,
      name: step.name,
      type: step.kind,
      kind: step.kind,
      action: step.action_id,
      action_id: step.action_id,
      params: step.config,
      config: step.config,
    })),
    edges: workflow.edges,
  };
}

export function useSaveWorkflow() {
  const navigate = useNavigate();

  return (
    workflow: WorkflowDefinition,
    isNew: boolean,
    onValidationError?: (bag: ValidationBag) => void
  ) => {
    toast.processing();

    const method = isNew ? 'POST' : 'PUT';
    const url = isNew
      ? endpoint('/api/v1/workflows')
      : endpoint('/api/v1/workflows/:id', { id: workflow.id });

    const payload = toApiPayload(workflow);

    return request(method, url, payload)
      .then(
        (response: { data?: { data?: WorkflowDefinition } }) => {
          const saved = response.data?.data;

          toast.success(isNew ? 'created_workflow' : 'updated_workflow');
          $refetch(['workflows']);

          if (isNew && saved?.id) {
            navigate(
              route('/workflows/:id/edit', { id: saved.id })
            );
          }

          return saved;
        }
      )
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();

          if (error.response.data && onValidationError) {
            onValidationError(error.response.data);
          }
        } else {
          toast.error();
        }
      });
  };
}

export function useWorkflowActions() {
  const navigate = useNavigate();

  const bulk = (ids: string[], action: string) => {
    toast.processing();

    return request('POST', endpoint('/api/v1/workflows/bulk'), {
      ids,
      action,
    })
      .then(() => {
        toast.success(`${action}_workflow`);
        $refetch(['workflows']);
      })
      .catch(() => {
        toast.error();
      });
  };

  return {
    archive: (id: string) => bulk([id], 'archive'),
    restore: (id: string) => bulk([id], 'restore'),
    remove: (id: string) =>
      bulk([id], 'delete').then(() => navigate('/workflows')),
    clone: (id: string) => {
      toast.processing();

      return request(
        'POST',
        endpoint('/api/v1/workflows/:id/clone', { id })
      )
        .then(
          (response: { data?: { data?: WorkflowDefinition } }) => {
            const cloned = response.data?.data;
            toast.success('cloned_workflow');
            $refetch(['workflows']);

            if (cloned?.id) {
              navigate(
                route('/workflows/:id/edit', { id: cloned.id })
              );
            }
          }
        )
        .catch(() => {
          toast.error();
        });
    },
    activate: (id: string) => bulk([id], 'activate'),
    deactivate: (id: string) => bulk([id], 'deactivate'),
  };
}

export function useWorkflowRunActions() {
  return {
    cancel: (runId: string) => {
      toast.processing();

      return request(
        'POST',
        endpoint('/api/v1/workflow_runs/:id/cancel', { id: runId })
      )
        .then(() => {
          toast.success('cancelled_workflow_run');
          $refetch(['workflow_runs']);
        })
        .catch(() => {
          toast.error();
        });
    },
    advance: (runId: string) => {
      toast.processing();

      return request(
        'POST',
        endpoint('/api/v1/workflow_runs/:id/advance', { id: runId })
      )
        .then(() => {
          toast.success('advanced_workflow_run');
          $refetch(['workflow_runs']);
        })
        .catch(() => {
          toast.error();
        });
    },
  };
}
