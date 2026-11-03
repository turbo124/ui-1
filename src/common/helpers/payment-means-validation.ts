import { IBAN_LENGTHS } from '../constants/iban-lengths';
import {
  getPaymentMeansFields,
  PAYMENT_MEANS,
  PAYMENT_MEANS_FIELD_LIMITS,
  type PaymentMeansField,
  type PaymentMeansValidationContext,
  type PaymentMeansValues,
} from '../constants/payment-means';

export interface PaymentMeansValidationError {
  key: string;
  message: string;
  max?: number;
}

export type PaymentMeansValidationErrors = Partial<
  Record<keyof PaymentMeansValues, PaymentMeansValidationError>
>;

export function normalizeBankIdentifier(value: string): string {
  return value.replace(/\s/g, '').toUpperCase();
}

function mod97(value: string): number {
  let remainder = 0;
  for (const character of value) {
    const digits = /[A-Z]/.test(character)
      ? String(character.charCodeAt(0) - 55)
      : character;
    for (const digit of digits)
      remainder = (remainder * 10 + Number(digit)) % 97;
  }
  return remainder;
}

export function isValidIban(value: string): boolean {
  const iban = normalizeBankIdentifier(value);
  return (
    /^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban) &&
    IBAN_LENGTHS[iban.slice(0, 2)] === iban.length &&
    mod97(iban.slice(4) + iban.slice(0, 4)) === 1
  );
}

export function isIbanIdentifier(value: string): boolean {
  const identifier = normalizeBankIdentifier(value);
  return identifier.length >= 15 && /^[A-Z]{2}[0-9]{2}/.test(identifier);
}

export function isBicIdentifier(value: string): boolean {
  return /^[A-Z]{6}/.test(normalizeBankIdentifier(value));
}

export function isValidBic(value: string): boolean {
  return /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(
    normalizeBankIdentifier(value)
  );
}

export function isValidSepaCreditorIdentifier(value: string): boolean {
  const creditor = normalizeBankIdentifier(value);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{3}[A-Z0-9]{1,28}$/.test(creditor))
    return false;
  if (
    creditor.startsWith('DE') &&
    !/^DE[0-9]{2}[A-Z0-9]{3}[0-9]{11}$/.test(creditor)
  )
    return false;
  // Creditor business code (positions 5–7) is excluded from the checksum.
  return mod97(creditor.slice(7) + creditor.slice(0, 4)) === 1;
}

export function paymentMeansFieldLimit(
  field: PaymentMeansField,
  code: string
): number {
  if (field === 'iban' && code === '58') return 34;
  if (field === 'payer_bank_account' && code === '59') return 34;
  if (
    (field === 'mandate_reference' || field === 'creditor_identifier') &&
    code === '59'
  )
    return 35;
  return PAYMENT_MEANS_FIELD_LIMITS[field];
}

export function requiredPaymentMeansFields(
  payment: PaymentMeansValues,
  context: PaymentMeansValidationContext = {}
): PaymentMeansField[] {
  const fields: PaymentMeansField[] = [];
  const kind = PAYMENT_MEANS.find(({ code }) => code === payment.code)?.kind;
  if (payment.code === '30' || payment.code === '58') fields.push('iban');
  if (
    kind === 'transfer' &&
    (payment.account_holder.trim() || payment.bic_swift.trim())
  )
    fields.push('iban');
  if (kind === 'card') {
    fields.push('card_number');
    if (context.eInvoiceType === 'PEPPOL') fields.push('card_type');
  }
  const explicitDebit = payment.code === '49' || payment.code === '59';
  const peppolDebit = context.eInvoiceType === 'PEPPOL' && explicitDebit;
  if (peppolDebit) fields.push('mandate_reference');

  const germanPeppol =
    context.eInvoiceType === 'PEPPOL' &&
    context.supplierCountry === 'DE' &&
    context.customerCountry === 'DE';
  const xRechnung = context.eInvoiceType?.startsWith('XInvoice_');
  const hasDebitGroup = Boolean(
    payment.payer_bank_account.trim() ||
      payment.mandate_reference.trim() ||
      payment.creditor_identifier.trim() ||
      peppolDebit ||
      ((germanPeppol || xRechnung) && payment.code === '59')
  );

  if (kind === 'debit' && hasDebitGroup && (germanPeppol || xRechnung)) {
    fields.push('payer_bank_account', 'creditor_identifier');
  }
  return [...new Set(fields)];
}

