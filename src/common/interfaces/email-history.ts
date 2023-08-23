/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface EmailHistory {
    recipients: string;
    subject: string;
    entity: string;
    entity_id: string;
    events: EmailEvent[];
}

export interface EmailEvent {
    recipient: string;
    status: string;
    delivery_message: string;
    server: string;
    server_ip: string;
    date: string;
}