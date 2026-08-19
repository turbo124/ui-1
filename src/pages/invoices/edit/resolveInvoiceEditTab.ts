/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { ProductTaskTab } from '$app/common/hooks/useReactSettings';

export function resolveInvoiceEditTab(
  requestedTab: string | null,
  preferredTab?: ProductTaskTab
): ProductTaskTab {
  if (requestedTab === 'products' || requestedTab === 'tasks') {
    return requestedTab;
  }

  return preferredTab ?? 'products';
}
