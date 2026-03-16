import '@xyflow/react/dist/style.css';

import { useMediaQuery } from 'react-responsive';
import { useCallback, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Default } from '$app/components/layouts/Default';
import { Button, InputField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  createBlankWorkflow,
  defaultWorkflowTemplates,
} from '../helpers/workflowTemplates';
import { useWorkflowMetadata } from '../hooks/useWorkflowMetadata';
import { useWorkflowBuilder } from '../hooks/useWorkflowBuilder';
import {
  useWorkflowQuery,
  useSaveWorkflow,
} from '../hooks/useWorkflows';
import { TriggerConfigPanel } from '../components/builder/TriggerConfigPanel';
import { StepPalette } from '../components/builder/StepPalette';
import { WorkflowCanvas } from '../components/builder/WorkflowCanvas';
import { PropertiesPanel } from '../components/builder/PropertiesPanel';
import { WorkflowActionMetadata, WorkflowDefinition } from '../types/workflow';
import { Spinner } from '$app/components/Spinner';

export function WorkflowBuilder() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });
  const templateId = searchParams.get('template');
  const isNew = !id;

  const { data: existingWorkflow, isLoading: isLoadingWorkflow } =
    useWorkflowQuery(id);

  const initialWorkflow = useMemo(() => {
    if (id && existingWorkflow) {
      return existingWorkflow;
    }

    if (templateId) {
      const template = defaultWorkflowTemplates.find(
        (t) => t.id === templateId
      );

      return template?.workflow ?? createBlankWorkflow();
    }

    return createBlankWorkflow();
  }, [id, existingWorkflow, templateId]);

  const [workflow, setWorkflow] = useState<WorkflowDefinition>(initialWorkflow);
  const [isSaving, setIsSaving] = useState(false);

  // Re-sync when API data arrives
  const [synced, setSynced] = useState(false);
  if (id && existingWorkflow && !synced) {
    setWorkflow(existingWorkflow);
    setSynced(true);
  }

  const { actions, triggers } = useWorkflowMetadata();
  const builder = useWorkflowBuilder(workflow, actions);
  const saveWorkflow = useSaveWorkflow();

  const title = id ? t('edit_workflow') : t('new_workflow');

  const handleSave = useCallback(() => {
    if (isSaving) return;

    setIsSaving(true);
    saveWorkflow(
      {
        ...builder.workflow,
        name: workflow.name,
        description: workflow.description,
        trigger: workflow.trigger,
      },
      isNew
    ).finally(() => setIsSaving(false));
  }, [builder.workflow, isNew, isSaving, saveWorkflow, workflow]);

  const syncStep = (stepId: string) => {
    const step = builder.workflow.steps.find((entry) => entry.id === stepId);

    if (step) {
      setWorkflow(builder.workflow);
      builder.setSelectedNodeId(stepId);
    }
  };

  const addStep = (action: WorkflowActionMetadata) => {
    if (
      selectedStep &&
      selectedStep.kind !== 'branch' &&
      selectedStep.kind !== 'end'
    ) {
      const outgoingCount = builder.edges.filter(
        (edge) => edge.source === selectedStep.id
      ).length;

      addStepAt(
        action,
        {
          x: 420 + outgoingCount * 40,
          y: 120 + outgoingCount * 80,
        },
        { parentId: selectedStep.id }
      );

      return;
    }

    addStepAt(action, {
      x: 180,
      y: 180 + builder.nodes.length * 36,
    });
  };

  const addStepAt = (
    action: WorkflowActionMetadata,
    position: { x: number; y: number },
    options?: {
      parentId?: string;
      branchHandle?: 'branch-left' | 'branch-right';
    }
  ) => {
    const newId = `${action.id}-${Date.now()}`;
    const nextNodes = [
      ...builder.nodes,
      {
        id: newId,
        type: action.type,
        position,
        data: {
          label: action.name,
          subtitle: action.description,
          kind: action.type,
          color:
            action.type === 'action'
              ? '#10B981'
              : action.type === 'branch'
                ? '#8B5CF6'
                : action.type === 'end'
                  ? '#6B7280'
                  : '#F59E0B',
          icon: action.icon,
          status: 'valid' as const,
          leftLabel: action.id === 'branch' ? 'True' : undefined,
          rightLabel: action.id === 'branch' ? 'False' : undefined,
        },
      },
    ];

    builder.setNodes(nextNodes as any);

    const nextEdges = options?.parentId
      ? [
          ...builder.edges,
          {
            id: `${options.parentId}-${newId}-${Date.now()}`,
            source: options.parentId,
            target: newId,
            type: 'workflow',
            sourceHandle: options.branchHandle,
          },
        ]
      : builder.edges;

    builder.setEdges(nextEdges as any);

    setWorkflow({
      ...builder.workflow,
      steps: [
        ...builder.workflow.steps,
        {
          id: newId,
          kind: action.type,
          action_id: action.id,
          name: action.name,
          config:
            action.id === 'branch'
              ? { left_label: 'True', right_label: 'False' }
              : {},
        },
      ],
      edges: nextEdges as any,
    });

    builder.setSelectedNodeId(newId);
  };

  const removeSelectedStep = () => {
    if (!selectedStep || selectedStep.kind === 'trigger') {
      return;
    }

    const nextNodes = builder.nodes.filter(
      (node) => node.id !== selectedStep.id
    );
    const nextSteps = builder.workflow.steps.filter(
      (step) => step.id !== selectedStep.id
    );
    const nextEdges = builder.edges.filter(
      (edge) =>
        edge.source !== selectedStep.id && edge.target !== selectedStep.id
    );

    builder.setNodes(nextNodes as any);
    builder.setEdges(nextEdges as any);
    builder.setSelectedNodeId('trigger');

    setWorkflow({
      ...builder.workflow,
      steps: nextSteps,
      edges: nextEdges as any,
    });
  };

  const selectedStep = builder.workflow.steps.find(
    (step) => step.id === builder.selectedNodeId
  );

  const validationMessages = useMemo(
    () => builder.issues.map((issue) => issue.message),
    [builder.issues]
  );

  if (!isDesktop) {
    return (
      <Default
        title={t('workflow_builder')}
        breadcrumbs={[{ name: t('workflows'), href: '/workflows' }]}
      >
        <div
          className="rounded-lg border border-dashed p-8 text-center"
          style={{ color: colors.$3, borderColor: colors.$4 }}
        >
          {t('desktop_only_feature')}
        </div>
      </Default>
    );
  }

  if (id && isLoadingWorkflow) {
    return (
      <Default
        title={title}
        breadcrumbs={[{ name: t('workflows'), href: '/workflows' }]}
      >
        <Spinner />
      </Default>
    );
  }

  return (
    <Default
      title={title}
      breadcrumbs={[
        { name: t('workflows'), href: '/workflows' },
        {
          name: title,
          href: id ? `/workflows/${id}/edit` : '/workflows/create',
        },
      ]}
    >
      <div className="space-y-4">
        <div
          className="flex items-center justify-between rounded-lg border p-4"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$4,
          }}
        >
          <div className="flex-1 space-y-2">
            <InputField
              value={workflow.name}
              onValueChange={(value) =>
                setWorkflow({ ...workflow, name: value })
              }
              label={t('name')}
            />
            <div className="text-sm" style={{ color: colors.$3 }}>
              {workflow.trigger.description || t('configure_trigger')}
            </div>
          </div>
          <div className="ml-4 flex gap-3">
            <Button to="/workflows" type="secondary">
              {t('cancel')}
            </Button>
            <Button
              behavior="button"
              disabled={builder.issues.length > 0 || isSaving}
              onClick={handleSave}
            >
              {t('save')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <TriggerConfigPanel
              workflow={workflow}
              triggers={triggers}
              onChange={setWorkflow}
            />
            <StepPalette actions={actions} onAddStep={addStep} />
          </div>

          <div>
            <WorkflowCanvas
              nodes={builder.nodes as any}
              edges={builder.edges}
              onNodesChange={builder.onNodesChange}
              onEdgesChange={builder.onEdgesChange}
              onConnect={builder.onConnect}
              onNodeClick={(_, node) => syncStep(node.id)}
              onDropStep={({ x, y, actionId }) => {
                const action = actions.find(
                  (entry) => entry.id === actionId
                );

                if (action) {
                  addStepAt(action, { x, y });
                }
              }}
            />
          </div>
        </div>

        {builder.issues.length > 0 && (
          <div
            className="rounded-lg border p-4"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              borderColor: 'rgba(239, 68, 68, 0.2)',
            }}
          >
            <div className="text-sm font-semibold text-red-700">
              {t('validation_issues')}
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm text-red-600">
              {validationMessages.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        <PropertiesPanel
          step={selectedStep}
          steps={builder.workflow.steps}
          edges={builder.workflow.edges}
          actions={actions}
          onChange={(step) =>
            setWorkflow({
              ...builder.workflow,
              steps: builder.workflow.steps.map((entry) =>
                entry.id === step.id ? step : entry
              ),
            })
          }
          onAddConnectedStep={(actionId, options) => {
            if (!selectedStep) {
              return;
            }

            const action = actions.find(
              (entry) => entry.id === actionId
            );

            if (!action) {
              return;
            }

            const outgoingCount = builder.edges.filter(
              (edge) => edge.source === selectedStep.id
            ).length;

            addStepAt(
              action,
              {
                x:
                  selectedStep.kind === 'branch'
                    ? 560
                    : 420 + outgoingCount * 40,
                y:
                  selectedStep.kind === 'branch'
                    ? options?.branchHandle === 'branch-left'
                      ? 120
                      : 300
                    : 120 + outgoingCount * 80,
              },
              {
                parentId: selectedStep.id,
                branchHandle: options?.branchHandle,
              }
            );
          }}
          onRemoveStep={removeSelectedStep}
        />
      </div>
    </Default>
  );
}

export default WorkflowBuilder;
