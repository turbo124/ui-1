import { SelectField } from '$app/components/forms';

export function EntityRefSelector({
  value,
  options,
  onValueChange,
  label,
}: {
  value?: string;
  options: Array<{ label: string; value: string }>;
  onValueChange: (value: string) => void;
  label: string;
}) {
  const effectiveValue = value || options[0]?.value || '';

  if (effectiveValue && effectiveValue !== value) {
    setTimeout(() => onValueChange(effectiveValue), 0);
  }

  return (
    <SelectField
      customSelector
      label={label}
      value={effectiveValue}
      onValueChange={onValueChange}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  );
}
