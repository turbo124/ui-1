import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { get, startCase } from 'lodash';
import { InputField } from '$app/components/forms';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { EInvoiceTemplateField } from '$app/common/helpers/e-invoice-template';
import { EInvoiceType } from '$app/pages/settings/e-invoice/EInvoice';

interface Props {
  fields: EInvoiceTemplateField[];
  document?: EInvoiceType;
  onChange: (path: string[], value: string | number | boolean) => void;
  errors?: ValidationBag;
  lineIndex?: number;
}

export function ConfiguredEInvoiceFields(props: Props) {
  const id = useId();
  const [t] = useTranslation();

  return (
    <div className="grid gap-4">
      {props.fields.map(({ path, value: defaultValue }) => {
        const key = path.join('.');
        const value = get(props.document, path, defaultValue);
        const fieldParts = path
          .slice(props.lineIndex === undefined ? 1 : 3)
          .filter((part) => !/^\d+$/.test(part));
        const isOrderLineReference =
          props.lineIndex !== undefined &&
          fieldParts.join('.') === 'OrderLineReference.LineID.value';
        const label = isOrderLineReference
          ? `${t('Order line reference')}${
              /^\d+$/.test(path[4]) && Number(path[4]) > 0
                ? ` (${Number(path[4]) + 1})`
                : ''
            }`
          : fieldParts.map(startCase).join(' / ');

        if (typeof defaultValue === 'boolean') {
          return (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(event) => props.onChange(path, event.target.checked)}
              />
              {label}
            </label>
          );
        }

        return (
          <InputField
            key={key}
            id={`${id}-${key}`}
            label={label}
            type={
              typeof defaultValue === 'number'
                ? 'number'
                : /date$/i.test(path[path.length - 1])
                ? 'date'
                : 'text'
            }
            value={value ?? ''}
            debounceTimeout={0}
            changeOverride
            onValueChange={(value) =>
              props.onChange(
                path,
                typeof defaultValue === 'number' && value !== ''
                  ? Number(value)
                  : value
              )
            }
            errorMessage={props.errors?.errors[`e_invoice.${key}`]}
          />
        );
      })}
    </div>
  );
}
