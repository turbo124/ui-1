/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { InputField } from '$app/components/forms';
import Toggle from '$app/components/forms/Toggle';
import { AxiosError } from 'axios';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import { WebhookHeader } from '$app/common/interfaces/docuninja/webhook';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import {
  useDocuNinjaWebhookQuery,
  useInvalidateDocuNinjaWebhooks,
} from '$app/common/queries/docuninja/webhooks';
import { Settings } from '$app/components/layouts/Settings';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { EventSelector } from './common/components/EventSelector';
import { IncludesSelector } from './common/components/IncludesSelector';
import {
  WebhookHeadersEditor,
  HeaderError,
  validateHeaders,
} from './common/components/WebhookHeadersEditor';
import { Spinner } from '$app/components/Spinner';

export function Edit() {
  const [t] = useTranslation();
  const { id } = useParams();
  const colors = useColorScheme();
  const navigate = useNavigate();
  const invalidate = useInvalidateDocuNinjaWebhooks();

  useTitle('edit_webhook');

  const { data: webhook, isLoading } = useDocuNinjaWebhookQuery({ id });

  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [headers, setHeaders] = useState<WebhookHeader[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [headerErrors, setHeaderErrors] = useState<HeaderError[]>([]);
  const [isFormBusy, setIsFormBusy] = useState(false);

  const pages = [
    { name: t('docuninja'), href: '/docuninja' },
    { name: t('settings'), href: '/docuninja/settings' },
    {
      name: t('webhooks'),
      href: '/docuninja/settings/webhooks',
    },
    {
      name: 'Edit Endpoint',
      href: `/docuninja/settings/webhooks/${id}/edit`,
    },
  ];

  useEffect(() => {
    if (webhook) {
      setUrl(webhook.url);
      setEvents(webhook.events);
      setIncludes(webhook.includes ?? []);
      setDescription(webhook.description ?? '');
      setIsActive(webhook.is_active);
      setHeaders(webhook.headers ?? []);
    }
  }, [webhook]);

  const handleSave = () => {
    if (isFormBusy) return;

    if (!url.startsWith('https://')) {
      setErrors({
        message: 'Validation failed',
        errors: { url: ['Webhook URLs must use HTTPS.'] },
      });
      return;
    }

    if (events.length === 0) {
      setErrors({
        message: 'Validation failed',
        errors: { events: ['At least one event must be selected.'] },
      });
      return;
    }

    if (headers.length > 0) {
      const headerValidation = validateHeaders(headers);
      if (!headerValidation.valid) {
        setHeaderErrors(headerValidation.errors);
        return;
      }
    }

    toast.processing();
    setIsFormBusy(true);
    setErrors(undefined);
    setHeaderErrors([]);

    const payload: Record<string, unknown> = {
      url,
      events,
      description: description || undefined,
      is_active: isActive,
      includes: includes.length > 0 ? includes : null,
      headers: headers.length > 0 ? headers : null,
    };

    request(
      'PUT',
      docuNinjaEndpoint('/api/webhooks/:id', { id }),
      payload,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
        },
      }
    )
      .then(() => {
        toast.success('updated_webhook');
        invalidate();
        navigate('/docuninja/settings/webhooks');
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          toast.dismiss();
          setErrors(error.response.data);

          const serverErrors = error.response.data.errors;
          if (serverErrors) {
            const mapped: HeaderError[] = [];
            for (let i = 0; i < headers.length; i++) {
              mapped.push({
                name: serverErrors[`headers.${i}.name`]?.[0],
                value: serverErrors[`headers.${i}.value`]?.[0],
              });
            }
            if (mapped.some((e) => e.name || e.value)) {
              setHeaderErrors(mapped);
            }
          }
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  if (isLoading) {
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

  return (
    <Settings
      title="Webhooks"
      breadcrumbs={pages}
      disableSaveButton={isFormBusy}
      onSaveClick={handleSave}
    >
      {webhook && !webhook.is_active && webhook.disabled_at && (
        <div
          className="p-3 rounded-md border text-sm"
          style={{
            backgroundColor: 'rgba(234, 179, 8, 0.1)',
            borderColor: 'rgb(234, 179, 8)',
            color: 'rgb(161, 98, 7)',
          }}
        >
          This endpoint is currently disabled. It was automatically deactivated
          after consecutive delivery failures. Toggle it active to resume
          deliveries. The failure counter will be reset.
        </div>
      )}

      <Card
        title={webhook?.url}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
        <Element leftSide="Active">
          <Toggle
            checked={isActive}
            onValueChange={(value) => setIsActive(value)}
          />
        </Element>

        <Element
          leftSide="URL"
          leftSideHelp="The HTTPS URL that will receive webhook POST requests."
          required
        >
          <InputField
            required
            value={url}
            placeholder="https://example.com/webhooks"
            onValueChange={(value) => {
              setUrl(value);
              setErrors(undefined);
            }}
            errorMessage={errors?.errors?.url?.[0]}
          />
        </Element>

        <Element
          leftSide="Events"
          leftSideHelp="Select which document events trigger this webhook."
          required
        >
          <EventSelector selectedEvents={events} onChange={setEvents} />
          {errors?.errors?.events && (
            <p className="text-red-500 text-xs mt-1">
              {errors.errors.events[0]}
            </p>
          )}
        </Element>

        <Element
          leftSide="Includes"
          leftSideHelp="Select which related data to include in the webhook payload."
        >
          <IncludesSelector
            selectedIncludes={includes}
            onChange={setIncludes}
          />
        </Element>

        <Element
          leftSide="Custom Headers"
          leftSideHelp="Optional. Custom HTTP headers sent with each delivery. Values are encrypted at rest."
          withoutItemsCenter
        >
          <WebhookHeadersEditor
            headers={headers}
            onChange={(h) => {
              setHeaders(h);
              setHeaderErrors([]);
            }}
            errors={headerErrors}
          />
        </Element>

        <Element leftSide="Description" leftSideHelp="Optional. Max 255 characters.">
          <InputField
            value={description}
            placeholder="e.g., Zapier production integration"
            onValueChange={(value) => setDescription(value)}
            errorMessage={errors?.errors?.description?.[0]}
          />
        </Element>
      </Card>
    </Settings>
  );
}
