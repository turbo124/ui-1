import { useTranslation } from 'react-i18next';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { getInvoiceTemplateFields } from '$app/common/helpers/e-invoice-template';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { EInvoiceType } from '$app/pages/settings/e-invoice/EInvoice';
import { Card } from '$app/components/cards';
import { ConfiguredEInvoiceFields } from '$app/components/e-invoice/ConfiguredEInvoiceFields';

interface Props {
  document?: EInvoiceType;
  lineIndex?: number;
  onChange: (path: string[], value: string | number | boolean) => void;
  errors?: ValidationBag;
}

export function InvoiceEInvoiceFields(props: Props) {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const fields = getInvoiceTemplateFields(company?.e_invoice, props.lineIndex);

  if (!fields.length) return null;

  const inputs = <ConfiguredEInvoiceFields {...props} fields={fields} />;

  return props.lineIndex !== undefined ? (
    <div
      className="mt-3 min-w-[16rem]"
      role="group"
      aria-label={t('E-Invoice details') || undefined}
    >
      <p className="text-xs opacity-70 mb-2">{t('E-Invoice details')}</p>
      {inputs}
    </div>
  ) : (
    <Card
      title={t('E-Invoice details')}
      className="col-span-12"
      withContainer
      onFormSubmit={(event) => event.preventDefault()}
    >
      {inputs}
    </Card>
  );
}
