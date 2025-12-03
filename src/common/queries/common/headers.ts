/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { isHosted } from '$app/common/helpers';
import { socketId } from '../sockets';
import { 
  getCompanyItem, 
  getCurrentCompanyIndex, 
  getCompanyIdForIndex 
} from '$app/common/helpers/company-storage';

export function defaultHeaders() {
  // Get current company ID from index
  const currentIndex = getCurrentCompanyIndex();
  const companyId = getCompanyIdForIndex(currentIndex);
  
  const headers: Record<string, string | number | boolean> = {
    'X-Api-Token': (companyId ? getCompanyItem('X-NINJA-TOKEN', companyId) : getCompanyItem('X-NINJA-TOKEN')) as string,
    'X-Requested-With': 'XMLHttpRequest',
    'X-React': 'true',
  };

  if (socketId() && isHosted()) {
    headers['X-Socket-ID'] = socketId()!;
  }

  return headers;
}
