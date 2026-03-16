import { useColorScheme } from '$app/common/colors';
import { Icon } from '$app/components/icons/Icon';
import {
  MdCheckCircle,
  MdError,
  MdFlag,
  MdHourglassTop,
  MdPlayCircle,
  MdRadioButtonUnchecked,
  MdRemoveCircleOutline,
  MdSkipNext,
} from 'react-icons/md';
import { WorkflowRunStep } from '../../types/workflow';

const icons: Record<string, React.ComponentType> = {
  completed: MdCheckCircle,
  waiting: MdHourglassTop,
  active: MdPlayCircle,
  failed: MdError,
  skipped: MdSkipNext,
  pending: MdRadioButtonUnchecked,
  end: MdFlag,
};

const iconColors: Record<string, string> = {
  completed: '#10B981',
  waiting: '#F59E0B',
  active: '#3B82F6',
  failed: '#EF4444',
  skipped: '#6B7280',
  pending: '#94A3B8',
  end: '#475569',
};

export function RunStepEntry({ step }: { step: WorkflowRunStep }) {
  const colors = useColorScheme();
  const IconElement = icons[step.status] ?? MdRemoveCircleOutline;

  return (
    <div
      className="flex gap-3 rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <Icon
        element={IconElement as any}
        color={iconColors[step.status]}
        size={20}
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <div
            className="text-sm font-semibold"
            style={{ color: colors.$3 }}
          >
            {step.name}
          </div>
          <div
            className="text-xs uppercase tracking-wider"
            style={{ color: colors.$3, opacity: 0.5 }}
          >
            {step.status}
          </div>
        </div>
        {step.error && (
          <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
            {step.error}
          </div>
        )}
      </div>
    </div>
  );
}
