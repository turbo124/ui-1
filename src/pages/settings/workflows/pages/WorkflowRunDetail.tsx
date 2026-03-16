import { useParams } from 'react-router-dom';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useWorkflowRuns } from '../hooks/useWorkflowRuns';
import { useWorkflowRunActions } from '../hooks/useWorkflows';
import { RunTimeline } from '../components/runs/RunTimeline';
import { RunContextPanel } from '../components/runs/RunContextPanel';
import { WorkflowStatusBadge } from '../components/shared/WorkflowStatusBadge';
import { Spinner } from '$app/components/Spinner';

export function WorkflowRunDetail() {
  const [t] = useTranslation();
  const { id } = useParams();
  const colors = useColorScheme();
  const { data: runs, isLoading } = useWorkflowRuns();
  const runActions = useWorkflowRunActions();

  const run = (runs ?? []).find((r) => r.id === id) ?? (runs ?? [])[0];

  if (isLoading) {
    return (
      <Default
        title={t('workflow_run')}
        breadcrumbs={[
          { name: t('workflows'), href: '/workflows' },
          { name: t('runs'), href: '/workflow_runs' },
        ]}
      >
        <Spinner />
      </Default>
    );
  }

  if (!run) {
    return (
      <Default
        title={t('workflow_run')}
        breadcrumbs={[
          { name: t('workflows'), href: '/workflows' },
          { name: t('runs'), href: '/workflow_runs' },
        ]}
      >
        <div
          className="text-center text-sm py-8"
          style={{ color: colors.$3 }}
        >
          {t('no_records_found')}
        </div>
      </Default>
    );
  }

  return (
    <Default
      title={`${t('run')} ${id || run.id}`}
      breadcrumbs={[
        { name: t('workflows'), href: '/workflows' },
        { name: t('runs'), href: '/workflow_runs' },
        { name: id || run.id, href: `/workflow_runs/${id || run.id}` },
      ]}
    >
      <div className="space-y-4">
        <div
          className="rounded-lg border p-5"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$4,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className="text-xl font-semibold"
                style={{ color: colors.$3 }}
              >
                {run.workflow_name}
              </div>
              <div className="text-sm" style={{ color: colors.$3 }}>
                {run.entity_label}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WorkflowStatusBadge status={run.status} />
              {(run.status === 'active' || run.status === 'waiting') && (
                <>
                  <Button
                    type="secondary"
                    behavior="button"
                    onClick={() => runActions.cancel(run.id)}
                  >
                    {t('cancel_run')}
                  </Button>
                  {run.status === 'waiting' && (
                    <Button
                      behavior="button"
                      onClick={() => runActions.advance(run.id)}
                    >
                      {t('advance_past_wait')}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <RunTimeline run={run} />
          <RunContextPanel contextRefs={run.context_refs ?? []} />
        </div>
      </div>
    </Default>
  );
}

export default WorkflowRunDetail;
