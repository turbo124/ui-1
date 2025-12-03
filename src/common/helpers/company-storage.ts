/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

/**
 * Company-scoped localStorage abstraction.
 * Each company has isolated storage - Company A cannot see Company B's data.
 * All storage keys are namespaced by company ID.
 */

const GLOBAL_CURRENT_INDEX_KEY = 'X-CURRENT-INDEX';

/**
 * Get the current company ID from localStorage or passed parameter
 */
function getCurrentCompanyId(companyId?: string): string | null {
  if (companyId) {
    return companyId;
  }
  
  // Try to get from current index in localStorage
  const currentIndex = localStorage.getItem(GLOBAL_CURRENT_INDEX_KEY);
  if (!currentIndex) {
    return null;
  }
  
  // We'll store a mapping of index -> company ID
  const companyIdMapping = localStorage.getItem('X-COMPANY-ID-MAPPING');
  if (!companyIdMapping) {
    return null;
  }
  
  try {
    const mapping = JSON.parse(companyIdMapping);
    return mapping[currentIndex] || null;
  } catch {
    return null;
  }
}

/**
 * Generate namespaced key for company-specific storage
 */
function getNamespacedKey(key: string, companyId?: string): string {
  const currentCompanyId = getCurrentCompanyId(companyId);
  
  if (!currentCompanyId) {
    // Fallback to non-namespaced for backwards compatibility during migration
    return key;
  }
  
  return `company_${currentCompanyId}_${key}`;
}

/**
 * Set an item in company-scoped storage
 */
export function setCompanyItem(key: string, value: string, companyId?: string): void {
  const namespacedKey = getNamespacedKey(key, companyId);
  localStorage.setItem(namespacedKey, value);
}

/**
 * Get an item from company-scoped storage
 */
export function getCompanyItem(key: string, companyId?: string): string | null {
  const namespacedKey = getNamespacedKey(key, companyId);
  return localStorage.getItem(namespacedKey);
}

/**
 * Remove an item from company-scoped storage
 */
export function removeCompanyItem(key: string, companyId?: string): void {
  const namespacedKey = getNamespacedKey(key, companyId);
  localStorage.removeItem(namespacedKey);
}

/**
 * Clear all storage for the current company
 */
export function clearCompanyStorage(companyId?: string): void {
  const currentCompanyId = getCurrentCompanyId(companyId);
  
  if (!currentCompanyId) {
    return;
  }
  
  const prefix = `company_${currentCompanyId}_`;
  const keysToRemove: string[] = [];
  
  // Find all keys for this company
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  
  // Remove them
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Clear ALL company storage (used on logout)
 */
export function clearAllCompanyStorage(): void {
  const keysToRemove: string[] = [];
  
  // Find all company-namespaced keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('company_')) {
      keysToRemove.push(key);
    }
  }
  
  // Remove them
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Also clear the company ID mapping
  localStorage.removeItem('X-COMPANY-ID-MAPPING');
  localStorage.removeItem(GLOBAL_CURRENT_INDEX_KEY);
}

/**
 * Set the company ID mapping for a given index
 * This maps X-CURRENT-INDEX to actual company ID
 */
export function setCompanyIdMapping(index: number, companyId: string): void {
  const mappingStr = localStorage.getItem('X-COMPANY-ID-MAPPING');
  let mapping: Record<string, string> = {};
  
  if (mappingStr) {
    try {
      mapping = JSON.parse(mappingStr);
    } catch {
      mapping = {};
    }
  }
  
  mapping[index.toString()] = companyId;
  localStorage.setItem('X-COMPANY-ID-MAPPING', JSON.stringify(mapping));
}

/**
 * Get the company ID for a given index
 */
export function getCompanyIdForIndex(index: number): string | null {
  const mappingStr = localStorage.getItem('X-COMPANY-ID-MAPPING');
  
  if (!mappingStr) {
    return null;
  }
  
  try {
    const mapping = JSON.parse(mappingStr);
    return mapping[index.toString()] || null;
  } catch {
    return null;
  }
}

/**
 * Set the current company index (global, not namespaced)
 */
export function setCurrentCompanyIndex(index: number): void {
  localStorage.setItem(GLOBAL_CURRENT_INDEX_KEY, index.toString());
}

/**
 * Get the current company index (global, not namespaced)
 */
export function getCurrentCompanyIndex(): number {
  const index = localStorage.getItem(GLOBAL_CURRENT_INDEX_KEY);
  return index ? parseInt(index, 10) : 0;
}

/**
 * Clear the current company index (used during logout/login)
 */
export function clearCurrentCompanyIndex(): void {
  localStorage.removeItem(GLOBAL_CURRENT_INDEX_KEY);
}

/**
 * Check if ANY X-NINJA-TOKEN exists in localStorage (for initial auth check)
 * This is used during page load to determine if user was previously authenticated
 */
export function hasAnyToken(): boolean {
  // First check if we have a token for the current company
  const currentIndex = getCurrentCompanyIndex();
  const companyId = getCompanyIdForIndex(currentIndex);
  
  if (companyId) {
    const token = getCompanyItem('X-NINJA-TOKEN', companyId);
    if (token) {
      return true;
    }
  }
  
  // Fallback: check for any company_*_X-NINJA-TOKEN in localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('_X-NINJA-TOKEN')) {
      return true;
    }
  }
  
  // Legacy fallback: check for non-namespaced token
  if (localStorage.getItem('X-NINJA-TOKEN')) {
    return true;
  }
  
  return false;
}
