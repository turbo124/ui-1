import { InputField, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { ConditionFieldDef } from '../../types/workflow';

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

export function BranchConditionEditor({
  conditionField,
  conditionOperator,
  conditionValue,
  conditionUnit,
  conditionFields,
  onChange,
}: {
  conditionField: string;
  conditionOperator: string;
  conditionValue: string;
  conditionUnit: string;
  conditionFields: ConditionFieldDef[];
  onChange: (updates: Record<string, string>) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const selectedFieldDef = conditionFields.find((f) => f.key === conditionField);
  const fieldType = selectedFieldDef?.type ?? 'string';
  const operators = getOperatorsForType(fieldType);
  const isDateOperator = conditionOperator.startsWith('date_');
  const needsValue = !noValueOperators.includes(conditionOperator);

  return (
    <div
      className="space-y-3 rounded-lg border p-4"
      style={{ borderColor: colors.$4 }}
    >
      <div className="flex items-center justify-between">
        <div
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: colors.$3, opacity: 0.5 }}
        >
          {t('filter')}
        </div>
        {selectedFieldDef && (
          <span
            className="rounded-full px-1.5 py-0.5"
            style={{
              backgroundColor: fieldType === 'date' ? '#DBEAFE' : fieldType === 'number' ? '#D1FAE5' : '#F3F4F6',
              color: fieldType === 'date' ? '#1D4ED8' : fieldType === 'number' ? '#065F46' : '#374151',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            {fieldType}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className="shrink-0 text-xs font-semibold"
            style={{ color: colors.$3, opacity: 0.6 }}
          >
            If
          </span>
          <div className="flex-1">
            <SelectField
              customSelector
              value={conditionField}
              onValueChange={(value) => {
                const newFieldType = conditionFields.find((f) => f.key === value)?.type ?? 'string';
                const firstOperator = getOperatorsForType(newFieldType)[0]?.value ?? '';

                onChange({
                  condition_field: value,
                  condition_operator: firstOperator,
                  condition_value: '',
                  condition_unit: 'days',
                });
              }}
            >
              {conditionFields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </SelectField>
          </div>
        </div>

        {conditionField && (
          <SelectField
            customSelector
            value={conditionOperator}
            onValueChange={(value) =>
              onChange({
                condition_operator: value,
                condition_value: noValueOperators.includes(value) ? '' : conditionValue,
              })
            }
          >
            {operators.map((op) => (
              <option key={op.value} value={op.value}>
                {t(op.label)}
              </option>
            ))}
          </SelectField>
        )}

        {conditionOperator && needsValue && (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <InputField
                label={isDateOperator ? `${t('value')} (${t(conditionUnit || 'days')})` : undefined}
                value={conditionValue}
                placeholder={isDateOperator ? '3' : fieldType === 'number' ? '0' : t('enter_value')}
                onValueChange={(value) => onChange({ condition_value: value })}
              />
            </div>

            {isDateOperator && (
              <div style={{ minWidth: '100px' }}>
                <SelectField
                  customSelector
                  value={conditionUnit || 'days'}
                  onValueChange={(value) => onChange({ condition_unit: value })}
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

      {/* Preview */}
      {conditionField && conditionOperator && (
        <div
          className="rounded-md px-3 py-2 text-xs"
          style={{ backgroundColor: colors.$2, color: colors.$3 }}
        >
          <span style={{ opacity: 0.6 }}>
            {selectedFieldDef?.label ?? conditionField}{' '}
            {t(operators.find((o) => o.value === conditionOperator)?.label ?? '')}
            {needsValue && conditionValue && (
              <>
                {' '}{conditionValue}
                {isDateOperator && ` ${t(conditionUnit || 'days')}`}
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
