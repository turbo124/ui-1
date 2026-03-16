import { useTranslation } from 'react-i18next';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { Button } from '$app/components/forms';
import {
  useWorkflowColumns,
  useWorkflowFilters,
  useActions,
} from '../common/hooks';

export function WorkflowList() {
  useTitle('workflows');

  const [t] = useTranslation();

  const pages: Page[] = [{ name: t('workflows'), href: '/workflows' }];

  const columns = useWorkflowColumns();
  const actions = useActions();
  const filters = useWorkflowFilters();

  return (
    <Default title={t('workflows')} breadcrumbs={pages}>
      <DataTable
        resource="workflow"
        columns={columns}
        endpoint="/api/v1/workflows?sort=id|desc"
        bulkRoute="/api/v1/workflows/bulk"
        linkToCreate="/workflows/create"
        linkToEdit="/workflows/:id/edit"
        withResourcefulActions
        customActions={actions}
        customFilters={filters}
        customFilterPlaceholder="status"
        rightSide={
          <Button to="/workflows/templates" type="secondary">
            {t('from_template')}
          </Button>
        }
      />
    </Default>
  );
}

export default WorkflowList;
