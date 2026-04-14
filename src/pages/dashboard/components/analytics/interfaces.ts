/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface TimeSeriesPoint {
  total: string;
  date: string;
}

export interface AnalyticsSummaryCurrencyData {
  mrr: TimeSeriesPoint[];
  payment_delay: TimeSeriesPoint[];
  quote_pipeline: TimeSeriesPoint[];
  late_payment_rate: TimeSeriesPoint[];
}

export interface MRRTotals {
  mrr: number;
  arr: number;
  currency_id?: number;
}

export interface AgingTotals {
  total: number;
  current_amount: number;
  age_0_30: number;
  age_31_60: number;
  age_61_90: number;
  age_91_120: number;
  age_120_plus: number;
  outstanding_count: number;
  currency_id?: number;
}

export interface PaymentAnalyticsTotals {
  avg_payment_days: number;
  stddev_payment_days: number;
  total_invoices: number;
  late_invoices: number;
  late_payment_ratio: number;
}

export interface RecurringExpensesTotals {
  monthly_total: number;
  annual_total: number;
  count: number;
  currency_id?: number;
}

export interface AnalyticsTotalsCurrencyData {
  mrr: MRRTotals;
  aging: AgingTotals;
  recurring_expenses?: RecurringExpensesTotals;
  payment_analytics?: PaymentAnalyticsTotals;
}
