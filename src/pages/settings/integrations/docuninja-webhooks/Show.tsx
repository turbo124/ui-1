/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { DocuNinjaWebhook } from '$app/common/interfaces/docuninja/webhook';
import {
  useDocuNinjaWebhookDeliveriesQuery,
  useDocuNinjaWebhookQuery,
  useInvalidateDocuNinjaWebhooks,
} from '$app/common/queries/docuninja/webhooks';
import { Badge } from '$app/components/Badge';
import { Card, Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { Settings } from '$app/components/layouts/Settings';
import { Modal } from '$app/components/Modal';
import { Spinner } from '$app/components/Spinner';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from '$app/components/tables';
import { Pagination } from '$app/components/tables/Pagination';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EventBadges } from './common/components/EventBadges';
import { WebhookStatusBadge } from './common/components/WebhookStatusBadge';

dayjs.extend(relativeTime);

function DeliveryStatusBadge(props: { status: string }) {
  switch (props.status) {
    case 'success':
      return <Badge variant="green">Success</Badge>;
    case 'failed':
      return <Badge variant="red">Failed</Badge>;
    case 'pending':
      return <Badge variant="generic">Pending</Badge>;
    default:
      return <Badge variant="generic">{props.status}</Badge>;
  }
}

function HttpStatusBadge(props: { status: number | null }) {
  if (!props.status) return <span>—</span>;

  const code = props.status;

  if (code >= 200 && code < 300) {
    return <Badge variant="green">{code}</Badge>;
  }
  if (code >= 400 && code < 500) {
    return <Badge variant="yellow">{code}</Badge>;
  }
  if (code >= 500) {
    return <Badge variant="red">{code}</Badge>;
  }

  return <Badge variant="generic">{code}</Badge>;
}

