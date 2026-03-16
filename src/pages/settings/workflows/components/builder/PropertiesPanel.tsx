import { Button, InputField, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { WorkflowActionMetadata, WorkflowStep } from '../../types/workflow';
import { useContextVariables } from '../../hooks/useContextVariables';
import { EntityRefSelector } from '../shared/EntityRefSelector';
import { VariableChips } from '../shared/VariableChips';
import { Edge } from '@xyflow/react';

export function PropertiesPanel({
  step,
  actions,
  steps,
  edges,
  onChange,
  onAddConnectedStep,
  onRemoveStep,
}: {
  step?: WorkflowStep;
  actions: WorkflowActionMetadata[];
  steps: WorkflowStep[];
  edges: Edge[];
  onChange: (step: WorkflowStep) => void;
  onAddConnectedStep: (
    actionId: string,
    options?: { branchHandle?: 'branch-left' | 'branch-right' }
  ) => void;
  onRemoveStep: () => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const action = actions.find((entry) => entry.id === step?.action_id);
  const contextVariables = useContextVariables(
    step?.id,
    steps,
    edges,
    actions
  );
  const fields = Array.isArray(action?.params_schema)
    ? action!.params_schema
    : [];
  const actionGroups = Array.from(
    new Set(actions.map((entry) => entry.category))
  );

  if (!step) {
    return null;
  }

  return (
    <div
      className="mt-4 space-y-4 rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3
            className="text-base font-semibold"
            style={{ color: colors.$3 }}
          >
            {t('properties')}
          </h3>
          <p
            className="text-sm"
            style={{ color: colors.$3, opacity: 0.6 }}
          >
            {t('configure_selected_step')}
          </p>
        </div>
        <VariableChips values={contextVariables} />
      </div>

      <InputField
        label={t('step_name')}
        value={step.name}
        onValueChange={(value) => onChange({ ...step, name: value })}
      />

      <div
        className="rounded-lg border p-4"
        style={{ borderColor: colors.$4 }}
      >
        <div className="mb-3">
          <div
            className="text-sm font-semibold"
            style={{ color: colors.$3 }}
          >
            {t('build_flow')}
          </div>
          <div
            className="text-xs"
            style={{ color: colors.$3, opacity: 0.6 }}
          >
            {t('add_next_step_description')}
          </div>
        </div>

        <div className="space-y-3">
          {step.kind === 'branch' ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <div
                className="rounded-lg border p-3"
                style={{
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  backgroundColor: 'rgba(16, 185, 129, 0.05)',
                }}
              >
                <div className="mb-3 text-sm font-semibold text-emerald-700">
                  {t('left_path')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {actions.map((entry) => (
                    <button
                      key={`left-${entry.id}`}
                      type="button"
                      onClick={() =>
                        onAddConnectedStep(entry.id, {
                          branchHandle: 'branch-left',
                        })
                      }
                      className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                      style={{
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        color: colors.$3,
                      }}
                    >
                      {entry.name}
                    </button>
                  ))}
                </div>
              </div>

              <div
                className="rounded-lg border p-3"
                style={{
                  borderColor: 'rgba(245, 158, 11, 0.3)',
                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                }}
              >
                <div className="mb-3 text-sm font-semibold text-amber-700">
                  {t('right_path')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {actions.map((entry) => (
                    <button
                      key={`right-${entry.id}`}
                      type="button"
                      onClick={() =>
                        onAddConnectedStep(entry.id, {
                          branchHandle: 'branch-right',
                        })
                      }
                      className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                      style={{
                        borderColor: 'rgba(245, 158, 11, 0.3)',
                        color: colors.$3,
                      }}
                    >
                      {entry.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : step.kind !== 'end' ? (
            <div className="space-y-3">
              {actionGroups.map((group) => (
                <div key={group} className="space-y-2">
                  <div
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: colors.$3, opacity: 0.5 }}
                  >
                    {group}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {actions
                      .filter((entry) => entry.category === group)
                      .map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => onAddConnectedStep(entry.id)}
                          className="rounded-full border px-3 py-1.5 text-xs font-medium transition hover:opacity-80"
                          style={{
                            borderColor: colors.$4,
                            color: colors.$3,
                          }}
                        >
                          {entry.name}
                        </button>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {step.kind !== 'trigger' && (
            <Button
              type="secondary"
              behavior="button"
              onClick={onRemoveStep}
            >
              {t('remove_step')}
            </Button>
          )}
        </div>
      </div>

      {fields.map((field) => {
        if (field.type === 'entity_ref') {
          return (
            <EntityRefSelector
              key={field.key}
              label={field.label}
              value={step.config[field.key]}
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
          return (
            <SelectField
              key={field.key}
              customSelector
              label={field.label}
              value={step.config[field.key]}
              onValueChange={(value) =>
                onChange({
                  ...step,
                  config: { ...step.config, [field.key]: value },
                })
              }
            >
              <option value="">{t('select_value')}</option>
              {field.options?.map((option) => (
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
            value={step.config[field.key]}
            placeholder={field.placeholder}
            onValueChange={(value) =>
              onChange({
                ...step,
                config: { ...step.config, [field.key]: value },
              })
            }
          />
        );
      })}
    </div>
  );
}
