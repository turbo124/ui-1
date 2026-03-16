import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';

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
  const [t] = useTranslation();

  return (
    <SelectField
      customSelector
      label={label}
      value={value}
      onValueChange={onValueChange}
    >
      <option value="">{t('select_reference')}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </SelectField>
  );
}
