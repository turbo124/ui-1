/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { WebhookHeader } from '$app/common/interfaces/docuninja/webhook';
import { InputField } from '$app/components/forms';
import { MdAdd, MdClose } from 'react-icons/md';

const MAX_HEADERS = 5;
const HEADER_NAME_PATTERN = /^[A-Za-z0-9-]+$/;
const MAX_NAME_LENGTH = 128;
const MAX_VALUE_LENGTH = 1024;

const BLOCKED_NAMES = [
  'host',
  'content-length',
  'transfer-encoding',
  'content-type',
  'user-agent',
  'x-docuninja-signature',
  'x-docuninja-event',
  'x-docuninja-delivery',
];

export interface HeaderError {
  name?: string;
  value?: string;
}

export function validateHeaders(
  headers: WebhookHeader[]
): { valid: boolean; errors: HeaderError[] } {
  const errors: HeaderError[] = [];
  const seenNames = new Set<string>();
  let valid = true;

  for (const header of headers) {
    const rowError: HeaderError = {};

    if (!header.name.trim()) {
      rowError.name = 'Header name is required.';
      valid = false;
    } else if (header.name.length > MAX_NAME_LENGTH) {
      rowError.name = `Header name must be ${MAX_NAME_LENGTH} characters or fewer.`;
      valid = false;
    } else if (!HEADER_NAME_PATTERN.test(header.name)) {
      rowError.name = 'Only letters, numbers, and hyphens are allowed.';
      valid = false;
    } else if (BLOCKED_NAMES.includes(header.name.toLowerCase())) {
      rowError.name = 'This header is reserved and cannot be overridden.';
      valid = false;
    } else if (seenNames.has(header.name.toLowerCase())) {
      rowError.name = 'Duplicate header names are not allowed.';
      valid = false;
    }

    seenNames.add(header.name.toLowerCase());

    if (!header.value.trim()) {
      rowError.value = 'Header value is required.';
      valid = false;
    } else if (header.value.length > MAX_VALUE_LENGTH) {
      rowError.value = `Header value must be ${MAX_VALUE_LENGTH} characters or fewer.`;
      valid = false;
    }

    errors.push(rowError);
  }

  return { valid, errors };
}

interface Props {
  headers: WebhookHeader[];
  onChange: (headers: WebhookHeader[]) => void;
  errors?: HeaderError[];
  disabled?: boolean;
}

export function WebhookHeadersEditor(props: Props) {
  const { headers, onChange, errors, disabled } = props;
  const colors = useColorScheme();

  const handleAddRow = () => {
    if (headers.length >= MAX_HEADERS) return;
    onChange([...headers, { name: '', value: '' }]);
  };

  const handleRemoveRow = (index: number) => {
    onChange(headers.filter((_, i) => i !== index));
  };

  const handleChange = (
    index: number,
    field: 'name' | 'value',
    val: string
  ) => {
    const updated = headers.map((h, i) =>
      i === index ? { ...h, [field]: val } : h
    );
    onChange(updated);
  };

  return (
    <div className="flex flex-col space-y-3">
      {headers.length === 0 && (
        <span className="text-xs" style={{ color: colors.$17 }}>
          Add custom HTTP headers to include with webhook deliveries.
        </span>
      )}

      {headers.map((header, index) => (
        <div
          key={index}
          className="flex items-start space-x-2 p-3 rounded-md border"
          style={{ borderColor: colors.$5, backgroundColor: colors.$4 }}
        >
          <div className="flex-1">
            <InputField
              value={header.name}
              placeholder="X-Custom-Header"
              onValueChange={(val) => handleChange(index, 'name', val)}
              errorMessage={errors?.[index]?.name}
              disabled={disabled}
              debounceTimeout={0}
            />
          </div>

          <div className="flex-1">
            <InputField
              type="password"
              value={header.value}
              placeholder="Value"
              onValueChange={(val) => handleChange(index, 'value', val)}
              errorMessage={errors?.[index]?.value}
              disabled={disabled}
              debounceTimeout={0}
            />
          </div>

          <button
            type="button"
            className="mt-2 p-1 rounded hover:opacity-80 shrink-0"
            style={{ color: colors.$17 }}
            onClick={() => handleRemoveRow(index)}
            disabled={disabled}
            aria-label="Remove header"
          >
            <MdClose size={18} />
          </button>
        </div>
      ))}

      {headers.length < MAX_HEADERS ? (
        <button
          type="button"
          className="flex items-center space-x-1 text-sm py-1 hover:opacity-80"
          style={{ color: colors.$3 }}
          onClick={handleAddRow}
          disabled={disabled}
        >
          <MdAdd size={18} />
          <span>Add Header</span>
        </button>
      ) : (
        <span className="text-xs" style={{ color: colors.$17 }}>
          Maximum of 5 custom headers reached.
        </span>
      )}

      {headers.length > 0 && headers.length < MAX_HEADERS && (
        <span className="text-xs" style={{ color: colors.$17 }}>
          {headers.length} / {MAX_HEADERS} headers
        </span>
      )}
    </div>
  );
}
