import { InputField, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  ConditionFieldDef,
  WorkflowActionMetadata,
  WorkflowDateField,
  WorkflowOperation,
  WorkflowStep,
} from '../../types/workflow';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useContextVariables } from '../../hooks/useContextVariables';
import { EntityRefSelector } from '../shared/EntityRefSelector';
import { Edge } from '@xyflow/react';
import {
  MdArrowUpward,
  MdArrowDownward,
  MdDelete,
  MdTouchApp,
} from 'react-icons/md';

export function PropertiesPanel({
  step,
  actions,
  steps,
  edges,
  errors,
  onChange,
  onRemoveStep,
  onMoveStep,
  conditionFields,
  dateFields,
  operations,
}: {
  step?: WorkflowStep;
  actions: WorkflowActionMetadata[];
  steps: WorkflowStep[];
  edges: Edge[];
  errors?: ValidationBag;
  onChange: (step: WorkflowStep) => void;
  onRemoveStep: () => void;
  onMoveStep: (direction: 'up' | 'down') => void;
  conditionFields: ConditionFieldDef[];
  dateFields: WorkflowDateField[];
  operations: WorkflowOperation[];
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const action = actions.find((entry) => entry.id === step?.action_id);
  const stepIndex = step ? steps.findIndex((s) => s.id === step.id) : -1;
  const stepErrors = (key: string) => {
    if (!errors?.errors || stepIndex < 0) return undefined;
    return (
      errors.errors[`steps.${stepIndex}.${key}`] ??
      errors.errors[`steps.${stepIndex}.config.${key}`]
    );
  };
  const contextVariables = useContextVariables(
    step?.id,
    steps,
    edges,
    actions
  );
  const fields = Array.isArray(action?.params_schema)
    ? action!.params_schema
    : [];
  const incomingEdge = step
    ? edges.find((e) => e.target === step.id)
    : undefined;
  const outgoingEdges = step
    ? edges.filter((e) => e.source === step.id)
    : [];
  const outgoingEdge = outgoingEdges[0];
  const parentStep = incomingEdge
    ? steps.find((s) => s.id === incomingEdge.source)
    : undefined;
  const childStep = outgoingEdge
    ? steps.find((s) => s.id === outgoingEdge.target)
    : undefined;
  const canMoveUp =
    !!step &&
    step.kind !== 'trigger' &&
    !!parentStep &&
    parentStep.kind !== 'trigger' &&
    edges.filter((e) => e.target === step.id).length === 1;
  const canMoveDown =
    !!step &&
    step.kind !== 'trigger' &&
    step.kind !== 'end' &&
    !!childStep &&
    childStep.kind !== 'end' &&
    edges.filter((e) => e.source === step.id).length === 1;

  if (!step) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center"
        style={{ borderColor: colors.$4 }}
      >
        <MdTouchApp
          size={28}
          className="mb-2"
          style={{ color: colors.$3, opacity: 0.3 }}
        />
        <div className="text-sm font-medium" style={{ color: colors.$3, opacity: 0.5 }}>
          {t('select_a_step')}
        </div>
        <div className="mt-1 text-xs" style={{ color: colors.$3, opacity: 0.3 }}>
          {t('click_a_node_to_configure')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Step header with type badge and actions */}
      <div
        className="rounded-lg border p-4"
        style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold"
              style={{
                backgroundColor: `${getKindColor(step.kind)}20`,
                color: getKindColor(step.kind),
              }}
            >
              {(step.kind ?? '').replace(/_/g, ' ')}
            </span>
            {action && (
              <span className="text-xs" style={{ color: colors.$3, opacity: 0.5 }}>
                {action.name}
              </span>
            )}
          </div>

          {step.kind !== 'trigger' && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={!canMoveUp}
                onClick={() => onMoveStep('up')}
                className="flex h-7 w-7 items-center justify-center rounded transition hover:opacity-80 disabled:opacity-20"
                style={{ color: colors.$3 }}
                title={String(t('move_up'))}
              >
                <MdArrowUpward size={16} />
              </button>
              <button
                type="button"
                disabled={!canMoveDown}
                onClick={() => onMoveStep('down')}
                className="flex h-7 w-7 items-center justify-center rounded transition hover:opacity-80 disabled:opacity-20"
                style={{ color: colors.$3 }}
                title={String(t('move_down'))}
              >
                <MdArrowDownward size={16} />
              </button>
              <button
                type="button"
                onClick={onRemoveStep}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
                title={String(t('remove_step'))}
              >
                <MdDelete size={18} />
              </button>
            </div>
          )}
        </div>

        <InputField
          label={t('trigger')}
          value={step.name}
          onValueChange={(value) => onChange({ ...step, name: value })}
          errorMessage={stepErrors('name')}
        />

        {/* Context variables */}
        {contextVariables.length > 0 && (
          <div className="mt-3">
            <div
              className="mb-1.5 text-xs font-medium"
              style={{ color: colors.$3, opacity: 0.5 }}
            >
              {t('available_variables')}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {contextVariables.map((cv) => (
                <span
                  key={cv.value}
                  className="rounded-md px-2 py-0.5 text-xs font-medium"
                  style={{ backgroundColor: colors.$2, color: colors.$3 }}
                >
                  {cv.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Step configuration fields */}
      {fields.length > 0 && (
        <div
          className="space-y-3 rounded-lg border p-4"
          style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
        >
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.$3, opacity: 0.5 }}
          >
            {t('configuration')}
          </div>

          {fields.map((field) => {
            if (field.type === 'entity_field') {
              return (
                <SelectField
                  key={field.key}
                  customSelector
                  label={field.label}
                  value={(step.config ?? {})[field.key]}
                  onValueChange={(value) =>
                    onChange({
                      ...step,
                      config: { ...step.config, [field.key]: value },
                    })
                  }
                  errorMessage={stepErrors(field.key)}
                >
                  <option value="">{t('select_value')}</option>
                  {conditionFields.map((cf) => (
                    <option key={cf.key} value={cf.key}>
                      {cf.label}
                    </option>
                  ))}
                </SelectField>
              );
            }

            if (field.type === 'operator') {
              return (
                <SelectField
                  key={field.key}
                  customSelector
                  label={field.label}
                  value={(step.config ?? {})[field.key]}
                  onValueChange={(value) =>
                    onChange({
                      ...step,
                      config: { ...step.config, [field.key]: value },
                    })
                  }
                  errorMessage={stepErrors(field.key)}
                >
                  <option value="">{t('select_value')}</option>
                  {operations.map((op) => (
                    <option key={op.key} value={op.key}>
                      {op.label}
                    </option>
                  ))}
                </SelectField>
              );
            }

            if (field.type === 'date_field') {
              return (
                <SelectField
                  key={field.key}
                  customSelector
                  label={field.label}
                  value={(step.config ?? {})[field.key]}
                  onValueChange={(value) =>
                    onChange({
                      ...step,
                      config: { ...step.config, [field.key]: value },
                    })
                  }
                  errorMessage={stepErrors(field.key)}
                >
                  <option value="">{t('select_value')}</option>
                  {dateFields.map((df) => (
                    <option key={df.key} value={df.key}>
                      {df.label}
                    </option>
                  ))}
                </SelectField>
              );
            }

            if (field.type === 'entity_ref') {
              return (
                <EntityRefSelector
                  key={field.key}
                  label={field.label}
                  value={(step.config ?? {})[field.key]}
                  options={contextVariables}
                  onValueChange={(value) =>
                    onChange({
                      ...step,
                      config: { ...step.config, [field.key]: value },
                    })
                  }
                />
              );
            }

            if (field.type === 'select') {
              // For offset_operator, use operations from API if available
              const fieldOptions =
                field.key === 'offset_operator' && operations.length > 0
                  ? operations.map((op) => ({ label: op.label, value: op.key }))
                  : field.options;

              return (
                <SelectField
                  key={field.key}
                  customSelector
                  label={field.label}
                  value={(step.config ?? {})[field.key]}
                  onValueChange={(value) =>
                    onChange({
                      ...step,
                      config: { ...step.config, [field.key]: value },
                    })
                  }
                  errorMessage={stepErrors(field.key)}
                >
                  <option value="">{t('select_value')}</option>
                  {fieldOptions?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </SelectField>
              );
            }

            return (
              <InputField
                key={field.key}
                label={field.label}
                element={field.type === 'textarea' ? 'textarea' : 'input'}
                value={(step.config ?? {})[field.key]}
                placeholder={field.placeholder}
                onValueChange={(value) =>
                  onChange({
                    ...step,
                    config: { ...step.config, [field.key]: value },
                  })
                }
                errorMessage={stepErrors(field.key)}
              />
            );
          })}
        </div>
      )}

    </div>
  );
}

function getKindColor(kind: string): string {
  switch (kind) {
    case 'trigger':
      return '#3B82F6';
    case 'action':
      return '#10B981';
    case 'wait_event':
    case 'wait_delay':
      return '#F59E0B';
    case 'branch':
      return '#8B5CF6';
    case 'end':
      return '#6B7280';
    default:
      return '#6B7280';
  }
}
