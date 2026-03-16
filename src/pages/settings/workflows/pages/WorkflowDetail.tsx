import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useParams } from 'react-router-dom';
import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useWorkflowQuery, useWorkflowActions } from '../hooks/useWorkflows';
import { useWorkflowRuns } from '../hooks/useWorkflowRuns';
import { useWorkflowMetadata } from '../hooks/useWorkflowMetadata';
import { WorkflowStatusBadge } from '../components/shared/WorkflowStatusBadge';
import { Spinner } from '$app/components/Spinner';
import { Link } from '$app/components/forms';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { DropdownElement } from '$app/components/dropdown/DropdownElement';
import { Icon } from '$app/components/icons/Icon';
import {
  MdArchive,
  MdContentCopy,
  MdDelete,
  MdRestore,
} from 'react-icons/md';
import { buildWaitDelaySubtitle } from '../helpers/stepToNode';
import { WorkflowActionMetadata, WorkflowStep } from '../types/workflow';

dayjs.extend(relativeTime);

const kindColors: Record<string, string> = {
  trigger: '#3B82F6',
  action: '#10B981',
  wait_event: '#F59E0B',
  wait_delay: '#F59E0B',
  branch: '#8B5CF6',
  end: '#6B7280',
};

const kindLabels: Record<string, string> = {
  trigger: 'Trigger',
  action: 'Action',
  wait_event: 'Wait for Event',
  wait_delay: 'Wait / Delay',
  branch: 'Conditional',
  end: 'End',
};

function stepSubtitle(
  step: WorkflowStep,
  triggerEntity?: string,
  triggerEvent?: string,
  dateFields?: { key: string; label: string }[],
  actions?: WorkflowActionMetadata[]
): string {
  if (step.kind === 'trigger') {
    if (triggerEntity === 'Manual') {
      return 'Manually Assigned';
    }
    if (triggerEntity && triggerEvent) {
      return `${triggerEntity} ${triggerEvent.replace(/_/g, ' ')}`;
    }
    return 'Trigger';
  }

  if (step.kind === 'wait_delay') {
    return buildWaitDelaySubtitle(step.config ?? {}, dateFields);
  }

  if (step.kind === 'branch') {
    const field = (step.config as Record<string, string>)?.field;
    const op = (step.config as Record<string, string>)?.operator;
    const val = (step.config as Record<string, string>)?.value;
    if (field && op) {
      return `${field.replace(/_/g, ' ')} ${op} ${val ?? ''}`.trim();
    }
    return 'Conditional';
  }

  if (step.kind === 'action') {
    const action = (actions ?? []).find(
      (a: WorkflowActionMetadata) => a.id === step.action_id
    );
    return action?.name ?? step.action_id ?? 'Action';
  }

  if (step.kind === 'end') {
    const result = (step.config as Record<string, string>)?.result;
    return result === 'lost' ? 'End (Lost)' : 'End (Won)';
  }

  return kindLabels[step.kind] ?? step.kind;
}

export function WorkflowDetail() {
  const [t] = useTranslation();
  const { id } = useParams();
  const colors = useColorScheme();
  const { data: workflow, isLoading } = useWorkflowQuery(id);
  const { data: runs } = useWorkflowRuns({ workflowId: id });
  const { dateFields, actions: actionMetadata } = useWorkflowMetadata();
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

  const triggerEntity = workflow.trigger?.entity;
  const triggerEvent = workflow.trigger?.event;

  return (
    <Default
      title={workflow.name}
      breadcrumbs={[
        { name: t('workflows'), href: '/workflows' },
        { name: workflow.name, href: `/workflows/${workflow.id}` },
      ]}
      navigationTopRight={
        <div className="flex items-center gap-3">
          <Button to={`/workflows/${workflow.id}/edit`}>
            {t('edit')}
          </Button>
          <Dropdown label={t('more_actions')}>
            <DropdownElement
              onClick={() => actions.clone(workflow.id)}
              icon={<Icon element={MdContentCopy} />}
            >
              {t('clone')}
            </DropdownElement>
            {workflow.status !== 'archived' ? (
              <DropdownElement
                onClick={() => actions.archive(workflow.id)}
                icon={<Icon element={MdArchive} />}
              >
                {t('archive')}
              </DropdownElement>
            ) : (
              <DropdownElement
                onClick={() => actions.restore(workflow.id)}
                icon={<Icon element={MdRestore} />}
              >
                {t('restore')}
              </DropdownElement>
            )}
            <DropdownElement
              onClick={() => actions.remove(workflow.id)}
              icon={<Icon element={MdDelete} />}
            >
              {t('delete')}
            </DropdownElement>
          </Dropdown>
        </div>
      }
    >
      <div className="space-y-4">
        {workflow.description && (
          <div
            className="rounded-lg border p-5 text-sm"
            style={{
              backgroundColor: colors.$1,
              borderColor: colors.$4,
              color: colors.$3,
            }}
          >
            {workflow.description}
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
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
                {t('steps')}
              </h3>
              <WorkflowStatusBadge status={workflow.status} />
            </div>
            <div className="mt-4 space-y-3">
              {(workflow.steps ?? []).map((step) => {
                const color = kindColors[step.kind] ?? kindColors['action'];
                const subtitle = stepSubtitle(
                  step,
                  triggerEntity,
                  triggerEvent,
                  dateFields,
                  actionMetadata
                );

                return (
                  <div
                    key={step.id}
                    className="flex items-start gap-3 rounded-lg border px-4 py-3"
                    style={{ borderColor: colors.$4 }}
                  >
                    <div
                      className="mt-1 h-3 w-3 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-sm font-medium"
                        style={{ color: colors.$3 }}
                      >
                        {step.name || subtitle}
                      </div>
                      <div
                        className="text-xs"
                        style={{ color: colors.$3, opacity: 0.5 }}
                      >
                        {subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
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