export function Show() {
  const { id } = useParams();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const invalidate = useInvalidateDocuNinjaWebhooks();

  useTitle('webhook_details');

  const [deliveryPage, setDeliveryPage] = useState(1);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: webhook, isLoading: webhookLoading } =
    useDocuNinjaWebhookQuery({ id });

  const { data: deliveriesData, isLoading: deliveriesLoading } =
    useDocuNinjaWebhookDeliveriesQuery({
      webhookId: id,
      page: deliveryPage,
    });

  const pages = [
    { name: 'Settings', href: '/settings' },
    { name: 'Account Management', href: '/settings/account_management' },
    {
      name: 'Webhooks',
      href: '/settings/integrations/docuninja_webhooks',
    },
    {
      name: 'Details',
      href: `/settings/integrations/docuninja_webhooks/${id}`,
    },
  ];

  const handleTest = () => {
    toast.processing();

    request(
      'POST',
      docuNinjaEndpoint('/api/webhooks/:id/test', { id }),
      { event: 'document.completed' },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    )
      .then(() => {
        toast.success('test_webhook_queued');

        setTimeout(() => invalidate(), 3000);
      })
      .catch(() => {
        toast.error();
      });
  };

  const handleDelete = () => {
    if (isDeleting) return;

    setIsDeleting(true);
    toast.processing();

    request(
      'DELETE',
      docuNinjaEndpoint('/api/webhooks/:id', { id }),
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    )
      .then(() => {
        toast.success('deleted_webhook');
        invalidate();
        navigate('/settings/integrations/docuninja_webhooks');
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => setIsDeleting(false));
  };

  if (webhookLoading) {
    return (
      <Settings title="Webhooks" breadcrumbs={pages}>
        <Card>
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        </Card>
      </Settings>
    );
  }

  if (!webhook) {
    return (
      <Settings title="Webhooks" breadcrumbs={pages}>
        <Card>
          <div className="flex justify-center py-8">
            <p style={{ color: colors.$17 }}>Webhook not found.</p>
          </div>
        </Card>
      </Settings>
    );
  }

  const deliveries = deliveriesData?.data ?? [];

  return (
    <Settings title="Webhooks" breadcrumbs={pages}>
      {!webhook.is_active && webhook.disabled_at && (
        <div
          className="p-3 rounded-md border text-sm"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgb(239, 68, 68)',
            color: 'rgb(185, 28, 28)',
          }}
        >
          This endpoint was automatically disabled after 20 consecutive delivery
          failures. Edit the endpoint and toggle it active to reactivate.
        </div>
      )}

      <Card
        title="Endpoint Details"
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        topRight={
          <div className="flex items-center space-x-2">
            <Button type="secondary" onClick={handleTest}>
              Send Test
            </Button>
            <Button
              type="secondary"
              onClick={() =>
                navigate(
                  `/settings/integrations/docuninja_webhooks/${id}/edit`
                )
              }
            >
              Edit
            </Button>
            <Button
              type="secondary"
              onClick={() => setDeleteModalVisible(true)}
            >
              Delete
            </Button>
          </div>
        }
      >
        <Element leftSide="URL">
          <a
            href={webhook.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm break-all hover:underline"
            style={{ color: colors.$3 }}
          >
            {webhook.url}
          </a>
        </Element>

        <Element leftSide="Status">
          <WebhookStatusBadge webhook={webhook} />
        </Element>

        <Element leftSide="Events">
          <EventBadges events={webhook.events} />
        </Element>

        <Element leftSide="Includes">
          {webhook.includes && webhook.includes.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {webhook.includes.map((inc) => (
                <Badge key={inc} variant="generic">
                  {inc}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-sm" style={{ color: colors.$17 }}>
              Default
            </span>
          )}
        </Element>

        {webhook.description && (
          <Element leftSide="Description">
            <span className="text-sm">{webhook.description}</span>
          </Element>
        )}

        <Element leftSide="Failure Count">
          {webhook.failure_count > 0 ? (
            <Badge variant="yellow">{webhook.failure_count}</Badge>
          ) : (
            <span className="text-sm">0</span>
          )}
        </Element>

        <Element leftSide="Last Delivery">
          <span className="text-sm">
            {webhook.last_delivery_at
              ? dayjs(webhook.last_delivery_at).fromNow()
              : 'Never'}
          </span>
        </Element>

        <Element leftSide="Created">
          <span className="text-sm">
            {dayjs(webhook.created_at).format('MMM D, YYYY h:mm A')}
          </span>
        </Element>
      </Card>

      <Card
        title="Recent Deliveries"
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
        topRight={
          <button
            className="text-xs px-2 py-1 rounded border hover:opacity-80"
            style={{ borderColor: colors.$5, color: colors.$3 }}
            onClick={() => invalidate()}
          >
            Refresh
          </button>
        }
      >
        {deliveriesLoading && (
          <div className="flex justify-center py-6">
            <Spinner />
          </div>
        )}

        {!deliveriesLoading && deliveries.length === 0 && (
          <div className="flex flex-col items-center py-6 space-y-2">
            <p className="text-sm" style={{ color: colors.$17 }}>
              No deliveries yet.
            </p>
            <p className="text-xs" style={{ color: colors.$17 }}>
              Send a test webhook to verify your endpoint.
            </p>
          </div>
        )}

        {!deliveriesLoading && deliveries.length > 0 && (
          <div className="overflow-x-auto">
            <Table withoutTopBorder>
              <Thead>
                <Th>Event</Th>
                <Th>Status</Th>
                <Th>HTTP</Th>
                <Th>Duration</Th>
                <Th>Attempt</Th>
                <Th>Error</Th>
                <Th>Time</Th>
              </Thead>
              <Tbody>
                {deliveries.map((delivery) => (
                  <Tr key={delivery.id}>
                    <Td>
                      <Badge variant="light-blue">
                        {delivery.event
                          .split('.')
                          .map(
                            (p) => p.charAt(0).toUpperCase() + p.slice(1)
                          )
                          .join(' ')}
                      </Badge>
                    </Td>
                    <Td>
                      <DeliveryStatusBadge status={delivery.status} />
                    </Td>
                    <Td>
                      <HttpStatusBadge status={delivery.http_status} />
                    </Td>
                    <Td>
                      <span className="text-sm">
                        {delivery.duration_ms !== null
                          ? `${Math.round(delivery.duration_ms)}ms`
                          : '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-sm">{delivery.attempt}</span>
                    </Td>
                    <Td>
                      <span
                        className="text-sm truncate max-w-[200px] inline-block"
                        title={delivery.error_message ?? undefined}
                      >
                        {delivery.error_message ?? '—'}
                      </span>
                    </Td>
                    <Td>
                      <span className="text-sm whitespace-nowrap">
                        {delivery.delivered_at
                          ? dayjs(delivery.delivered_at).fromNow()
                          : '—'}
                      </span>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            {deliveriesData && deliveriesData.meta.last_page > 1 && (
              <Pagination
                totalPages={deliveriesData.meta.last_page}
                currentPage={deliveryPage}
                onPageChange={setDeliveryPage}
                totalRecords={deliveriesData.meta.total}
                currentPerPage="10"
                onRowsChange={() => {}}
              />
            )}
          </div>
        )}
      </Card>

      <Modal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Delete Webhook Endpoint"
        size="small"
      >
        <p className="text-sm">
          Are you sure you want to delete this webhook endpoint? This action
          cannot be undone.
        </p>
        <p
          className="text-sm font-mono break-all mt-2"
          style={{ color: colors.$17 }}
        >
          {webhook.url}
        </p>
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            type="secondary"
            onClick={() => setDeleteModalVisible(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={isDeleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </Settings>
  );
}
