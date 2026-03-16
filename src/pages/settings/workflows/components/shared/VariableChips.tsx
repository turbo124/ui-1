import { useColorScheme } from '$app/common/colors';
import { useTranslation } from 'react-i18next';

export function VariableChips({
  values,
}: {
  values: Array<{ label: string; value: string }>;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  if (values.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed px-3 py-2 text-xs"
        style={{ borderColor: colors.$4, color: colors.$3, opacity: 0.6 }}
      >
        {t('no_entity_references')}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value) => (
        <span
          key={value.value}
          className="rounded-full px-3 py-1 text-xs font-medium"
          style={{ backgroundColor: colors.$2, color: colors.$3 }}
        >
          {value.label}
        </span>
      ))}
    </div>
  );
}
