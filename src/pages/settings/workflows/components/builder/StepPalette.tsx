import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { WorkflowActionMetadata } from '../../types/workflow';
import { WorkflowIcon } from '../shared/WorkflowIcon';
import { MdWidgets } from 'react-icons/md';

const kindColor: Record<string, string> = {
  trigger: '#3B82F6',
  action: '#10B981',
  wait_event: '#F59E0B',
  wait_delay: '#F59E0B',
  branch: '#8B5CF6',
  end: '#6B7280',
};

export function StepPalette({
  actions,
  onAddStep,
}: {
  actions: WorkflowActionMetadata[];
  onAddStep: (action: WorkflowActionMetadata) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const groups = Array.from(
    new Set(actions.map((action) => action.category))
  );

  return (
    <div
      className="space-y-3 rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: colors.$2, color: colors.$3 }}
        >
          <MdWidgets size={16} />
        </span>
        <div>
          <h3
            className="text-sm font-semibold"
            style={{ color: colors.$3 }}
          >
            {t('steps')}
          </h3>
          <p className="text-xs" style={{ color: colors.$3, opacity: 0.5 }}>
            {t('add_step')}
          </p>
        </div>
      </div>

      {groups.map((group) => (
        <div key={group} className="space-y-1.5">
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.$3, opacity: 0.4 }}
          >
            {t(group.toLowerCase())}
          </h4>

          <div className="space-y-1">
            {actions
              .filter((action) => action.category === group)
              .map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => onAddStep(action)}
                  className="flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition hover:shadow-sm"
                  style={{ borderColor: colors.$4 }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white"
                    style={{ backgroundColor: kindColor[action.type] }}
                  >
                    <WorkflowIcon name={action.icon} size={16} />
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-xs font-medium truncate"
                      style={{ color: colors.$3 }}
                    >
                      {t(action.name)}
                    </div>
                    {action.description && (
                      <div
                        className="truncate text-[11px]"
                        style={{ color: colors.$3, opacity: 0.5 }}
                      >
                        {t(action.description)}
                      </div>
                    )}
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
