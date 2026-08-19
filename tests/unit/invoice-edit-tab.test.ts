import { describe, expect, test } from 'vitest';
import { resolveInvoiceEditTab } from '../../src/pages/invoices/edit/resolveInvoiceEditTab';

describe('resolveInvoiceEditTab', () => {
  test('uses products when there is no explicit or saved preference', () => {
    expect(resolveInvoiceEditTab(null)).toBe('products');
  });

  test('uses the saved preference when the URL does not select a tab', () => {
    expect(resolveInvoiceEditTab(null, 'tasks')).toBe('tasks');
  });

  test.each([
    'products',
    'tasks',
  ] as const)('gives the explicit %s URL value priority over the saved preference', (requestedTab) => {
    const otherTab = requestedTab === 'products' ? 'tasks' : 'products';

    expect(resolveInvoiceEditTab(requestedTab, otherTab)).toBe(requestedTab);
  });

  test('ignores unknown URL values', () => {
    expect(resolveInvoiceEditTab('unknown', 'tasks')).toBe('tasks');
  });
});
