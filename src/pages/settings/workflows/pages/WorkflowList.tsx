import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useTitle } from '$app/common/hooks/useTitle';
import { Button, InputField, SelectField } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { Link } from '$app/components/forms';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWorkflowsQuery, useWorkflowActions } from '../hooks/useWorkflows';
import { WorkflowStatusBadge } from '../components/shared/WorkflowStatusBadge';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { useColorScheme } from '$app/common/colors';
import { Spinner } from '$app/components/Spinner';

dayjs.extend(relativeTime);

export function WorkflowList() {
  useTitle('workflows');
  const [t] = useTranslation();
  const colors = useColorScheme();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const { data: workflows, isLoading } = useWorkflowsQuery({
    status: filter,
    search,
  });
  const actions = useWorkflowActions();

  const filtered = useMemo(
    () =>
      (workflows ?? []).filter((workflow) => {
        if (filter !== 'all' && workflow.status !== filter) {
          return false;
        }

        if (search) {
          return workflow.name.toLowerCase().includes(search.toLowerCase());
        }

        return true;
      }),
    [filter, search, workflows]
  );

  return (
    <Default
      title={t('workflows')}
      breadcrumbs={[{ name: t('workflows'), href: '/workflows' }]}
    >
      <div className="space-y-4">
        <div
          className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$4,
          }}
        >
          <div className="grid gap-3 lg:grid-cols-2">
            <InputField
              value={search}
              placeholder={t('search')}
              onValueChange={setSearch}
            />
            <SelectField
              customSelector
              value={filter}
              onValueChange={setFilter}
            >
              <option value="all">{t('all')}</option>
              <option value="active">{t('active')}</option>
              <option value="archived">{t('archived')}</option>
              <option value="draft">{t('draft')}</option>
            </SelectField>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button to="/workflows/templates" type="secondary">
              {t('from_template')}
            </Button>
            <Button to="/workflows/create">+ {t('new_workflow')}</Button>
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
            <table className="min-w-full divide-y" style={{ borderColor: colors.$4 }}>
              <thead style={{ backgroundColor: colors.$2 }}>
                <tr
                  className="text-left text-xs uppercase tracking-wider"
                  style={{ color: colors.$3 }}
                >
                  <th className="px-4 py-3">{t('name')}</th>
                  <th className="px-4 py-3">{t('trigger')}</th>
                  <th className="px-4 py-3">{t('status')}</th>
                  <th className="px-4 py-3">{t('runs')}</th>
                  <th className="px-4 py-3">{t('last_run')}</th>
                  <th className="px-4 py-3">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: colors.$4 }}>
                {filtered.map((workflow) => (
                  <tr key={workflow.id} style={{ color: colors.$3 }}>
                    <td className="px-4 py-3 text-sm">
                      <Link to={`/workflows/${workflow.id}`}>
                        {workflow.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {workflow.trigger.description}
                    </td>
                    <td className="px-4 py-3">
                      <WorkflowStatusBadge status={workflow.status} />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className="rounded-full px-2.5 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: colors.$2,
                          color: colors.$3,
                        }}
                      >
                        {workflow.runs_count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {workflow.last_run_at
                        ? dayjs(workflow.last_run_at).fromNow()
                        : t('never')}
                    </td>
                    <td className="px-4 py-3">
                      <Dropdown label={t('actions')}>
                        <DropdownElement
                          to={`/workflows/${workflow.id}/edit`}
                        >
                          {t('edit')}
                        </DropdownElement>
                        <DropdownElement
                          onClick={() => actions.clone(workflow.id)}
                        >
                          {t('clone')}
                        </DropdownElement>
                        {workflow.status === 'active' ? (
                          <DropdownElement
                            onClick={() =>
                              actions.deactivate(workflow.id)
                            }
                          >
                            {t('deactivate')}
                          </DropdownElement>
                        ) : (
                          <DropdownElement
                            onClick={() =>
                              actions.activate(workflow.id)
                            }
                          >
                            {t('activate')}
                          </DropdownElement>
                        )}
                        {workflow.status !== 'archived' ? (
                          <DropdownElement
                            onClick={() =>
                              actions.archive(workflow.id)
                            }
                          >
                            {t('archive')}
                          </DropdownElement>
                        ) : (
                          <DropdownElement
                            onClick={() =>
                              actions.restore(workflow.id)
                            }
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
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
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

export default WorkflowList;
