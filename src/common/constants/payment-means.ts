/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export type PaymentMeansKind = 'transfer' | 'debit' | 'card' | 'other';

interface PaymentMeansDefinition {
  code: string;
  label: string;
  kind: PaymentMeansKind;
}

// UNTDID 4461, excluding 98 for both supported e-invoice formats.
// Preserve the selected code; categories only select form fields.
// https://docs.peppol.eu/poacc/billing/3.0/codelist/UNCL4461/
export const PAYMENT_MEANS: readonly PaymentMeansDefinition[] = [
  { code: '1', label: 'Instrument not defined', kind: 'other' },
  { code: '2', label: 'Automated clearing house credit', kind: 'transfer' },
  { code: '3', label: 'Automated clearing house debit', kind: 'debit' },
  { code: '4', label: 'ACH demand debit reversal', kind: 'other' },
  { code: '5', label: 'ACH demand credit reversal', kind: 'other' },
  { code: '6', label: 'ACH demand credit', kind: 'transfer' },
  { code: '7', label: 'ACH demand debit', kind: 'debit' },
  { code: '8', label: 'Hold', kind: 'other' },
  { code: '9', label: 'National or regional clearing', kind: 'transfer' },
  { code: '10', label: 'In cash', kind: 'other' },
  { code: '11', label: 'ACH savings credit reversal', kind: 'other' },
  { code: '12', label: 'ACH savings debit reversal', kind: 'other' },
  { code: '13', label: 'ACH savings credit', kind: 'transfer' },
  { code: '14', label: 'ACH savings debit', kind: 'debit' },
  { code: '15', label: 'Bookentry credit', kind: 'transfer' },
  { code: '16', label: 'Bookentry debit', kind: 'debit' },
  {
    code: '17',
    label: 'ACH demand cash concentration/disbursement (CCD) credit',
    kind: 'transfer',
  },
  {
    code: '18',
    label: 'ACH demand cash concentration/disbursement (CCD) debit',
    kind: 'debit',
  },
  {
    code: '19',
    label: 'ACH demand corporate trade payment (CTP) credit',
    kind: 'transfer',
  },
  { code: '20', label: 'Cheque', kind: 'other' },
  { code: '21', label: "Banker's draft", kind: 'other' },
  { code: '22', label: "Certified banker's draft", kind: 'other' },
  {
    code: '23',
    label: 'Bank cheque (issued by a banking or similar establishment)',
    kind: 'other',
  },
  { code: '24', label: 'Bill of exchange awaiting acceptance', kind: 'other' },
  { code: '25', label: 'Certified cheque', kind: 'other' },
  { code: '26', label: 'Local cheque', kind: 'other' },
  {
    code: '27',
    label: 'ACH demand corporate trade payment (CTP) debit',
    kind: 'debit',
  },
  {
    code: '28',
    label: 'ACH demand corporate trade exchange (CTX) credit',
    kind: 'transfer',
  },
  {
    code: '29',
    label: 'ACH demand corporate trade exchange (CTX) debit',
    kind: 'debit',
  },
  { code: '30', label: 'Credit transfer', kind: 'transfer' },
  { code: '31', label: 'Debit transfer', kind: 'debit' },
  {
    code: '32',
    label: 'ACH demand cash concentration/disbursement plus (CCD+) credit',
    kind: 'transfer',
  },
  {
    code: '33',
    label: 'ACH demand cash concentration/disbursement plus (CCD+) debit',
    kind: 'debit',
  },
  {
    code: '34',
    label: 'ACH prearranged payment and deposit (PPD)',
    kind: 'transfer',
  },
  {
    code: '35',
    label: 'ACH savings cash concentration/disbursement (CCD) credit',
    kind: 'transfer',
  },
  {
    code: '36',
    label: 'ACH savings cash concentration/disbursement (CCD) debit',
    kind: 'debit',
  },
  {
    code: '37',
    label: 'ACH savings corporate trade payment (CTP) credit',
    kind: 'transfer',
  },
  {
    code: '38',
    label: 'ACH savings corporate trade payment (CTP) debit',
    kind: 'debit',
  },
  {
    code: '39',
    label: 'ACH savings corporate trade exchange (CTX) credit',
    kind: 'transfer',
  },
  {
    code: '40',
    label: 'ACH savings corporate trade exchange (CTX) debit',
    kind: 'debit',
  },
  {
    code: '41',
    label: 'ACH savings cash concentration/disbursement plus (CCD+) credit',
    kind: 'transfer',
  },
  { code: '42', label: 'Payment to bank account', kind: 'transfer' },
  {
    code: '43',
    label: 'ACH savings cash concentration/disbursement plus (CCD+) debit',
    kind: 'debit',
  },
  { code: '44', label: 'Accepted bill of exchange', kind: 'other' },
  {
    code: '45',
    label: 'Referenced home-banking credit transfer',
    kind: 'transfer',
  },
  { code: '46', label: 'Interbank debit transfer', kind: 'debit' },
  { code: '47', label: 'Home-banking debit transfer', kind: 'debit' },
  { code: '48', label: 'Bank card', kind: 'card' },
  { code: '49', label: 'Direct debit', kind: 'debit' },
  { code: '50', label: 'Payment by postgiro', kind: 'transfer' },
  {
    code: '51',
    label: 'FR, norme 6 97-Telereglement CFONB - Option A',
    kind: 'debit',
  },
  { code: '52', label: 'Urgent commercial payment', kind: 'transfer' },
  { code: '53', label: 'Urgent Treasury Payment', kind: 'transfer' },
  { code: '54', label: 'Credit card', kind: 'card' },
  { code: '55', label: 'Debit card', kind: 'card' },
  { code: '56', label: 'Bankgiro', kind: 'transfer' },
  { code: '57', label: 'Standing agreement', kind: 'other' },
  { code: '58', label: 'SEPA credit transfer', kind: 'transfer' },
  { code: '59', label: 'SEPA direct debit', kind: 'debit' },
  { code: '60', label: 'Promissory note', kind: 'other' },
  { code: '61', label: 'Promissory note signed by the debtor', kind: 'other' },
  {
    code: '62',
    label: 'Promissory note signed by the debtor and endorsed by a bank',
    kind: 'other',
  },
  {
    code: '63',
    label: 'Promissory note signed by the debtor and endorsed by a third party',
    kind: 'other',
  },
  { code: '64', label: 'Promissory note signed by a bank', kind: 'other' },
  {
    code: '65',
    label: 'Promissory note signed by a bank and endorsed by another bank',
    kind: 'other',
  },
  {
    code: '66',
    label: 'Promissory note signed by a third party',
    kind: 'other',
  },
  {
    code: '67',
    label: 'Promissory note signed by a third party and endorsed by a bank',
    kind: 'other',
  },
  { code: '68', label: 'Online payment service', kind: 'other' },
  { code: '69', label: 'Transfer Advice', kind: 'transfer' },
  {
    code: '70',
    label: 'Bill drawn by the creditor on the debtor',
    kind: 'other',
  },
  { code: '74', label: 'Bill drawn by the creditor on a bank', kind: 'other' },
  {
    code: '75',
    label: 'Bill drawn by the creditor, endorsed by another bank',
    kind: 'other',
  },
  {
    code: '76',
    label: 'Bill drawn by the creditor on a bank and endorsed by a third party',
    kind: 'other',
  },
  {
    code: '77',
    label: 'Bill drawn by the creditor on a third party',
    kind: 'other',
  },
  {
    code: '78',
    label:
      'Bill drawn by creditor on third party, accepted and endorsed by bank',
    kind: 'other',
  },
  { code: '91', label: "Not transferable banker's draft", kind: 'other' },
  { code: '92', label: 'Not transferable local cheque', kind: 'other' },
  { code: '93', label: 'Reference giro', kind: 'transfer' },
  { code: '94', label: 'Urgent giro', kind: 'transfer' },
  { code: '95', label: 'Free format giro', kind: 'transfer' },
  {
    code: '96',
    label: 'Requested method for payment was not used',
    kind: 'other',
  },
  { code: '97', label: 'Clearing between partners', kind: 'other' },
  { code: 'ZZZ', label: 'Mutually defined', kind: 'other' },
];

