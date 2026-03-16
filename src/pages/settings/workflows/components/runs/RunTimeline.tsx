import { useColorScheme } from '$app/common/colors';
import { useTranslation } from 'react-i18next';
import { WorkflowRun } from '../../types/workflow';
import { RunStepEntry } from './RunStepEntry';

export function RunTimeline({ run }: { run: WorkflowRun }) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <div
      className="rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <h3
        className="mb-4 text-base font-semibold"
        style={{ color: colors.$3 }}
      >
        {t('timeline')}
      </h3>
      <div className="space-y-3">
        {run.steps.map((step) => (
          <RunStepEntry key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
}
