import '@xyflow/react/dist/style.css';

import { useMediaQuery } from 'react-responsive';
import { useCallback, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Default } from '$app/components/layouts/Default';
import { InputField } from '$app/components/forms';
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
import {
  WorkflowActionMetadata,
  WorkflowDefinition,
} from '../types/workflow';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Spinner } from '$app/components/Spinner';
import { MdClose, MdEdit } from 'react-icons/md';

/**
 * Outer shell — resolves the initial workflow data before mounting the builder.
 * This guarantees useWorkflowBuilder initializes with the correct data.
 */
export function WorkflowBuilder() {
  const [t] = useTranslation();
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' });
  const templateId = searchParams.get('template');
  const colors = useColorScheme();

  const { data: existingWorkflow, isLoading: isLoadingWorkflow } =
    useWorkflowQuery(id);

  const title = id ? t('edit_workflow') : t('new_workflow');

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

  if (id && (isLoadingWorkflow || !existingWorkflow)) {
    return (
      <Default
        title={title}
        breadcrumbs={[{ name: t('workflows'), href: '/workflows' }]}
      >
        <Spinner />
      </Default>
    );
  }

  const initialWorkflow = (() => {
    if (id && existingWorkflow) {
      return existingWorkflow;
    }

    if (templateId) {
      const template = defaultWorkflowTemplates.find(
        (tmpl) => tmpl.id === templateId
      );
      return template?.workflow ?? createBlankWorkflow();
    }

    return createBlankWorkflow();
  })();

  return (
    <WorkflowBuilderInner
      key={initialWorkflow.id}
      initialWorkflow={initialWorkflow}
      isNew={!id}
      editId={id}
    />
  );
}

/**
 * Inner builder — only mounts once we have the resolved workflow data.
 * The key={initialWorkflow.id} on the parent ensures a fresh mount per workflow.
 */
