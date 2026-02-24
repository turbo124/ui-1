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
import { AxiosError } from 'axios';
import { docuNinjaEndpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { toast } from '$app/common/helpers/toast/toast';
import { useTitle } from '$app/common/hooks/useTitle';
import {
  DocuNinjaWebhook,
  WebhookHeader,
} from '$app/common/interfaces/docuninja/webhook';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useInvalidateDocuNinjaWebhooks } from '$app/common/queries/docuninja/webhooks';
import { Settings } from '$app/components/layouts/Settings';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { EventSelector } from './common/components/EventSelector';
import { IncludesSelector } from './common/components/IncludesSelector';
import { SecretRevealModal } from './common/components/SecretRevealModal';
import {
  WebhookHeadersEditor,
  HeaderError,
  validateHeaders,
} from './common/components/WebhookHeadersEditor';

export function Create() {
  const [t] = useTranslation();
  const { documentTitle } = useTitle('new_webhook');

  const colors = useColorScheme();
  const navigate = useNavigate();
  const invalidate = useInvalidateDocuNinjaWebhooks();

  const [url, setUrl] = useState('');
  const [events, setEvents] = useState<string[]>([]);
  const [includes, setIncludes] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [headers, setHeaders] = useState<WebhookHeader[]>([]);
  const [errors, setErrors] = useState<ValidationBag>();
  const [headerErrors, setHeaderErrors] = useState<HeaderError[]>([]);
  const [isFormBusy, setIsFormBusy] = useState(false);

  const [secretModalVisible, setSecretModalVisible] = useState(false);
  const [createdSecret, setCreatedSecret] = useState('');
  const [createdUrl, setCreatedUrl] = useState('');

  const pages = [
    { name: t('docuninja'), href: '/docuninja' },
    { name: t('settings'), href: '/docuninja/settings' },
    {
      name: t('webhooks'),
      href: '/docuninja/settings/webhooks',
    },
    {
      name: 'New Endpoint',
      href: '/docuninja/settings/webhooks/create',
    },
  ];

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
    };

    if (includes.length > 0) {
      payload.includes = includes;
    }

    if (headers.length > 0) {
      payload.headers = headers;
    }

    request('POST', docuNinjaEndpoint('/api/webhooks'), payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('X-DOCU-NINJA-TOKEN')}`,
      },
    })
      .then((response) => {
        toast.success('created_webhook');
        invalidate();

        const webhook = response.data.data as DocuNinjaWebhook;

        if (webhook.secret) {
          setCreatedSecret(webhook.secret);
          setCreatedUrl(webhook.url);
          setSecretModalVisible(true);
        } else {
          navigate('/docuninja/settings/webhooks');
        }
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

  const handleSecretModalClose = () => {
    setSecretModalVisible(false);
    navigate('/docuninja/settings/webhooks');
  };

  return (
    <Settings
      title="Webhooks"
      breadcrumbs={pages}
      disableSaveButton={isFormBusy}
      onSaveClick={handleSave}
    >
      <Card
        title={documentTitle}
        className="shadow-sm"
        style={{ borderColor: colors.$24 }}
        headerStyle={{ borderColor: colors.$20 }}
      >
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
          leftSideHelp="Select which related data to include in the webhook payload. More includes = larger payload."
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

      <SecretRevealModal
        visible={secretModalVisible}
        secret={createdSecret}
        url={createdUrl}
        onClose={handleSecretModalClose}
      />
    </Settings>
  );
}
