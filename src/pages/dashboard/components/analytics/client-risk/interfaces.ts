/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface ThresholdRange {
  green: number;
  yellow: number;
}

export interface ClientPaymentThresholds {
  avg_days: ThresholdRange;
  stddev: ThresholdRange;
  late_rate: ThresholdRange;
  data_points: ThresholdRange;
}

export type TrafficLight = 'green' | 'yellow' | 'red';

export interface ClientIndicators {
  avg_days: TrafficLight;
  stddev: TrafficLight;
  late_rate: TrafficLight;
  data_points: TrafficLight;
}

export interface ClientRiskEntry {
  client_id: number;
  currency_id: number;
  avg_payment_days: number;
  stddev_payment_days: number;
  total_invoices: number;
  late_invoices: number;
  late_payment_ratio: number;
  risk_score: number;
  risk_level: 'low' | 'medium' | 'high';
  indicators: ClientIndicators;
}

export interface CompanySummary {
  avg_payment_days: number;
  stddev_payment_days: number;
  total_invoices: number;
  late_payment_ratio: number;
}

export interface ClientPaymentAnalyticsResponse {
  company_summary: CompanySummary;
  thresholds: ClientPaymentThresholds;
  clients: ClientRiskEntry[];
}
