/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InputLabel } from '$app/components/forms/InputLabel';
import { TiptapEditor } from './TiptapEditor';

interface Props {
  value?: string | undefined;
  onChange: (value: string) => unknown;
  label?: string;
  disabled?: boolean;
  handleChangeOnlyOnUserInput?: boolean;
}

export function MarkdownEditor(props: Props) {
  return (
    <div className="space-y-4" style={{ zIndex: 0 }}>
      {props.label && <InputLabel>{props.label}</InputLabel>}
      <TiptapEditor
        value={props.value}
        onChange={props.onChange}
        disabled={props.disabled}
        handleChangeOnlyOnUserInput={props.handleChangeOnlyOnUserInput}
      />
    </div>
  );
}