function WorkflowBuilderInner({
  initialWorkflow,
  isNew,
  editId,
}: {
  initialWorkflow: WorkflowDefinition;
  isNew: boolean;
  editId?: string;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const navigate = useNavigate();

  const { actions, triggers, dateFields, operations, fields } = useWorkflowMetadata();
  const builder = useWorkflowBuilder(initialWorkflow, actions, dateFields);
  const saveWorkflow = useSaveWorkflow();

  const [errors, setErrors] = useState<ValidationBag>();
  const [editingDescription, setEditingDescription] = useState(false);
  const [insertEdgeId, setInsertEdgeId] = useState<string | null>(null);

  const title = editId ? t('edit_workflow') : t('new_workflow');

  const isTriggerSelected = builder.selectedStep?.kind === 'trigger';

  const selectedTrigger = triggers.find(
    (tr) =>
      tr.entity === builder.trigger?.entity &&
      tr.event === builder.trigger?.event
  );
  const triggerConditionFields = selectedTrigger?.condition_fields ?? [];
  // Merge trigger-specific fields with general metadata fields, deduplicating by key
  const conditionFields = useMemo(() => {
    const seen = new Set(triggerConditionFields.map((f) => f.key));
    return [
      ...triggerConditionFields,
      ...fields.filter((f) => !seen.has(f.key)),
    ];
  }, [triggerConditionFields, fields]);

  const handleSave = useCallback(() => {
    setErrors(undefined);
    saveWorkflow(builder.workflow, isNew, setErrors);
  }, [builder.workflow, isNew, saveWorkflow]);

  const handleCancel = useCallback(() => {
    navigate('/workflows');
  }, [navigate]);

  const handleAddStep = (action: WorkflowActionMetadata) => {
    // Find the last step in the chain (the one with no outgoing edge)
    const stepsWithOutgoing = new Set(
      builder.edges.map((e) => e.source)
    );
    const lastInChain = builder.steps.find(
      (s) => !stepsWithOutgoing.has(s.id)
    );
    const appendAfter = lastInChain ?? builder.steps[builder.steps.length - 1];

    if (appendAfter) {
      builder.addStep(
        action,
        { x: 100, y: 60 + builder.nodes.length * 140 },
        { parentId: appendAfter.id }
      );
    } else {
      builder.addStep(action, {
        x: 100,
        y: 60 + builder.nodes.length * 140,
      });
    }
  };

  const handleRemoveSelectedStep = () => {
    if (builder.selectedStep) {
      builder.removeStep(builder.selectedStep.id);
    }
  };

  const handleEdgeInsertClick = useCallback((edgeId: string) => {
    setInsertEdgeId((current) => (current === edgeId ? null : edgeId));
  }, []);

  const handleEdgeInsertSelect = useCallback(
    (action: WorkflowActionMetadata) => {
      if (insertEdgeId) {
        builder.insertStepOnEdge(insertEdgeId, action);
        setInsertEdgeId(null);
      }
    },
    [insertEdgeId, builder]
  );

  const validationMessages = useMemo(
    () => builder.issues.map((issue) => issue.message),
    [builder.issues]
  );

  return (
    <Default
      title={title}
      breadcrumbs={[
        { name: t('workflows'), href: '/workflows' },
        {
          name: title,
          href: editId ? `/workflows/${editId}/edit` : '/workflows/create',
        },
      ]}
      onSaveClick={handleSave}
      onCancelClick={handleCancel}
    >
      <div className="space-y-4">
        {/* Workflow name & description */}
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$4,
          }}
        >
          <InputField
            value={builder.name}
            onValueChange={(value) => {
              setErrors(undefined);
              builder.setName(value);
            }}
            label={t('name')}
            errorMessage={errors?.errors?.name}
          />

          {editingDescription ? (
            <div className="mt-3">
              <InputField
                element="textarea"
                value={builder.description}
                onValueChange={(value) => {
                  setErrors(undefined);
                  builder.setDescription(value);
                }}
                label={t('description')}
                errorMessage={errors?.errors?.description}
              />
              <button
                type="button"
                onClick={() => setEditingDescription(false)}
                className="mt-1 text-xs hover:underline"
                style={{ color: colors.$3, opacity: 0.5 }}
              >
                {t('done')}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingDescription(true)}
              className="mt-2 flex items-center gap-1 text-xs hover:underline"
              style={{ color: colors.$3, opacity: 0.5 }}
            >
              <MdEdit size={12} />
              {builder.description
                ? builder.description.length > 80
                  ? builder.description.slice(0, 80) + '...'
                  : builder.description
                : t('add_description')}
            </button>
          )}
        </div>

        {/* 2-column layout: canvas | right panel */}
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* Canvas + edge insert picker */}
          <div className="relative">
            <WorkflowCanvas
              nodes={builder.nodes as any}
              edges={builder.edges}
              onNodesChange={builder.onNodesChange}
              onEdgesChange={builder.onEdgesChange}
              onConnect={builder.onConnect}
              onNodeClick={(_, node) => {
                builder.setSelectedNodeId(node.id);
                setInsertEdgeId(null);
              }}
              onDropStep={({ x, y, actionId }) => {
                const action = actions.find(
                  (entry) => entry.id === actionId
                );

                if (action) {
                  builder.addStep(action, { x, y });
                }
              }}
              onEdgeInsertClick={handleEdgeInsertClick}
            />

            {insertEdgeId && (
              <div
                className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-lg border p-3 shadow-lg"
                style={{
                  backgroundColor: colors.$1,
                  borderColor: colors.$4,
                  maxWidth: '500px',
                  width: '90%',
                }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.$3 }}
                  >
                    {t('insert_step')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInsertEdgeId(null)}
                    className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-100"
                    style={{ color: colors.$3 }}
                  >
                    <MdClose size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {actions.map((action) => (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => handleEdgeInsertSelect(action)}
                      className="rounded-md border px-2.5 py-1 text-xs font-medium transition hover:opacity-80"
                      style={{
                        borderColor: colors.$4,
                        color: colors.$3,
                      }}
                    >
                      {action.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column: context-sensitive panel */}
          <div className="sticky top-4 space-y-3">
            {isTriggerSelected ? (
              <TriggerConfigPanel
                key="trigger"
                workflow={builder.workflow}
                triggers={triggers}
                errors={errors}
                readOnly={!isNew}
                onChange={(updated) => {
                  setErrors(undefined);
                  builder.setTrigger(updated.trigger);
                }}
              />
            ) : (
              <PropertiesPanel
                key={builder.selectedNodeId}
                step={builder.selectedStep}
                steps={builder.steps}
                edges={builder.edges}
                actions={actions}
                errors={errors}
                onChange={(step) => {
                  setErrors(undefined);
                  builder.updateStep(step);
                }}
                onRemoveStep={handleRemoveSelectedStep}
                onMoveStep={(direction) => {
                  if (builder.selectedStep) {
                    builder.moveStep(builder.selectedStep.id, direction);
                  }
                }}
                conditionFields={conditionFields}
                dateFields={dateFields}
                operations={operations}
              />
            )}

            {/* Step palette — always visible for drag-and-drop */}
            <StepPalette actions={actions} onAddStep={handleAddStep} />

            {builder.issues.length > 0 && (
              <div
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                  borderColor: 'rgba(239, 68, 68, 0.2)',
                }}
              >
                <div className="text-xs font-semibold text-red-700">
                  {t('validation_issues')}
                </div>
                <ul className="mt-1.5 list-disc pl-4 text-xs text-red-600">
                  {validationMessages.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </Default>
  );
}

export default WorkflowBuilder;
