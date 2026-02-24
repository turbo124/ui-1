/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Checkbox } from '$app/components/forms/Checkbox';

interface Props {
  selectedIncludes: string[];
  onChange: (includes: string[]) => void;
}

const INCLUDE_OPTIONS: { value: string; label: string; description: string }[] =
  [
    { value: 'user', label: 'User', description: 'Document owner' },
    { value: 'files', label: 'Files', description: 'Attached files' },
    {
      value: 'invitations',
      label: 'Invitations',
      description: 'Signing invitations',
    },
    {
      value: 'signatures',
      label: 'Signatures',
      description: 'Signature data',
    },
    {
      value: 'contact',
      label: 'Contact',
      description: 'Client contact info',
    },
  ];

export function IncludesSelector(props: Props) {
  const { selectedIncludes, onChange } = props;

  const handleToggle = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedIncludes, value]);
    } else {
      onChange(selectedIncludes.filter((i) => i !== value));
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {INCLUDE_OPTIONS.map((option) => (
        <Checkbox
          key={option.value}
          label={`${option.label} — ${option.description}`}
          checked={selectedIncludes.includes(option.value)}
          onValueChange={(_value, checked) =>
            handleToggle(option.value, Boolean(checked))
          }
        />
      ))}
    </div>
  );
}
