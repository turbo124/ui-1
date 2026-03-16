import { useTranslation } from 'react-i18next';
import { route } from '$app/common/helpers/route';
import { DataTableColumns } from '$app/components/DataTable';
import { WorkflowDefinition } from '../types/workflow';
import { EntityStatus } from '$app/components/EntityStatus';
import { useWorkflowActions } from '../hooks/useWorkflows';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import { MdContentCopy, MdEdit } from 'react-icons/md';
import { DynamicLink } from '$app/components/DynamicLink';
import { SelectOption } from '$app/components/datatables/Actions';
import { CancelRunsAction } from './components/CancelRunsAction';

export const defaultColumns: string[] = [
  'name',
  'trigger',
  'status',
];

export function useWorkflowColumns() {
  const [t] = useTranslation();

  const columns: DataTableColumns<WorkflowDefinition> = [
    {
      id: 'name',
      label: t('name'),
      format: (value, workflow) => (
        <DynamicLink to={route('/workflows/:id/edit', { id: workflow.id })}>
          {workflow.name}
        </DynamicLink>
      ),
    },
    {
      id: 'trigger',
      label: t('trigger'),
      format: (_value, workflow) => {
        if (workflow.trigger?.entity === 'Manual') {
          return t('manually_assigned');
        }

        if (workflow.trigger?.entity && workflow.trigger?.event) {
          return `${workflow.trigger.entity} ${workflow.trigger.event.replace(/_/g, ' ')}`;
        }

        return workflow.trigger?.description || t('trigger');
      },
    },
    {
      id: 'status',
      label: t('status'),
      format: (_value, workflow) => <EntityStatus entity={workflow} />,
    },
  ];

  return columns;
}

export function useWorkflowFilters() {
  const [t] = useTranslation();

  const filters: SelectOption[] = [
    {
      label: t('active'),
      value: 'active',
      color: 'white',
      backgroundColor: '#22C55E',
    },
    {
      label: t('archived'),
      value: 'archived',
      color: 'white',
      backgroundColor: '#F97316',
    },
  ];

  return filters;
}

export function useActions() {
  const [t] = useTranslation();
  const actions = useWorkflowActions();

  return [
    (workflow: WorkflowDefinition) => (
      <DropdownElement
        to={route('/workflows/:id/edit', { id: workflow.id })}
        icon={<Icon element={MdEdit} />}
      >
        {t('edit')}
      </DropdownElement>
    ),
    (workflow: WorkflowDefinition) => (
      <DropdownElement
        onClick={() => actions.clone(workflow.id)}
        icon={<Icon element={MdContentCopy} />}
      >
        {t('clone')}
      </DropdownElement>
    ),
    (workflow: WorkflowDefinition) => (
      <CancelRunsAction key="cancel_runs" workflow={workflow} />
    ),
  ];
}
