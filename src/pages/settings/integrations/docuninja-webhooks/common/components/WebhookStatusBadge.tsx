/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from '$app/components/Badge';
import { DocuNinjaWebhook } from '$app/common/interfaces/docuninja/webhook';

interface Props {
  webhook: DocuNinjaWebhook;
}

export function WebhookStatusBadge(props: Props) {
  const { webhook } = props;

  if (!webhook.is_active && webhook.disabled_at) {
    return <Badge variant="red">Auto-Disabled</Badge>;
  }

  if (!webhook.is_active) {
    return <Badge variant="yellow">Disabled</Badge>;
  }

  return <Badge variant="green">Active</Badge>;
}
