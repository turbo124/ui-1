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
  
  // Try company-scoped token first, then fallback to ANY token we can find
  let token = companyId ? getCompanyItem('X-NINJA-TOKEN', companyId) : null;
  
  // If no company-scoped token, search for ANY token (for /refresh call)
  if (!token) {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_X-NINJA-TOKEN')) {
        token = localStorage.getItem(key);
        break;
      }
    }
    
    // Legacy fallback
    if (!token) {
      token = localStorage.getItem('X-NINJA-TOKEN');
    }
  }
  
  const headers: Record<string, string | number | boolean> = {
    'X-Api-Token': token as string,
    'X-Requested-With': 'XMLHttpRequest',
    'X-React': 'true',
  };

  if (socketId() && isHosted()) {
    headers['X-Socket-ID'] = socketId()!;
  }

  return headers;
}
