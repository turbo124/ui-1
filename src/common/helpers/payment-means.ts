/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { get } from 'lodash';
import {
  getPaymentMeansFields,
  type PaymentMeansValues,
} from '../constants/payment-means';
import {
  isBicIdentifier,
  isIbanIdentifier,
  normalizeBankIdentifier,
} from './payment-means-validation';

export function emptyPaymentMeans(code = '1'): PaymentMeansValues {
  return {
    code,
    information: '',
    payment_reference: '',
    iban: '',
    account_holder: '',
    bic_swift: '',
    payer_bank_account: '',
    mandate_reference: '',
    creditor_identifier: '',
    card_type: '',
    card_number: '',
    card_holder: '',
  };
}

function identifier(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return identifier(value.value);
  }

  return '';
}

export function lastFourCardDigits(value: string): string {
  return value.replace(/\D/g, '').slice(-4);
}

function creditorIdentifier(document: unknown): string {
  // A separate payee's identifier takes precedence over the seller's.
  for (const path of [
    'PayeeParty.PartyIdentification',
    'AccountingSupplierParty.Party.PartyIdentification',
  ]) {
    const parties: unknown = get(document, path);

    if (Array.isArray(parties)) {
      const creditor = parties.find(
        (party: unknown) => get(party, 'ID.schemeID') === 'SEPA'
      );

      if (creditor) return identifier(get(creditor, 'ID'));
    }
  }

  return '';
}

export function readPaymentMeans(
  eInvoice: unknown,
  defaultCode = '1'
): PaymentMeansValues {
  const document = get(eInvoice, 'Invoice') ?? get(eInvoice, 'CreditNote');
  const payment = get(document, 'PaymentMeans.0');
  const reference: unknown = get(payment, 'PaymentID');

  return {
    ...emptyPaymentMeans(defaultCode),
    code: identifier(get(payment, 'PaymentMeansCode')) || defaultCode,
    information:
      identifier(get(payment, 'PaymentMeansCode.name')) ||
      identifier(get(payment, 'InstructionNote')),
    payment_reference: identifier(
      Array.isArray(reference) ? reference[0] : reference
    ),
    iban: identifier(get(payment, 'PayeeFinancialAccount.ID')),
    account_holder: identifier(get(payment, 'PayeeFinancialAccount.Name')),
    bic_swift: identifier(
      get(payment, 'PayeeFinancialAccount.FinancialInstitutionBranch.ID') ??
        get(
          payment,
          'PayeeFinancialAccount.FinancialInstitutionBranch.FinancialInstitution.ID'
        ) ??
        get(payment, 'PayeeFinancialAccount.SortCode')
    ),
    payer_bank_account: identifier(
      get(payment, 'PaymentMandate.PayerFinancialAccount.ID') ??
        get(payment, 'PayerFinancialAccount.ID')
    ),
    mandate_reference: identifier(get(payment, 'PaymentMandate.ID')),
    creditor_identifier: creditorIdentifier(document),
    card_type: identifier(get(payment, 'CardAccount.NetworkID')),
    card_number: lastFourCardDigits(
      identifier(get(payment, 'CardAccount.PrimaryAccountNumberID'))
    ),
    card_holder: identifier(get(payment, 'CardAccount.HolderName')),
  };
}

export function changePaymentMeansCode(
  payment: PaymentMeansValues,
  code: string
): PaymentMeansValues {
  const next = emptyPaymentMeans(code);
  const previousFields = getPaymentMeansFields(payment.code);

  for (const field of getPaymentMeansFields(code)) {
    if (previousFields.includes(field)) next[field] = payment[field];
  }

  return next;
}

export function paymentMeansPayload(
  payment: PaymentMeansValues
): Partial<PaymentMeansValues> & Pick<PaymentMeansValues, 'code'> {
  const payload: Partial<PaymentMeansValues> &
    Pick<PaymentMeansValues, 'code'> = {
    code: payment.code,
  };

  for (const field of getPaymentMeansFields(payment.code)) {
    let value = payment[field].trim();

    if (
      (field === 'iban' &&
        (payment.code === '58' || isIbanIdentifier(value))) ||
      (field === 'payer_bank_account' &&
        (payment.code === '59' || isIbanIdentifier(value))) ||
      (field === 'bic_swift' && isBicIdentifier(value)) ||
      (field === 'creditor_identifier' && payment.code === '59')
    )
      value = normalizeBankIdentifier(value);

    if (value) {
      payload[field] = value;
    }
  }

  return payload;
}
