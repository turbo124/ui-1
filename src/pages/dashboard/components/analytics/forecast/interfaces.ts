/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface ForecastInflowCategory {
  amount: number;
  count: number;
  weighted_amount: number;
}

export interface ForecastOutflowCategory {
  amount: number;
  count: number;
}

export interface ForecastBucket {
  period: string;
  period_start: string;
  period_end: string;
  inflows: {
    outstanding_invoices: ForecastInflowCategory;
    recurring_invoices: ForecastInflowCategory;
    quote_pipeline: ForecastInflowCategory;
    total: number;
    weighted_total: number;
  };
  outflows: {
    recurring_expenses: ForecastOutflowCategory;
    one_off_expenses: ForecastOutflowCategory;
    total: number;
  };
  net: number;
  weighted_net: number;
  confidence: number;
}

export interface ForecastTotals {
  total_inflows: number;
  weighted_inflows: number;
  total_outflows: number;
  net: number;
  weighted_net: number;
}

export interface CashFlowForecastResponse {
  start_date: string;
  end_date: string;
  bucket_type: string;
  buckets: ForecastBucket[];
  totals: ForecastTotals;
}
