import { SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import {
  WorkflowActionMetadata,
  WorkflowStep,
} from '../../types/workflow';

export function SendEmailPanel({
  step,
  action,
  errors,
  contextVariables,
  onChange,
}: {
  step: WorkflowStep;
  action: WorkflowActionMetadata;
  errors?: (key: string) => string[] | undefined;
  contextVariables: Array<{ label: string; value: string }>;
  onChange: (step: WorkflowStep) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const config = step.config ?? {};

  const templateField = action.params_schema.find((f) => f.key === 'template');
  const templateOptions = templateField?.options ?? [];

  const updateConfig = (key: string, value: string) => {
    onChange({ ...step, config: { ...config, [key]: value } });
  };

  return (
    <div
      className="space-y-3 rounded-lg border p-4"
      style={{ backgroundColor: colors.$1, borderColor: colors.$4 }}
    >
      <div
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: colors.$3, opacity: 0.5 }}
      >
        {t('configuration')}
      </div>

      <SelectField
        customSelector
        label={t('entity_reference')}
        value={config.entity_ref ?? ''}
        onValueChange={(value) => updateConfig('entity_ref', value)}
        errorMessage={errors?.('entity_ref')}
      >
        <option value="">{t('select_value')}</option>
        {contextVariables.map((cv) => (
          <option key={cv.value} value={cv.value}>
            {cv.label}
          </option>
        ))}
      </SelectField>

      <SelectField
        customSelector
        label={t('template')}
        value={config.template ?? ''}
        onValueChange={(value) => updateConfig('template', value)}
        errorMessage={errors?.('template')}
      >
        <option value="">{t('select_value')}</option>
        {templateOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
