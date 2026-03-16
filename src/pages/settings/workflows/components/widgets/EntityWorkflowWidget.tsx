import { useColorScheme } from '$app/common/colors';
import { useTranslation } from 'react-i18next';
import { Link } from '$app/components/forms';
import { useWorkflowRuns } from '../../hooks/useWorkflowRuns';
import { WorkflowStatusBadge } from '../shared/WorkflowStatusBadge';

export function EntityWorkflowWidget({
  entityType,
  entityId,
}: {
  entityType: string;
  entityId: string;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { data } = useWorkflowRuns({ entityType, entityId });
  const runs = data ?? [];

  if (runs.length === 0) {
    return null;
  }

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
          {t('active_workflows')}
        </h3>
        <p className="text-sm" style={{ color: colors.$3, opacity: 0.6 }}>
          {t('workflow_runs_for_entity')}
        </p>
      </div>

      {runs.map((run) => (
        <Link key={run.id} to={`/workflow_runs/${run.id}`}>
          <div
            className="flex items-center justify-between rounded-lg border px-3 py-2"
            style={{ borderColor: colors.$4 }}
          >
            <div>
              <div
                className="text-sm font-medium"
                style={{ color: colors.$3 }}
              >
                {run.workflow_name}
              </div>
              <div
                className="text-xs"
                style={{ color: colors.$3, opacity: 0.6 }}
              >
                {run.current_step}
              </div>
            </div>
            <WorkflowStatusBadge status={run.status} />
          </div>
        </Link>
      ))}
    </div>
  );
}
