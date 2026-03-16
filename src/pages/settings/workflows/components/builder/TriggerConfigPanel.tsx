import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  WorkflowDefinition,
  WorkflowTriggerMetadata,
} from '../../types/workflow';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ConditionBuilder } from '../shared/ConditionBuilder';
import { MdBolt, MdInfoOutline, MdLock } from 'react-icons/md';

export function TriggerConfigPanel({
  workflow,
  triggers,
  errors,
  readOnly,
  onChange,
}: {
  workflow: WorkflowDefinition;
  triggers: WorkflowTriggerMetadata[];
  errors?: ValidationBag;
  readOnly?: boolean;
  onChange: (workflow: WorkflowDefinition) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const wfTrigger = workflow.trigger ?? { entity: '', event: '', description: '', conditions: [], match: 'and' as const };

  const entityOptions = Array.from(
    new Set(triggers.map((trigger) => trigger.entity))
  );
  const availableEvents = triggers.filter(
    (trigger) => trigger.entity === wfTrigger.entity
  );
  const selectedTrigger = triggers.find(
    (trigger) =>
      trigger.entity === wfTrigger.entity &&
      trigger.event === wfTrigger.event
  );

  if (readOnly) {
    return (
      <div
        className="space-y-4 rounded-lg border p-4"
        style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
      >
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: '#3B82F6' }}
          >
            <MdBolt size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-semibold"
              style={{ color: colors.$3 }}
            >
              {t('trigger')}
            </h3>
            <p className="text-xs" style={{ color: colors.$3, opacity: 0.5 }}>
              {selectedTrigger?.description || `${wfTrigger.entity} ${wfTrigger.event}`}
            </p>
          </div>
          <MdLock size={14} style={{ color: colors.$3, opacity: 0.3 }} />
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs font-medium" style={{ color: colors.$3, opacity: 0.5 }}>
              {t('entity')}
            </div>
            <div className="text-sm font-medium" style={{ color: colors.$3 }}>
              {wfTrigger.entity || '-'}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium" style={{ color: colors.$3, opacity: 0.5 }}>
              {t('event')}
            </div>
            <div className="text-sm font-medium" style={{ color: colors.$3 }}>
              {wfTrigger.event
                ? wfTrigger.event.charAt(0).toUpperCase() + wfTrigger.event.slice(1).replace(/_/g, ' ')
                : '-'}
            </div>
          </div>
        </div>

        {wfTrigger.conditions.length > 0 && (
          <div>
            <div className="text-xs font-medium" style={{ color: colors.$3, opacity: 0.5 }}>
              {t('conditions')} ({wfTrigger.match.toUpperCase()})
            </div>
            <ul className="mt-1 space-y-1">
              {wfTrigger.conditions.map((cond) => (
                <li
                  key={cond.id}
                  className="rounded px-2 py-1 text-xs"
                  style={{ backgroundColor: colors.$2, color: colors.$3 }}
                >
                  {cond.field} {cond.operator} {cond.value}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="space-y-4 rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white"
          style={{ backgroundColor: '#3B82F6' }}
        >
          <MdBolt size={16} />
        </span>
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: colors.$3 }}
          >
            {t('trigger')}
          </h3>
          <p className="text-xs" style={{ color: colors.$3, opacity: 0.5 }}>
            {t('choose_trigger_description')}
          </p>
        </div>
      </div>

      <SelectField
        customSelector
        label={t('entity')}
        value={wfTrigger.entity}
        onValueChange={(value) =>
          onChange({
            ...workflow,
            trigger: { ...wfTrigger, entity: value, event: '' },
          })
        }
        errorMessage={
          errors?.errors?.['trigger.entity'] ??
          errors?.errors?.entity
        }
      >
        <option value="">{t('select_entity')}</option>
        {entityOptions.map((entity) => (
          <option key={entity} value={entity}>
            {entity}
          </option>
        ))}
      </SelectField>

      <SelectField
        customSelector
        label={t('event')}
        value={wfTrigger.event}
        onValueChange={(value) =>
          onChange({
            ...workflow,
            trigger: {
              ...wfTrigger,
              event: value,
              description:
                availableEvents.find((e) => e.event === value)?.label ?? '',
            },
          })
        }
        errorMessage={
          errors?.errors?.['trigger.event'] ??
          errors?.errors?.event
        }
      >
        <option value="">{t('select_event')}</option>
        {availableEvents.map((item) => (
          <option key={item.id} value={item.event}>
            {item.event
              ? item.event.charAt(0).toUpperCase() +
                item.event.slice(1).replace(/_/g, ' ')
              : item.id}
          </option>
        ))}
      </SelectField>

      {selectedTrigger && selectedTrigger.description && (
        <div
          className="flex items-start gap-2 rounded-lg p-3 text-xs"
          style={{ backgroundColor: colors.$2, color: colors.$3 }}
        >
          <MdInfoOutline
            size={14}
            className="shrink-0"
            style={{ opacity: 0.5, marginTop: '1px' }}
          />
          {selectedTrigger.description}
        </div>
      )}

      <ConditionBuilder
        match={wfTrigger.match}
        fields={selectedTrigger?.condition_fields ?? []}
        conditions={wfTrigger.conditions}
        onMatchChange={(match) =>
          onChange({ ...workflow, trigger: { ...wfTrigger, match } })
        }
        onChange={(conditions) =>
          onChange({
            ...workflow,
            trigger: { ...wfTrigger, conditions },
          })
        }
      />
    </div>
  );
}
