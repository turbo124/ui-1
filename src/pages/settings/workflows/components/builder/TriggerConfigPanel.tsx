import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  WorkflowDefinition,
  WorkflowTriggerMetadata,
} from '../../types/workflow';
import { ConditionBuilder } from '../shared/ConditionBuilder';

export function TriggerConfigPanel({
  workflow,
  triggers,
  onChange,
}: {
  workflow: WorkflowDefinition;
  triggers: WorkflowTriggerMetadata[];
  onChange: (workflow: WorkflowDefinition) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const entityOptions = Array.from(
    new Set(triggers.map((trigger) => trigger.entity))
  );
  const availableEvents = triggers.filter(
    (trigger) => trigger.entity === workflow.trigger.entity
  );
  const selectedTrigger = triggers.find(
    (trigger) =>
      trigger.entity === workflow.trigger.entity &&
      trigger.event === workflow.trigger.event
  );

  return (
    <div
      className="space-y-4 rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <div>
        <h3
          className="text-base font-semibold"
          style={{ color: colors.$3 }}
        >
          {t('trigger')}
        </h3>
        <p className="text-sm" style={{ color: colors.$3, opacity: 0.6 }}>
          {t('choose_trigger_description')}
        </p>
      </div>

      <SelectField
        customSelector
        label={t('entity')}
        value={workflow.trigger.entity}
        onValueChange={(value) =>
          onChange({
            ...workflow,
            trigger: { ...workflow.trigger, entity: value, event: '' },
          })
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
        value={workflow.trigger.event}
        onValueChange={(value) =>
          onChange({
            ...workflow,
            trigger: {
              ...workflow.trigger,
              event: value,
              description:
                availableEvents.find((e) => e.event === value)?.label ?? '',
            },
          })
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

      {selectedTrigger && (
        <div
          className="rounded-lg p-3 text-sm"
          style={{ backgroundColor: colors.$2, color: colors.$3 }}
        >
          {selectedTrigger.description}
        </div>
      )}

      <ConditionBuilder
        match={workflow.trigger.match}
        fields={selectedTrigger?.condition_fields ?? []}
        conditions={workflow.trigger.conditions}
        onMatchChange={(match) =>
          onChange({ ...workflow, trigger: { ...workflow.trigger, match } })
        }
        onChange={(conditions) =>
          onChange({
            ...workflow,
            trigger: { ...workflow.trigger, conditions },
          })
        }
      />
    </div>
  );
}
