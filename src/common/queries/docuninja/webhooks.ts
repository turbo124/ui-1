/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQuery, useQueryClient } from 'react-query';
import { request } from '$app/common/helpers/request';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { GenericManyResponse } from '$app/common/interfaces/docuninja/api';
import {
  DocuNinjaWebhook,
  DocuNinjaWebhookDelivery,
} from '$app/common/interfaces/docuninja/webhook';
import { AxiosResponse } from 'axios';

function authHeaders() {
  return {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
    },
  };
}

interface WebhooksParams {
  page?: number;
  perPage?: number;
  enabled?: boolean;
}

export function useDocuNinjaWebhooksQuery(params?: WebhooksParams) {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? 20;

  return useQuery<GenericManyResponse<DocuNinjaWebhook>>(
    ['/api/webhooks/docuninja', { page, perPage }],
    () =>
      request(
        'GET',
        docuNinjaEndpoint(
          `/api/webhooks?page=${page}&per_page=${perPage}`
        ),
        {},
        authHeaders()
      ).then(
        (response: AxiosResponse<GenericManyResponse<DocuNinjaWebhook>>) =>
          response.data
      ),
    { staleTime: 30000, enabled: params?.enabled ?? true }
  );
}

interface WebhookParams {
  id: string | undefined;
  enabled?: boolean;
}

export function useDocuNinjaWebhookQuery(params: WebhookParams) {
  return useQuery<DocuNinjaWebhook>(
    ['/api/webhooks/docuninja', params.id],
    () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/webhooks/:id', { id: params.id }),
        {},
        authHeaders()
      ).then(
        (response: AxiosResponse<{ data: DocuNinjaWebhook }>) =>
          response.data.data
      ),
    { staleTime: 30000, enabled: Boolean(params.id) && (params.enabled ?? true) }
  );
}

export function useDocuNinjaWebhookEventsQuery() {
  return useQuery<string[]>(
    ['/api/webhooks/events/docuninja'],
    () =>
      request(
        'GET',
        docuNinjaEndpoint('/api/webhooks/events'),
        {},
        authHeaders()
      ).then(
        (response: AxiosResponse<{ events: string[] }>) =>
          response.data.events
      ),
    { staleTime: Infinity }
  );
}

interface DeliveriesParams {
  webhookId: string | undefined;
  page?: number;
  perPage?: number;
  enabled?: boolean;
}

export function useDocuNinjaWebhookDeliveriesQuery(params: DeliveriesParams) {
  const page = params.page ?? 1;
  const perPage = params.perPage ?? 20;

  return useQuery<GenericManyResponse<DocuNinjaWebhookDelivery>>(
    ['/api/webhooks/deliveries/docuninja', params.webhookId, { page, perPage }],
    () =>
      request(
        'GET',
        docuNinjaEndpoint(
          `/api/webhooks/${params.webhookId}/deliveries?page=${page}&per_page=${perPage}`
        ),
        {},
        authHeaders()
      ).then(
        (
          response: AxiosResponse<
            GenericManyResponse<DocuNinjaWebhookDelivery>
          >
        ) => response.data
      ),
    {
      staleTime: 10000,
      enabled: Boolean(params.webhookId) && (params.enabled ?? true),
    }
  );
}

export function useInvalidateDocuNinjaWebhooks() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries(['/api/webhooks/docuninja']);
    queryClient.invalidateQueries(['/api/webhooks/deliveries/docuninja']);
  };
}
