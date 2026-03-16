import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Default } from '$app/components/layouts/Default';
import { Link, SelectField } from '$app/components/forms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useWorkflowRuns } from '../hooks/useWorkflowRuns';
import { useWorkflowRunActions } from '../hooks/useWorkflows';
import { WorkflowStatusBadge } from '../components/shared/WorkflowStatusBadge';
import { Spinner } from '$app/components/Spinner';

dayjs.extend(relativeTime);

export function WorkflowRunList() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [status, setStatus] = useState('all');
  const { data: runs, isLoading } = useWorkflowRuns({
    status,
    activeOnly: status === 'active' || status === 'waiting',
  });
  const runActions = useWorkflowRunActions();

  return (
    <Default
      title={t('workflow_runs')}
      breadcrumbs={[
        { name: t('workflows'), href: '/workflows' },
        { name: t('runs'), href: '/workflow_runs' },
      ]}
    >
      <div className="space-y-4">
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$4,
          }}
        >
          <div className="max-w-[220px]">
            <SelectField
              customSelector
              value={status}
              onValueChange={setStatus}
            >
              <option value="all">{t('all_statuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="waiting">{t('waiting')}</option>
              <option value="completed">{t('completed')}</option>
              <option value="failed">{t('failed')}</option>
              <option value="cancelled">{t('cancelled')}</option>
              <option value="timed_out">{t('timed_out')}</option>
            </SelectField>
          </div>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <div
            className="overflow-hidden rounded-lg border"
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
          >
            <table
              className="min-w-full divide-y"
              style={{ borderColor: colors.$4 }}
            >
              <thead style={{ backgroundColor: colors.$2 }}>
                <tr
                  className="text-left text-xs uppercase tracking-wider"
                  style={{ color: colors.$3 }}
                >
                  <th className="px-4 py-3">{t('workflow')}</th>
                  <th className="px-4 py-3">{t('entity')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('current_step')}</th>
                  <th className="px-4 py-3">{t('waiting_since')}</th>
                  <th className="px-4 py-3">{t('started')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody
                className="divide-y"
                style={{ borderColor: colors.$4 }}
              >
                {(runs ?? []).map((run) => (
                  <tr key={run.id} style={{ color: colors.$3 }}>
                    <td className="px-4 py-3 text-sm">
                      <Link to={`/workflow_runs/${run.id}`}>
                        {run.workflow_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {run.entity_label}
                    </td>
                    <td className="px-4 py-3">
                      <WorkflowStatusBadge status={run.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {run.current_step || t('finished')}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {run.waiting_since
                        ? dayjs(run.waiting_since).fromNow()
                        : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {dayjs(run.started_at).fromNow()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 text-xs font-medium">
                        <Link to={`/workflow_runs/${run.id}`}>
                          {t('view')}
                        </Link>
                        {(run.status === 'active' ||
                          run.status === 'waiting') && (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                runActions.cancel(run.id)
                              }
                              className="hover:underline"
                            >
                              {t('cancel')}
                            </button>
                            {run.status === 'waiting' && (
                              <button
                                type="button"
                                onClick={() =>
                                  runActions.advance(run.id)
                                }
                                className="hover:underline"
                              >
                                {t('advance')}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {(runs ?? []).length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-sm"
                      style={{ color: colors.$3 }}
                    >
                      {t('no_records_found')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Default>
  );
}

export default WorkflowRunList;
