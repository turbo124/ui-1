/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface WebhookHeader {
  name: string;
  value: string;
}

export interface DocuNinjaWebhook {
  id: string;
  url: string;
  events: string[];
  includes: string[] | null;
  description: string | null;
  is_active: boolean;
  failure_count: number;
  disabled_at: string | null;
  last_delivery_at: string | null;
  created_at: string;
  updated_at: string;
  secret?: string;
  headers?: WebhookHeader[] | null;
}

export interface DocuNinjaWebhookDelivery {
  id: string;
  event: string;
  status: 'pending' | 'success' | 'failed';
  http_status: number | null;
  attempt: number;
  duration_ms: number | null;
  error_message: string | null;
  delivered_at: string | null;
  created_at: string;
}
