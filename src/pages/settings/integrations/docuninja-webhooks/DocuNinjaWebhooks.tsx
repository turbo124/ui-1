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
import { DocuNinjaWebhook } from '$app/common/interfaces/docuninja/webhook';
import {
  useDocuNinjaWebhooksQuery,
  useInvalidateDocuNinjaWebhooks,
} from '$app/common/queries/docuninja/webhooks';
import { Badge } from '$app/components/Badge';
import { Spinner } from '$app/components/Spinner';
import { Button } from '$app/components/forms';
import { Card } from '$app/components/cards';
import { Modal } from '$app/components/Modal';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EventBadges } from './common/components/EventBadges';
import { WebhookStatusBadge } from './common/components/WebhookStatusBadge';

dayjs.extend(relativeTime);

export function DocuNinjaWebhooks() {
  const colors = useColorScheme();
  const navigate = useNavigate();
  const invalidate = useInvalidateDocuNinjaWebhooks();

  const [deleteTarget, setDeleteTarget] = useState<DocuNinjaWebhook | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { data, isLoading } = useDocuNinjaWebhooksQuery();

  const handleTest = (webhook: DocuNinjaWebhook) => {
    toast.processing();

    request(
      'POST',
      docuNinjaEndpoint('/api/webhooks/:id/test', { id: webhook.id }),
      { event: 'document.completed' },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
        skipIntercept: true,
      }
    )
      .then(() => {
        toast.success('test_webhook_queued');
      })
      .catch(() => {
        toast.error();
      });
  };

  const handleDelete = () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    toast.processing();

    request(
      'DELETE',
      docuNinjaEndpoint('/api/webhooks/:id', { id: deleteTarget.id }),
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
        skipIntercept: true,
      }
    )
      .then(() => {
        toast.success('deleted_webhook');
        invalidate();
        setDeleteTarget(null);
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => setIsDeleting(false));
  };

  const webhooks = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          onClick={() => navigate('/docuninja/settings/webhooks/create')}
        >
          Add Endpoint
        </Button>
      </div>
      {isLoading && (
        <Card>
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        </Card>
      )}

      {!isLoading && webhooks.length === 0 && (
        <Card>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <p className="text-lg font-medium" style={{ color: colors.$3 }}>
              No webhook endpoints configured
            </p>
            <p className="text-sm" style={{ color: colors.$17 }}>
              Receive real-time notifications when document events occur.
            </p>
            <Button
              onClick={() =>
                navigate('/docuninja/settings/webhooks/create')
              }
            >
              Create your first endpoint
            </Button>
          </div>
        </Card>
      )}

      {!isLoading && webhooks.length > 0 && (
        <div className="flex flex-col space-y-3">
          {webhooks.map((webhook) => (
            <div
              key={webhook.id}
              className="border rounded-md p-4 cursor-pointer hover:shadow-sm transition-shadow"
              style={{
                backgroundColor: colors.$1,
                borderColor: colors.$4,
              }}
              onClick={() =>
                navigate(
                  `/docuninja/settings/webhooks/${webhook.id}`
                )
              }
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-col space-y-2 min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: colors.$3 }}
                    >
                      {webhook.url}
                    </span>
                    <WebhookStatusBadge webhook={webhook} />
                    {webhook.failure_count > 0 && webhook.is_active && (
                      <Badge variant="yellow">
                        {webhook.failure_count} failures
                      </Badge>
                    )}
                  </div>

                  {webhook.description && (
                    <span
                      className="text-xs"
                      style={{ color: colors.$17 }}
                    >
                      {webhook.description}
                    </span>
                  )}

                  <EventBadges events={webhook.events} maxVisible={2} />

                  <span className="text-xs" style={{ color: colors.$17 }}>
                    Last delivery:{' '}
                    {webhook.last_delivery_at
                      ? dayjs(webhook.last_delivery_at).fromNow()
                      : 'Never'}
                  </span>
                </div>

                <div
                  className="flex items-center space-x-2 ml-4 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="text-xs px-2 py-1 rounded border hover:opacity-80"
                    style={{
                      borderColor: colors.$5,
                      color: colors.$3,
                    }}
                    onClick={() => handleTest(webhook)}
                  >
                    Test
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded border hover:opacity-80"
                    style={{
                      borderColor: colors.$5,
                      color: colors.$3,
                    }}
                    onClick={() =>
                      navigate(
                        `/docuninja/settings/webhooks/${webhook.id}/edit`
                      )
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="text-xs px-2 py-1 rounded border hover:opacity-80 text-red-500"
                    style={{ borderColor: colors.$5 }}
                    onClick={() => setDeleteTarget(webhook)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {!webhook.is_active && webhook.disabled_at && (
                <div
                  className="mt-3 p-2 rounded text-xs"
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    color: 'rgb(185, 28, 28)',
                  }}
                >
                  This endpoint was automatically disabled after 20 consecutive
                  delivery failures. Edit the endpoint and toggle it active to
                  reactivate.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        visible={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Webhook Endpoint"
        size="small"
      >
        <p className="text-sm">
          Are you sure you want to delete this webhook endpoint? This action
          cannot be undone.
        </p>
        {deleteTarget && (
          <p
            className="text-sm font-mono break-all mt-2"
            style={{ color: colors.$17 }}
          >
            {deleteTarget.url}
          </p>
        )}
        <div className="flex justify-end space-x-2 pt-2">
          <Button type="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button onClick={handleDelete} disabled={isDeleting}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
