import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  ConditionFieldDef,
  WorkflowDefinition,
  WorkflowTriggerMetadata,
} from '../../types/workflow';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { ConditionBuilder } from '../shared/ConditionBuilder';
import { MdBolt, MdInfoOutline, MdLock } from 'react-icons/md';

export function TriggerConfigPanel({
  workflow,
  triggers,
  conditionFields,
  errors,
  readOnly,
  onChange,
}: {
  workflow: WorkflowDefinition;
  triggers: WorkflowTriggerMetadata[];
  conditionFields?: ConditionFieldDef[];
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

  const effectiveEntity = wfTrigger.entity || entityOptions[0] || '';
  const isManual = effectiveEntity.toLowerCase() === 'manual';
  const availableEvents = triggers.filter(
    (trigger) => trigger.entity === effectiveEntity
  );
  const effectiveEvent = wfTrigger.event || availableEvents[0]?.event || '';

  const selectedTrigger = triggers.find(
    (trigger) =>
      trigger.entity === effectiveEntity &&
      trigger.event === effectiveEvent
  );

  // Auto-select first entity/event when trigger is blank and options are available
  if (
    !readOnly &&
    entityOptions.length > 0 &&
    (!wfTrigger.entity || (!wfTrigger.event && availableEvents.length > 0))
  ) {
    const autoEntity = wfTrigger.entity || entityOptions[0];
    const eventsForEntity = triggers.filter((tr) => tr.entity === autoEntity);
    const autoEvent = wfTrigger.event || eventsForEntity[0]?.event || '';
    const autoDescription = eventsForEntity.find((e) => e.event === autoEvent)?.label ?? '';

    // Use setTimeout to avoid updating state during render
    setTimeout(() => {
      onChange({
        ...workflow,
        trigger: {
          ...wfTrigger,
          entity: autoEntity,
          event: autoEvent,
          description: autoDescription,
        },
      });
    }, 0);
  }

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
              {selectedTrigger?.description || `${t(wfTrigger.entity)} ${t(wfTrigger.event)}`}
            </p>
          </div>
          <MdLock size={14} style={{ color: colors.$3, opacity: 0.3 }} />
        </div>

        <div className="space-y-2">
          <div>
            <div className="text-xs font-medium" style={{ color: colors.$3, opacity: 0.5 }}>
              {isManual ? t('type') : t('entity')}
            </div>
            <div className="text-sm font-medium" style={{ color: colors.$3 }}>
              {wfTrigger.entity ? t(wfTrigger.entity) : '-'}
            </div>
          </div>
          {!isManual && (
            <div>
              <div className="text-xs font-medium" style={{ color: colors.$3, opacity: 0.5 }}>
                {t('event')}
              </div>
              <div className="text-sm font-medium" style={{ color: colors.$3 }}>
                {wfTrigger.event ? t(wfTrigger.event) : '-'}
              </div>
            </div>
          )}
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
                  {t(cond.field)} {cond.operator} {cond.value}
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
        label={t('module')}
        value={effectiveEntity}
        onValueChange={(value) => {
          const manualTrigger = value.toLowerCase() === 'manual'
            ? triggers.find((tr) => tr.entity.toLowerCase() === 'manual')
            : undefined;

          const eventsForEntity = triggers.filter((tr) => tr.entity === value);
          const firstEvent = manualTrigger
            ? manualTrigger.event
            : eventsForEntity[0]?.event ?? '';
          const firstDescription = manualTrigger
            ? manualTrigger.label
            : eventsForEntity.find((e) => e.event === firstEvent)?.label ?? '';

          onChange({
            ...workflow,
            trigger: {
              ...wfTrigger,
              entity: value,
              event: firstEvent,
              description: firstDescription ?? '',
              conditions: manualTrigger ? [] : wfTrigger.conditions,
            },
          });
        }}
        errorMessage={
          errors?.errors?.trigger_entity ??
          errors?.errors?.['trigger.entity'] ??
          errors?.errors?.entity
        }
      >
        {entityOptions.map((entity) => (
          <option key={entity} value={entity}>
            {t(entity)}
          </option>
        ))}
      </SelectField>

      {!isManual && (
        <SelectField
          customSelector
          label={t('event')}
          value={effectiveEvent}
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
            errors?.errors?.trigger_event ??
            errors?.errors?.['trigger.event'] ??
            errors?.errors?.event
          }
        >
          {availableEvents.map((item) => (
            <option key={item.id} value={item.event}>
              {t(item.event)}
            </option>
          ))}
        </SelectField>
      )}

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

      {!isManual && (
        <ConditionBuilder
          match={wfTrigger.match}
          fields={conditionFields ?? []}
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
      )}
    </div>
  );
}