function hasInvalidXmlCharacters(value: string): boolean {
  return Array.from(value).some((character) => {
    const point = character.codePointAt(0)!;
    return !(
      point === 9 ||
      point === 10 ||
      point === 13 ||
      (point >= 32 && point <= 0xd7ff) ||
      (point >= 0xe000 && point <= 0xfffd) ||
      (point >= 0x10000 && point <= 0x10ffff)
    );
  });
}

export function validatePaymentMeans(
  payment: PaymentMeansValues,
  context: PaymentMeansValidationContext = {}
): PaymentMeansValidationErrors {
  const errors: PaymentMeansValidationErrors = {};
  if (!payment.code && context.allowInheritance) return errors;
  if (!PAYMENT_MEANS.some(({ code }) => code === payment.code)) {
    errors.code = {
      key: 'unsupported_e_invoice_payment_means',
      message:
        'This payment means is not supported. Choose another payment means.',
    };
    return errors;
  }
  for (const field of requiredPaymentMeansFields(payment, context)) {
    if (!payment[field].trim())
      errors[field] = {
        key: 'payment_means_required',
        message: 'This field is required.',
      };
  }
  for (const field of getPaymentMeansFields(payment.code)) {
    let value = payment[field].trim();
    if (!value) continue;
    const account = field === 'iban' || field === 'payer_bank_account';
    const sepaAccount =
      (field === 'iban' && payment.code === '58') ||
      (field === 'payer_bank_account' && payment.code === '59');
    const iban = account && (sepaAccount || isIbanIdentifier(value));
    const bic = field === 'bic_swift' && isBicIdentifier(value);
    const sepaCreditor =
      field === 'creditor_identifier' && payment.code === '59';
    if (iban || bic || sepaCreditor) value = normalizeBankIdentifier(value);
    const max = paymentMeansFieldLimit(field, payment.code);
    if (hasInvalidXmlCharacters(payment[field])) {
      errors[field] = {
        key: 'payment_means_invalid_characters',
        message: 'Remove unsupported control characters.',
      };
    } else if (Array.from(value).length > max) {
      errors[field] = {
        key: 'payment_means_max_length',
        message: 'Use {{max}} characters or fewer.',
        max,
      };
    } else if (iban && !isValidIban(value)) {
      errors[field] = { key: 'invalid_iban', message: 'Enter a valid IBAN.' };
    } else if (bic && !isValidBic(value)) {
      errors[field] = {
        key: 'payment_means_invalid_bic',
        message: 'Enter a valid BIC with 8 or 11 characters.',
      };
    } else if (sepaCreditor && !isValidSepaCreditorIdentifier(value)) {
      errors[field] = {
        key: 'payment_means_invalid_creditor',
        message: 'Enter a valid SEPA creditor identifier.',
      };
    } else if (field === 'card_number' && !/^[0-9]{4}$/.test(value)) {
      errors[field] = {
        key: 'payment_means_invalid_card',
        message: 'Enter exactly the last four card digits.',
      };
    } else if (
      field === 'mandate_reference' &&
      payment.code === '59' &&
      (!/^[A-Za-z0-9 /?:().,'+-]+$/.test(value) ||
        value.startsWith('/') ||
        value.endsWith('/') ||
        value.includes('//'))
    ) {
      errors[field] = {
        key: 'payment_means_invalid_mandate',
        message:
          'Use SEPA reference characters without leading, trailing, or consecutive slashes.',
      };
    }
  }
  return errors;
}
