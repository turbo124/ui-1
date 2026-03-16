import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Default } from '$app/components/layouts/Default';
import { Link, SelectField } from '$app/components/forms';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkflowRuns } from '../hooks/useWorkflowRuns';
import { useWorkflowRunActions } from '../hooks/useWorkflows';
import { WorkflowStatusBadge } from '../components/shared/WorkflowStatusBadge';
import { Spinner } from '$app/components/Spinner';
import { Table, Thead, Tbody, Tr, Th, Td } from '$app/components/tables';

dayjs.extend(relativeTime);

export function WorkflowRunList() {
  const [t] = useTranslation();
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

        {isLoading ? (
          <Spinner />
        ) : (
          <Table>
            <Thead>
              <Th>{t('workflow')}</Th>
              <Th>{t('entity')}</Th>
              <Th>{t('status')}</Th>
              <Th>{t('current_step')}</Th>
              <Th>{t('waiting_since')}</Th>
              <Th>{t('started')}</Th>
              <Th>{t('actions')}</Th>
            </Thead>
            <Tbody>
              {(runs ?? []).map((run) => (
                <Tr key={run.id}>
                  <Td>
                    <Link to={`/workflow_runs/${run.id}`}>
                      {run.workflow_name ?? ''}
                    </Link>
                  </Td>
                  <Td>{run.entity_label ?? ''}</Td>
                  <Td>
                    <WorkflowStatusBadge status={run.status ?? 'active'} />
                  </Td>
                  <Td>{run.current_step || t('finished')}</Td>
                  <Td>
                    {run.waiting_since
                      ? dayjs(run.waiting_since).fromNow()
                      : '-'}
                  </Td>
                  <Td>{dayjs(run.started_at).fromNow()}</Td>
                  <Td>
                    <div className="flex gap-3 text-xs font-medium">
                      <Link to={`/workflow_runs/${run.id}`}>
                        {t('view')}
                      </Link>
                      {(run.status === 'active' ||
                        run.status === 'waiting') && (
                        <>
                          <button
                            type="button"
                            onClick={() => runActions.cancel(run.id)}
                            className="hover:underline"
                          >
                            {t('cancel')}
                          </button>
                          {run.status === 'waiting' && (
                            <button
                              type="button"
                              onClick={() => runActions.advance(run.id)}
                              className="hover:underline"
                            >
                              {t('advance')}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}

              {(runs ?? []).length === 0 && (
                <Tr>
                  <Td colSpan={7}>{t('no_records_found')}</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </div>
    </Default>
  );
}

export default WorkflowRunList;
