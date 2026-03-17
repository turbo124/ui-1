import { useState } from 'react';
import { Button, InputField, SelectField } from '$app/components/forms';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { WorkflowActionMetadata, WorkflowStep } from '../../types/workflow';
import { MdClose } from 'react-icons/md';

interface Header {
  key: string;
  value: string;
}

function parseHeaders(raw: string | undefined): Header[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object') {
      return Object.entries(parsed).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    }
  } catch {
    // ignore
  }
  return [];
}

function serializeHeaders(headers: Header[]): string {
  const filtered = headers.filter((h) => h.key.trim() !== '');
  if (filtered.length === 0) return '';
  return JSON.stringify(
    filtered.reduce<Record<string, string>>((acc, h) => {
      acc[h.key] = h.value;
      return acc;
    }, {})
  );
}

export function WebhookPanel({
  step,
  action,
  errors,
  onChange,
}: {
  step: WorkflowStep;
  action: WorkflowActionMetadata;
  errors?: (key: string) => string[] | undefined;
  onChange: (step: WorkflowStep) => void;
}) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const config = step.config ?? {};

  const urlField = action.params_schema.find((f) => f.key === 'url');
  const methodField = action.params_schema.find((f) => f.key === 'method');
  const methodOptions = methodField?.options ?? [];

  const [headers, setHeaders] = useState<Header[]>(() =>
    parseHeaders(config.headers)
  );

  const updateConfig = (key: string, value: string) => {
    onChange({ ...step, config: { ...config, [key]: value } });
  };

  const updateHeaders = (next: Header[]) => {
    setHeaders(next);
    onChange({
      ...step,
      config: { ...config, headers: serializeHeaders(next) },
    });
  };

  const addHeader = () => {
    updateHeaders([...headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    updateHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value', val: string) => {
    updateHeaders(
      headers.map((h, i) => (i === index ? { ...h, [field]: val } : h))
    );
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

      {urlField && (
        <InputField
          label={t(urlField.label)}
          value={config.url ?? ''}
          placeholder="https://example.com/webhook"
          onValueChange={(value) => updateConfig('url', value)}
          errorMessage={errors?.('url')}
        />
      )}

      {methodField && (
        <SelectField
          customSelector
          label={t(methodField.label)}
          value={config.method ?? 'POST'}
          onValueChange={(value) => updateConfig('method', value)}
          errorMessage={errors?.('method')}
        >
          {methodOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </SelectField>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: colors.$3, opacity: 0.5 }}
          >
            {t('headers')}
          </div>
        </div>

        {headers.length > 0 && (
          <div className="space-y-2">
            {headers.map((header, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <InputField
                    label={index === 0 ? t('key') : undefined}
                    value={header.key}
                    placeholder={t('key')}
                    onValueChange={(val) => updateHeader(index, 'key', val)}
                  />
                </div>
                <div className="flex-1">
                  <InputField
                    label={index === 0 ? t('value') : undefined}
                    value={header.value}
                    placeholder={t('value')}
                    onValueChange={(val) => updateHeader(index, 'value', val)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeHeader(index)}
                  className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded text-red-500 transition hover:bg-red-50"
                  style={{ marginTop: index === 0 ? '1.75rem' : '0.25rem' }}
                >
                  <MdClose size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2">
          <Button type="secondary" behavior="button" onClick={addHeader}>
            {t('add_header')}
          </Button>
        </div>
      </div>
    </div>
  );
}
