/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Link } from '$app/components/forms';
import { useTitle } from '$app/common/hooks/useTitle';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { BsKanban } from 'react-icons/bs';
import {
  defaultColumns,
  useActions,
  useAllTaskColumns,
  useTaskColumns,
  useTaskFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Inline } from '$app/components/Inline';
import { permission } from '$app/common/guards/guards/permission';

export default function Tasks() {
  const { documentTitle } = useTitle('tasks');

  const [t] = useTranslation();

  const pages = [{ name: t('tasks'), href: '/tasks' }];

  const columns = useTaskColumns();

  const filters = useTaskFilters();

  const actions = useActions();

  const taskColumns = useAllTaskColumns();

  return (
    <Default title={documentTitle} breadcrumbs={pages} withoutBackButton>
      <DataTable
        resource="task"
        columns={columns}
        customActions={actions}
        endpoint="/api/v1/tasks?include=status,client,project,user&sort=id|desc"
        bulkRoute="/api/v1/tasks/bulk"
        linkToCreate="/tasks/create"
        customFilters={filters}
        customFilterQueryKey="client_status"
        customFilterPlaceholder="status"
        withResourcefulActions
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={taskColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="task"
          />
        }
        beforeFilter={
          <Link to="/tasks/kanban">
            <Inline>
              <BsKanban size={20} />
              <span>Kanban</span>
            </Inline>
          </Link>
        }
        linkToCreateGuards={[permission('create_task')]}
      />
    </Default>
  );
}
