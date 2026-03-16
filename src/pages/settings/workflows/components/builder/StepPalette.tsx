import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { WorkflowActionMetadata, WorkflowStepKind } from '../../types/workflow';

const kindColor: Record<WorkflowStepKind, string> = {
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
      className="space-y-4 rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <div>
        <h3
          className="text-base font-semibold"
          style={{ color: colors.$3 }}
        >
          {t('step_palette')}
        </h3>
        <p className="text-sm" style={{ color: colors.$3, opacity: 0.6 }}>
          {t('drag_or_click_step')}
        </p>
      </div>

      {groups.map((group) => (
        <div key={group} className="space-y-2">
          <h4
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.$3, opacity: 0.5 }}
          >
            {group}
          </h4>

          <div className="space-y-2">
            {actions
              .filter((action) => action.category === group)
              .map((action) => (
                <button
                  key={action.id}
                  type="button"
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData(
                      'application/invoiceninja-workflow-step',
                      JSON.stringify(action)
                    );
                    event.dataTransfer.effectAllowed = 'move';
                  }}
                  onClick={() => onAddStep(action)}
                  className="flex w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition hover:opacity-80"
                  style={{ borderColor: colors.$4 }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white"
                    style={{ backgroundColor: kindColor[action.type] }}
                  >
                    <span className="material-symbols-outlined text-base">
                      {action.icon}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div
                      className="text-sm font-medium truncate"
                      style={{ color: colors.$3 }}
                    >
                      {action.name}
                    </div>
                    <div
                      className="text-xs truncate"
                      style={{ color: colors.$3, opacity: 0.6 }}
                    >
                      {action.description}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
