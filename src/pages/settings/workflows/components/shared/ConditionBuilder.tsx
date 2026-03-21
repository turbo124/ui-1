import { Button, InputField, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { ConditionFieldDef, ConditionFieldType, WorkflowCondition } from '../../types/workflow';
import { MdClose } from 'react-icons/md';

const stringOperators = [
  { label: 'is', value: '=' },
  { label: '!=', value: '!=' },
  { label: 'contains', value: 'contains' },
  { label: 'starts_with', value: 'starts_with' },
  { label: 'is_empty', value: 'is_empty' },
];

const numberOperators = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
  { label: '>', value: '>' },
  { label: '>=', value: '>=' },
  { label: '<', value: '<' },
  { label: '<=', value: '<=' },
];

const statusOperators = [
  { label: '=', value: '=' },
  { label: '!=', value: '!=' },
];

const dateOperators = [
  { label: 'after', value: '>' },
  { label: 'before', value: '<' },
  { label: 'on', value: '=' },
  { label: 'has_passed', value: 'date_past' },
  { label: 'is_in_the_future', value: 'date_future' },
];

const noValueOperators = ['is_empty', 'date_past', 'date_future'];

function getOperatorsForType(type: ConditionFieldType) {
  switch (type) {
    case 'number':
      return numberOperators;
    case 'date':
      return dateOperators;
    case 'status':
      return statusOperators;
    case 'relation':
      return statusOperators;
    default:
      return stringOperators;
  }
}

function ValueInput({
  condition,
  fieldDef,
  onChange,
}: {
  condition: WorkflowCondition;
  fieldDef: ConditionFieldDef | undefined;
  onChange: (value: string) => void;
}) {
  const [t] = useTranslation();
  const fieldType = fieldDef?.type ?? 'string';

  // status / select — render dropdown from field options
  if ((fieldType === 'status' || fieldType === 'select') && fieldDef?.options?.length) {
    const effectiveValue = condition.value || String(fieldDef.options[0].value);
    if (effectiveValue !== condition.value) {
      setTimeout(() => onChange(effectiveValue), 0);
    }
    return (
      <SelectField
        customSelector
        label={t('value')}
        value={effectiveValue}
        onValueChange={onChange}
      >
        {fieldDef.options.map((opt) => (
          <option key={opt.value} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </SelectField>
    );
  }

  // number — number input
  if (fieldType === 'number') {
    return (
      <InputField
        label={t('value')}
        type="number"
        value={condition.value}
        onValueChange={onChange}
      />
    );
  }

  // date — date picker
  if (fieldType === 'date') {
    return (
      <InputField
        label={t('value')}
        type="date"
        value={condition.value}
        onValueChange={onChange}
      />
    );
  }

  // relation — dropdown from field options (API-provided)
  if (fieldType === 'relation' && fieldDef?.options?.length) {
    const effectiveValue = condition.value || String(fieldDef.options[0].value);
    if (effectiveValue !== condition.value) {
      setTimeout(() => onChange(effectiveValue), 0);
    }
    return (
      <SelectField
        customSelector
        label={t('value')}
        value={effectiveValue}
        onValueChange={onChange}
      >
        {fieldDef.options.map((opt) => (
          <option key={opt.value} value={String(opt.value)}>
            {opt.label}
          </option>
        ))}
      </SelectField>
    );
  }

  // string / fallback — text input
  return (
    <InputField
      label={t('value')}
      value={condition.value}
      placeholder={t('enter_value')}
      onValueChange={onChange}
    />
  );
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
        const effectiveField = condition.field || fields[0]?.key || '';
        const fieldDef = getFieldDef(effectiveField);
        const fieldType = fieldDef?.type ?? 'string';
        const operators = getOperatorsForType(fieldType);
        const effectiveOperator = condition.operator && operators.some((o) => o.value === condition.operator)
          ? condition.operator
          : operators[0]?.value ?? '';
        const needsValue = !noValueOperators.includes(effectiveOperator);

        // Sync effective values back if they differ
        if (effectiveField !== condition.field || effectiveOperator !== condition.operator) {
          setTimeout(() => {
            onChange(
              conditions.map((entry) =>
                entry.id === condition.id
                  ? { ...entry, field: effectiveField, operator: effectiveOperator }
                  : entry
              )
            );
          }, 0);
        }

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
                value={effectiveField}
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

              {effectiveField && (
                <SelectField
                  customSelector
                  label={t('operator')}
                  value={effectiveOperator}
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

              {effectiveOperator && needsValue && (
                <ValueInput
                  condition={condition}
                  fieldDef={fieldDef}
                  onChange={(value) =>
                    onChange(
                      conditions.map((entry) =>
                        entry.id === condition.id
                          ? { ...entry, value }
                          : entry
                      )
                    )
                  }
                />
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
