import { Button, InputField, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { ConditionFieldDef, WorkflowCondition } from '../../types/workflow';
import { MdClose } from 'react-icons/md';

const stringOperators = [
  { label: 'equals', value: 'eq' },
  { label: 'not_equals', value: 'neq' },
  { label: 'contains', value: 'contains' },
  { label: 'is_empty', value: 'empty' },
  { label: 'is_not_empty', value: 'not_empty' },
];

const numberOperators = [
  { label: 'equals', value: 'eq' },
  { label: 'not_equals', value: 'neq' },
  { label: 'greater_than', value: 'gt' },
  { label: 'less_than', value: 'lt' },
  { label: 'greater_than_or_equal', value: 'gte' },
  { label: 'less_than_or_equal', value: 'lte' },
];

const dateOperators = [
  { label: 'after', value: 'date_gt' },
  { label: 'before', value: 'date_lt' },
  { label: 'on', value: 'date_eq' },
  { label: 'has_passed', value: 'date_past' },
  { label: 'is_in_the_future', value: 'date_future' },
];

const dateUnits = [
  { label: 'days', value: 'days' },
  { label: 'hours', value: 'hours' },
  { label: 'weeks', value: 'weeks' },
];

const noValueOperators = ['empty', 'not_empty', 'date_past', 'date_future'];

function getOperatorsForType(type: ConditionFieldDef['type']) {
  switch (type) {
    case 'number':
      return numberOperators;
    case 'date':
      return dateOperators;
    default:
      return stringOperators;
  }
}

export function ConditionBuilder({
  conditions,
  fields,
  match,
  onMatchChange,
  onChange,
}: {
  conditions: WorkflowCondition[];
  fields: ConditionFieldDef[];
  match: 'and' | 'or';
  onMatchChange: (value: 'and' | 'or') => void;
  onChange: (next: WorkflowCondition[]) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const handleRemoveCondition = (id: string) => {
    onChange(conditions.filter((c) => c.id !== id));
  };

  const getFieldDef = (key: string) => fields.find((f) => f.key === key);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4
          className="text-sm font-semibold"
          style={{ color: colors.$3 }}
        >
          {t('condition')}
        </h4>
        <div className="flex overflow-hidden rounded-md border" style={{ borderColor: colors.$4 }}>
          <button
            type="button"
            onClick={() => onMatchChange('and')}
            className="px-3 py-1 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: match === 'and' ? '#3B82F6' : 'transparent',
              color: match === 'and' ? '#fff' : colors.$3,
            }}
          >
            AND
          </button>
          <button
            type="button"
            onClick={() => onMatchChange('or')}
            className="px-3 py-1 text-xs font-semibold transition-colors"
            style={{
              backgroundColor: match === 'or' ? '#3B82F6' : 'transparent',
              color: match === 'or' ? '#fff' : colors.$3,
            }}
          >
            OR
          </button>
        </div>
      </div>

      {conditions.map((condition, index) => {
        const fieldDef = getFieldDef(condition.field);
        const fieldType = fieldDef?.type ?? 'string';
        const operators = getOperatorsForType(fieldType);
        const isDateOperator = (condition.operator ?? '').startsWith('date_');
        const needsValue = !noValueOperators.includes(condition.operator ?? '');

        return (
          <div
            key={condition.id}
            className="rounded-lg border p-3"
            style={{ borderColor: colors.$4 }}
          >
            <div className="mb-2 flex items-center justify-between">
              <span
                className="text-xs font-medium"
                style={{ color: colors.$3, opacity: 0.5 }}
              >
                {t('condition')} {index + 1}
                {fieldDef && (
                  <span
                    className="ml-2 rounded-full px-1.5 py-0.5"
                    style={{
                      backgroundColor: fieldType === 'date' ? '#DBEAFE' : fieldType === 'number' ? '#D1FAE5' : '#F3F4F6',
                      color: fieldType === 'date' ? '#1D4ED8' : fieldType === 'number' ? '#065F46' : '#374151',
                      fontSize: '10px',
                    }}
                  >
                    {fieldType}
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveCondition(condition.id)}
                className="flex h-5 w-5 items-center justify-center rounded text-red-500 transition hover:bg-red-50 hover:text-red-700"
              >
                <MdClose size={14} />
              </button>
            </div>

            <div className="space-y-2">
              <SelectField
                customSelector
                label={t('field')}
                value={condition.field}
                onValueChange={(value) => {
                  const newFieldType = getFieldDef(value)?.type ?? 'string';
                  const firstOperator = getOperatorsForType(newFieldType)[0]?.value ?? '';

                  onChange(
                    conditions.map((entry) =>
                      entry.id === condition.id
                        ? { ...entry, field: value, operator: firstOperator, value: '' }
                        : entry
                    )
                  );
                }}
              >
                {fields.map((field) => (
                  <option key={field.key} value={field.key}>
                    {field.label}
                  </option>
                ))}
              </SelectField>

              {condition.field && (
                <SelectField
                  customSelector
                  label={t('operator')}
                  value={condition.operator}
                  onValueChange={(value) =>
                    onChange(
                      conditions.map((entry) =>
                        entry.id === condition.id
                          ? { ...entry, operator: value, value: noValueOperators.includes(value) ? '' : entry.value }
                          : entry
                      )
                    )
                  }
                >
                  {operators.map((operator) => (
                    <option key={operator.value} value={operator.value}>
                      {t(operator.label)}
                    </option>
                  ))}
                </SelectField>
              )}

              {condition.operator && needsValue && (
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <InputField
                      label={t('value')}
                      value={condition.value}
                      placeholder={isDateOperator ? '3' : t('enter_value')}
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
                  {isDateOperator && (
                    <div style={{ minWidth: '90px' }}>
                      <SelectField
                        customSelector
                        value={(condition as any).unit ?? 'days'}
                        onValueChange={(value) =>
                          onChange(
                            conditions.map((entry) =>
                              entry.id === condition.id
                                ? { ...entry, unit: value } as any
                                : entry
                            )
                          )
                        }
                      >
                        {dateUnits.map((unit) => (
                          <option key={unit.value} value={unit.value}>
                            {t(unit.label)}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      <Button
        type="secondary"
        behavior="button"
        onClick={() => {
          const defaultField = fields[0]?.key ?? '';
          const defaultFieldType = fields[0]?.type ?? 'string';
          const defaultOperator = getOperatorsForType(defaultFieldType)[0]?.value ?? '';

          onChange([
            ...conditions,
            {
              id: `condition-${Date.now()}`,
              field: defaultField,
              operator: defaultOperator,
              value: '',
            },
          ]);
        }}
      >
        {t('add')}
      </Button>
    </div>
  );
}
