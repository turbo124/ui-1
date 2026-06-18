import { describe, expect, test } from 'vitest';
import {
  calculateScheduleRemaining,
  getInvoicePaymentScheduleAmount,
} from '../../../src/pages/settings/schedules/common/helpers/payment-schedule';
import { Invoice } from '../../../src/common/interfaces/invoice';
import invoice from '../../helpers/data/invoice';

describe('payment schedule amount', () => {
  test('uses invoice amount for draft invoices', () => {
    const draftInvoice: Invoice = {
      ...invoice,
      amount: 1000,
      balance: 250,
      status_id: '1',
    };

    expect(getInvoicePaymentScheduleAmount(draftInvoice)).toBe(1000);
  });

  test('uses invoice balance for non-draft invoices', () => {
    const sentInvoice: Invoice = {
      ...invoice,
      amount: 1000,
      balance: 250,
      status_id: '2',
    };

    expect(getInvoicePaymentScheduleAmount(sentInvoice)).toBe(250);
  });

  test('calculates amount remaining from balance for non-draft invoices', () => {
    const partialInvoice: Invoice = {
      ...invoice,
      amount: 1000,
      balance: 250,
      status_id: '3',
    };

    expect(
      calculateScheduleRemaining({
        schedules: [{ id: 1, date: '2026-06-20', amount: 100, is_amount: true }],
        invoice: partialInvoice,
      })
    ).toBe(150);
  });

  test('calculates percentage schedules against balance for non-draft invoices', () => {
    const sentInvoice: Invoice = {
      ...invoice,
      amount: 1000,
      balance: 250,
      status_id: '2',
    };

    expect(
      calculateScheduleRemaining({
        schedules: [
          { id: 1, date: '2026-06-20', amount: 125, is_amount: true },
        ],
        invoice: sentInvoice,
        isAmountMode: false,
      })
    ).toBe(50);
  });
});
