/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { clearAllCompanyStorage } from './company-storage';

export function clearLocalStorage() {
  // Clear all company-scoped storage
  // Each company is isolated - logout clears ALL company contexts
  clearAllCompanyStorage();
}
