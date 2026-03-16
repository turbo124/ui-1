import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useParams } from 'react-router-dom';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useWorkflowQuery, useWorkflowActions } from '../hooks/useWorkflows';
import { useWorkflowRuns } from '../hooks/useWorkflowRuns';
import { WorkflowStatusBadge } from '../components/shared/WorkflowStatusBadge';
import { Spinner } from '$app/components/Spinner';
import { Link } from '$app/components/forms';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';

dayjs.extend(relativeTime);

export function WorkflowDetail() {
  const [t] = useTranslation();
  const { id } = useParams();
  const colors = useColorScheme();
  const { data: workflow, isLoading } = useWorkflowQuery(id);
  const { data: runs } = useWorkflowRuns({ workflowId: id });
  const actions = useWorkflowActions();

  if (isLoading || !workflow) {
    return (
      <Default
        title={t('workflow')}
        breadcrumbs={[{ name: t('workflows'), href: '/workflows' }]}
      >
        <Spinner />
      </Default>
    );
  }

  return (
    <Default
      title={workflow.name}
      breadcrumbs={[
        { name: t('workflows'), href: '/workflows' },
        { name: workflow.name, href: `/workflows/${workflow.id}` },
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
                className="text-2xl font-semibold"
                style={{ color: colors.$3 }}
              >
                {workflow.name}
              </div>
              {workflow.description && (
                <div
                  className="mt-1 text-sm"
                  style={{ color: colors.$3 }}
                >
                  {workflow.description}
                </div>
              )}
              <div className="mt-2 text-sm" style={{ color: colors.$3 }}>
                {workflow.trigger?.description}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <WorkflowStatusBadge status={workflow.status} />
              <Button to={`/workflows/${workflow.id}/edit`}>
                {t('edit')}
              </Button>
              <Dropdown label={t('more_actions')}>
                <DropdownElement
                  onClick={() => actions.clone(workflow.id)}
                >
                  {t('clone')}
                </DropdownElement>
                {workflow.status !== 'archived' ? (
                  <DropdownElement
                    onClick={() => actions.archive(workflow.id)}
                  >
                    {t('archive')}
                  </DropdownElement>
                ) : (
                  <DropdownElement
                    onClick={() => actions.restore(workflow.id)}
                  >
                    {t('restore')}
                  </DropdownElement>
                )}
                <DropdownElement
                  onClick={() => actions.remove(workflow.id)}
                >
                  {t('delete')}
                </DropdownElement>
              </Dropdown>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div
            className="rounded-lg border p-5"
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
          >
            <h3
              className="text-base font-semibold"
              style={{ color: colors.$3 }}
            >
              {t('steps')}
            </h3>
            <div className="mt-4 space-y-3">
              {(workflow.steps ?? []).map((step) => (
                <div
                  key={step.id}
                  className="rounded-lg border px-4 py-3"
                  style={{ borderColor: colors.$4 }}
                >
                  <div
                    className="text-sm font-medium"
                    style={{ color: colors.$3 }}
                  >
                    {step.name}
                  </div>
                  <div
                    className="text-xs uppercase tracking-wider"
                    style={{ color: colors.$3, opacity: 0.5 }}
                  >
                    {step.kind}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="rounded-lg border p-5"
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
          >
            <div className="flex items-center justify-between">
              <h3
                className="text-base font-semibold"
                style={{ color: colors.$3 }}
              >
                {t('run_history')}
              </h3>
              <Link to="/workflow_runs" className="text-sm">
                {t('view_all')}
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {(runs ?? []).length === 0 && (
                <div
                  className="text-center text-sm py-4"
                  style={{ color: colors.$3 }}
                >
                  {t('no_records_found')}
                </div>
              )}
              {(runs ?? []).slice(0, 10).map((run) => (
                <Link key={run.id} to={`/workflow_runs/${run.id}`}>
                  <div
                    className="flex items-center justify-between rounded-lg border px-4 py-3"
                    style={{ borderColor: colors.$4 }}
                  >
                    <div>
                      <div
                        className="text-sm font-medium"
                        style={{ color: colors.$3 }}
                      >
                        {run.entity_label}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: colors.$3, opacity: 0.5 }}
                      >
                        {dayjs(run.started_at).fromNow()}
                      </div>
                    </div>
                    <WorkflowStatusBadge status={run.status} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Default>
  );
}

export default WorkflowDetail;
