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
import { Spinner } from '$app/components/Spinner';
import { Table, Thead, Tbody, Tr, Th, Td } from '$app/components/tables';

dayjs.extend(relativeTime);

export function WorkflowList() {
  useTitle('workflows');
  const [t] = useTranslation();
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
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
          <Table>
            <Thead>
              <Th>{t('name')}</Th>
              <Th>{t('trigger')}</Th>
              <Th>{t('status')}</Th>
              <Th>{t('runs')}</Th>
              <Th>{t('last_run')}</Th>
              <Th>{t('actions')}</Th>
            </Thead>
            <Tbody>
              {filtered.map((workflow) => (
                <Tr key={workflow.id}>
                  <Td>
                    <Link to={`/workflows/${workflow.id}`}>
                      {workflow.name}
                    </Link>
                  </Td>
                  <Td>{workflow.trigger?.description ?? ''}</Td>
                  <Td>
                    <WorkflowStatusBadge status={workflow.status ?? 'draft'} />
                  </Td>
                  <Td>{workflow.runs_count ?? 0}</Td>
                  <Td>
                    {workflow.last_run_at
                      ? dayjs(workflow.last_run_at).fromNow()
                      : t('never')}
                  </Td>
                  <Td>
                    <Dropdown label={t('actions')}>
                      <DropdownElement to={`/workflows/${workflow.id}/edit`}>
                        {t('edit')}
                      </DropdownElement>
                      <DropdownElement
                        onClick={() => actions.clone(workflow.id)}
                      >
                        {t('clone')}
                      </DropdownElement>
                      {workflow.status === 'active' ? (
                        <DropdownElement
                          onClick={() => actions.deactivate(workflow.id)}
                        >
                          {t('deactivate')}
                        </DropdownElement>
                      ) : (
                        <DropdownElement
                          onClick={() => actions.activate(workflow.id)}
                        >
                          {t('activate')}
                        </DropdownElement>
                      )}
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
                  </Td>
                </Tr>
              ))}

              {filtered.length === 0 && (
                <Tr>
                  <Td colSpan={6}>{t('no_records_found')}</Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </div>
    </Default>
  );
}

export default WorkflowList;
