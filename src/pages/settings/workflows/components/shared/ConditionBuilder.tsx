import { Button, InputField, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { WorkflowCondition } from '../../types/workflow';

const operators = [
  { label: 'Equals', value: 'eq' },
  { label: 'Not equals', value: 'neq' },
  { label: 'Contains', value: 'contains' },
  { label: 'Greater than', value: 'gt' },
  { label: 'Less than', value: 'lt' },
];

export function ConditionBuilder({
  conditions,
  fields,
  match,
  onMatchChange,
  onChange,
}: {
  conditions: WorkflowCondition[];
  fields: string[];
  match: 'and' | 'or';
  onMatchChange: (value: 'and' | 'or') => void;
  onChange: (next: WorkflowCondition[]) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const handleRemoveCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4
          className="text-sm font-semibold"
          style={{ color: colors.$3 }}
        >
          {t('conditions')}
        </h4>
        <SelectField
          customSelector
          value={match}
          onValueChange={(value) => onMatchChange(value as 'and' | 'or')}
          className="min-w-[120px]"
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </SelectField>
      </div>

      {conditions.map((condition) => (
        <div key={condition.id} className="flex items-start gap-2">
          <div className="grid flex-1 gap-3 md:grid-cols-3">
            <SelectField
              customSelector
              value={condition.field}
              onValueChange={(value) =>
                onChange(
                  conditions.map((entry) =>
                    entry.id === condition.id
                      ? { ...entry, field: value }
                      : entry
                  )
                )
              }
            >
              <option value="">{t('field')}</option>
              {fields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </SelectField>

            <SelectField
              customSelector
              value={condition.operator}
              onValueChange={(value) =>
                onChange(
                  conditions.map((entry) =>
                    entry.id === condition.id
                      ? { ...entry, operator: value }
                      : entry
                  )
                )
              }
            >
              <option value="">{t('operator')}</option>
              {operators.map((operator) => (
                <option key={operator.value} value={operator.value}>
                  {operator.label}
                </option>
              ))}
            </SelectField>

            <InputField
              value={condition.value}
              placeholder={t('value')}
              onValueChange={(value) =>
                onChange(
                  conditions.map((entry) =>
                    entry.id === condition.id
                      ? { ...entry, value }
                      : entry
                  )
                )
              }
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveCondition(condition.id)}
            className="mt-2 text-sm text-red-500 hover:text-red-700"
          >
            &times;
          </button>
        </div>
      ))}

      <Button
        type="secondary"
        behavior="button"
        onClick={() =>
          onChange([
            ...conditions,
            {
              id: `condition-${Date.now()}`,
              field: '',
              operator: '',
              value: '',
            },
          ])
        }
      >
        {t('add_condition')}
      </Button>
    </div>
  );
}
