/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface BudgetSummaryEntry {
  project_id: number;
  project_name: string;
  client_id: number;
  budgeted_hours: number;
  current_hours: number;
  task_rate: number;
  due_date: string | null;
  total_tasks: number;
  invoiced_tasks: number;
  uninvoiced_tasks: number;
  running_tasks: number;
  utilization: number;
  hours_remaining: number;
  currency_id: number;
}

export interface ProfitabilityEntry {
  project_id: number;
  project_name: string;
  client_id: number;
  invoiced_amount: number;
  expense_amount: number;
  net_margin: number;
  margin_ratio: number;
  currency_id: number;
}

export interface ProjectAnalyticsResponse {
  budget_summary: BudgetSummaryEntry[];
  profitability: ProfitabilityEntry[];
}