export interface PaymentMeansValues {
  code: string;
  information: string;
  payment_reference: string;
  iban: string;
  account_holder: string;
  bic_swift: string;
  payer_bank_account: string;
  mandate_reference: string;
  creditor_identifier: string;
  card_type: string;
  card_number: string;
  card_holder: string;
}

export type PaymentMeansField = Exclude<keyof PaymentMeansValues, 'code'>;

export interface PaymentMeansValidationContext {
  eInvoiceType?: string;
  supplierCountry?: string;
  customerCountry?: string;
  allowInheritance?: boolean;
}

// Application limits; stricter scheme/profile limits are applied separately.
export const PAYMENT_MEANS_FIELD_LIMITS: Record<PaymentMeansField, number> = {
  information: 1000,
  payment_reference: 255,
  iban: 255,
  account_holder: 255,
  bic_swift: 255,
  payer_bank_account: 255,
  mandate_reference: 255,
  creditor_identifier: 255,
  card_type: 255,
  card_number: 4,
  card_holder: 255,
};

const COMMON_FIELDS: readonly PaymentMeansField[] = [
  'information',
  'payment_reference',
];

const KIND_FIELDS: Record<PaymentMeansKind, readonly PaymentMeansField[]> = {
  transfer: ['iban', 'account_holder', 'bic_swift'],
  debit: ['payer_bank_account', 'mandate_reference', 'creditor_identifier'],
  card: ['card_type', 'card_number', 'card_holder'],
  other: [],
};

export function getPaymentMeansFields(
  code: string
): readonly PaymentMeansField[] {
  if (!code) return [];

  const kind = PAYMENT_MEANS.find((method) => method.code === code)?.kind;

  return [...COMMON_FIELDS, ...(kind ? KIND_FIELDS[kind] : [])];
}
