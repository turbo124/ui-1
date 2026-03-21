import { InputField, SelectField } from '$app/components/forms';
import { UserSelector } from '$app/components/users/UserSelector';
import { MarkdownEditor } from '$app/components/forms/MarkdownEditor';
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
  onChange,
}: {
  step: WorkflowStep;
  action: WorkflowActionMetadata;
  errors?: (key: string) => string[] | undefined;
  triggerEntity?: string;
  onChange: (step: WorkflowStep) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const config = step.config ?? {};

  const toField = action.params_schema.find((f) => f.key === 'to');
  const toOptions = toField?.options ?? [];

  const templateField = action.params_schema.find((f) => f.key === 'template');
  const templateOptions = templateField?.options ?? [];

  // Auto-default to first option when empty
  if (toOptions.length > 0 && !config.to) {
    setTimeout(() => updateConfig('to', toOptions[0].value), 0);
  }
  if (templateOptions.length > 0 && !config.template) {
    setTimeout(() => updateConfig('template', templateOptions[0].value), 0);
  }

  const isCustom = config.template === 'custom';
  const isSpecificUser = config.to === 'specific_user';

  const updateConfig = (key: string, value: string) => {
    const next = { ...step, config: { ...config, [key]: value } };

    if (key === 'to' && value !== 'specific_user') {
      delete next.config.user_id;
    }

    if (key === 'template' && value !== 'custom') {
      delete next.config.subject;
      delete next.config.body;
    }

    onChange(next);
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
        label={t('to')}
        value={config.to || toOptions[0]?.value || ''}
        onValueChange={(value) => updateConfig('to', value)}
        errorMessage={errors?.('to')}
      >
        {toOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.label)}
          </option>
        ))}
      </SelectField>

      {isSpecificUser && (
        <UserSelector
          inputLabel={t('user')}
          value={config.user_id ?? ''}
          onChange={(user) => updateConfig('user_id', user.id)}
          clearButton={Boolean(config.user_id)}
          onClearButtonClick={() => updateConfig('user_id', '')}
          errorMessage={errors?.('user_id')}
        />
      )}

      <SelectField
        customSelector
        label={t('template')}
        value={config.template || templateOptions[0]?.value || ''}
        onValueChange={(value) => updateConfig('template', value)}
        errorMessage={errors?.('template')}
      >
        {templateOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {t(opt.label)}
          </option>
        ))}
      </SelectField>

      {isCustom && (
        <>
          <InputField
            label={t('subject')}
            value={config.subject ?? ''}
            onValueChange={(value) => updateConfig('subject', value)}
            errorMessage={errors?.('subject')}
          />

          <div>
            <div
              className="mb-1.5 text-sm font-medium"
              style={{ color: colors.$3 }}
            >
              {t('body')}
            </div>
            <MarkdownEditor
              value={config.body ?? ''}
              onChange={(value) => updateConfig('body', value)}
            />
            {errors?.('body') && (
              <div className="mt-1 text-xs text-red-500">
                {errors('body')}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
