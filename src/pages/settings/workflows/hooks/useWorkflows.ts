import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { route } from '$app/common/helpers/route';
import { WorkflowDefinition } from '../types/workflow';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { defaultWorkflows } from '../helpers/workflowTemplates';

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
        .then((response: { data?: { data?: WorkflowDefinition[] } }) =>
          Array.isArray(response.data?.data)
            ? response.data!.data!
            : defaultWorkflows
        )
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
          (response: { data?: { data?: WorkflowDefinition } }) =>
            response.data?.data
        )
        .catch(() => {
          const fallback = defaultWorkflows.find((w) => w.id === id);
          return fallback ?? defaultWorkflows[0];
        });
    },
    { staleTime: 30_000, enabled: Boolean(id) }
  );
}

export function useSaveWorkflow() {
  const navigate = useNavigate();

  return (workflow: WorkflowDefinition, isNew: boolean) => {
    toast.processing();

    const method = isNew ? 'POST' : 'PUT';
    const url = isNew
      ? endpoint('/api/v1/workflows')
      : endpoint('/api/v1/workflows/:id', { id: workflow.id });

    return request(method, url, workflow)
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
        }

        throw error;
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
