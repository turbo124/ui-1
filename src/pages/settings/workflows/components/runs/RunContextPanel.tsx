import { useColorScheme } from '$app/common/colors';
import { useTranslation } from 'react-i18next';

export function RunContextPanel({
  contextRefs,
}: {
  contextRefs: Array<{ variable: string; label: string; entity: string }>;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <div
      className="space-y-3 rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <div>
        <h3
          className="text-base font-semibold"
          style={{ color: colors.$3 }}
        >
          {t('context')}
        </h3>
        <p className="text-sm" style={{ color: colors.$3, opacity: 0.6 }}>
          {t('workflow_context_description')}
        </p>
      </div>

      <div className="space-y-2">
        {contextRefs.map((ref) => (
          <div
            key={ref.variable}
            className="rounded-lg border px-3 py-2"
            style={{ borderColor: colors.$4 }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: colors.$3, opacity: 0.5 }}
            >
              {ref.variable}
            </div>
            <div className="text-sm" style={{ color: colors.$3 }}>
              {ref.label}
            </div>
          </div>
        ))}

        {contextRefs.length === 0 && (
          <div
            className="text-center text-sm py-2"
            style={{ color: colors.$3, opacity: 0.5 }}
          >
            {t('no_context_available')}
          </div>
        )}
      </div>
    </div>
  );
}
