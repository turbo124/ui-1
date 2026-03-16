import classNames from 'classnames';
import { WorkflowRunStatus, WorkflowStatus } from '../../types/workflow';

const palette: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700',
  waiting: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-slate-200 text-slate-700',
  timed_out: 'bg-orange-100 text-orange-700',
  draft: 'bg-slate-100 text-slate-700',
  archived: 'bg-slate-200 text-slate-700',
};

export function WorkflowStatusBadge({
  status,
}: {
  status: WorkflowStatus | WorkflowRunStatus;
}) {
  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize',
        palette[status]
      )}
    >
      {(status ?? '').replace('_', ' ')}
    </span>
  );
}
