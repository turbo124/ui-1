/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { Invoice } from '$app/common/interfaces/invoice';
import { ScheduleParams } from '$app/common/interfaces/schedule';

export function getInvoicePaymentScheduleAmount(invoice?: Invoice | null) {
  if (!invoice) {
    return 0;
  }

  return invoice.status_id === InvoiceStatus.Draft
    ? invoice.amount
    : invoice.balance;
}

interface CalculateScheduleRemainingParams {
  schedules: ScheduleParams[];
  invoice?: Invoice | null;
  isAmountMode?: boolean;
  excludeIndex?: number;
}

export function calculateScheduleRemaining(
  params: CalculateScheduleRemainingParams
) {
  const { schedules, invoice, excludeIndex } = params;
  const isAmountMode = params.isAmountMode ?? schedules[0]?.is_amount ?? true;

  const scheduledAmount = schedules.reduce((sum, schedule, index) => {
    if (index === excludeIndex) {
      return sum;
    }

    if (!invoice) {
      return sum + schedule.amount;
    }

    const totalAmount = getInvoicePaymentScheduleAmount(invoice);

    if (schedule.is_amount !== isAmountMode) {
      return (
        sum +
        (isAmountMode
          ? (schedule.amount * totalAmount) / 100
          : totalAmount > 0
            ? (schedule.amount / totalAmount) * 100
            : 0)
      );
    }

    return sum + schedule.amount;
  }, 0);

  if (!invoice) {
    if (isAmountMode) {
      const estimatedTotal = scheduledAmount / 0.9;

      return Math.max(0, estimatedTotal - scheduledAmount);
    }

    return Math.max(0, 100 - scheduledAmount);
  }

  if (isAmountMode) {
    return Number(
      (getInvoicePaymentScheduleAmount(invoice) - scheduledAmount).toFixed(2)
    );
  }

  return Number((100 - scheduledAmount).toFixed(0));
}
