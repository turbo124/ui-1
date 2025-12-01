/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from 'react-query';

export const keys = {
  invoices: {
    path: '/api/v1/invoices',
    dependencies: [
      '/api/v1/clients',
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/activities/entity',
      '/api/v1/activities',
      '/api/v1/documents',
      '/api/v1/tasks',
    ],
  },
  designs: {
    path: '/api/v1/designs',
    dependencies: [
      '/api/v1/invoices',
      '/api/v1/quotes',
      '/api/v1/credits',
      '/api/v1/recurring_invoices',
      '/api/v1/purchase_orders',
      '/api/v1/expenses',
    ],
  },
  tokens: {
    path: '/api/v1/tokens',
    dependencies: [],
  },
  webhooks: {
    path: '/api/v1/webhooks',
    dependencies: [],
  },
  company_gateways: {
    path: '/api/v1/company_gateways',
    dependencies: [],
  },
  credits: {
    path: '/api/v1/credits',
    dependencies: ['/api/v1/clients', '/api/v1/documents'],
  },
  expense_categories: {
    path: '/api/v1/expense_categories',
    dependencies: [
      '/api/v1/expenses',
      '/api/v1/recurring_expenses',
      '/api/v1/bank_transaction_rules',
      '/api/v1/vendors',
      '/api/v1/bank_transactions',
    ],
  },
  expenses: {
    path: '/api/v1/expenses',
    dependencies: [
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/documents',
    ],
  },
  group_settings: {
    path: '/api/v1/group_settings',
    dependencies: ['/api/v1/clients', '/api/v1/clients/show_settings'],
  },
  payments: {
    path: '/api/v1/payments',
    dependencies: [
      '/api/v1/expenses',
      '/api/v1/invoices',
      '/api/v1/clients',
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/activities',
      '/api/v1/documents',
    ],
  },
  purchase_orders: {
    path: '/api/v1/purchase_orders',
    dependencies: ['/api/v1/vendors'],
  },
  recurring_expenses: {
    path: '/api/v1/recurring_expenses',
    dependencies: ['/api/v1/vendors', '/api/v1/documents'],
  },
  task_statuses: {
    path: '/api/v1/task_statuses',
    dependencies: ['/api/v1/tasks'],
  },
  tasks: {
    path: '/api/v1/tasks',
    dependencies: ['/api/v1/projects', '/api/v1/documents'],
  },
  tax_rates: {
    path: '/api/v1/tax_rates',
    dependencies: [
      '/api/v1/invoices',
      '/api/v1/quotes',
      '/api/v1/credits',
      '/api/v1/recurring_invoices',
      '/api/v1/purchase_orders',
    ],
  },
  bank_transactions: {
    path: '/api/v1/bank_transactions',
    dependencies: [
      '/api/v1/payments',
      '/api/v1/invoices',
      '/api/v1/vendors',
      '/api/v1/expenses',
      '/api/v1/expense_categories',
    ],
  },
  bank_transaction_rules: {
    path: '/api/v1/bank_transaction_rules',
    dependencies: ['/api/v1/bank_transactions'],
  },
  vendors: {
    path: '/api/v1/vendors',
    dependencies: [
      '/api/v1/expenses',
      '/api/v1/recurring_expenses',
      '/api/v1/purchase_orders',
      '/api/v1/activities/entity',
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/activities',
    ],
  },
  users: {
    path: '/api/v1/users',
    dependencies: [
      '/api/v1/tasks',
      '/api/v1/invoices',
      '/api/v1/quotes',
      '/api/v1/credits',
      '/api/v1/recurring_invoices',
      '/api/v1/projects',
      '/api/v1/payments',
      '/api/v1/expenses',
      '/api/v1/tasks',
    ],
  },
  company_users: {
    path: '/api/v1/company_users',
    dependencies: [],
  },
  clients: {
    path: '/api/v1/clients',
    dependencies: [
      '/api/v1/tasks',
      '/api/v1/invoices',
      '/api/v1/quotes',
      '/api/v1/credits',
      '/api/v1/recurring_invoices',
      '/api/v1/projects',
      '/api/v1/payments',
      '/api/v1/expenses',
      '/api/v1/recurring_expenses',
      '/api/v1/tasks',
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/documents',
      '/api/v1/clients/show_settings',
    ],
  },
  products: {
    path: '/api/v1/products',
    dependencies: ['/api/v1/subscriptions', '/api/v1/invoices'],
  },
  projects: {
    path: '/api/v1/projects',
    dependencies: ['/api/v1/tasks', '/api/v1/documents'],
  },
  quotes: {
    path: '/api/v1/quotes',
    dependencies: [
      '/api/v1/clients',
      '/api/v1/activities',
      '/api/v1/documents',
    ],
  },
  recurring_invoices: {
    path: '/api/v1/recurring_invoices',
    dependencies: [
      '/api/v1/clients',
      '/api/v1/activities/entity',
      '/api/v1/documents',
    ],
  },
  bank_integrations: {
    path: '/api/v1/bank_integrations',
    dependencies: ['/api/v1/bank_transactions'],
  },
  documents: {
    path: '/api/v1/documents',
    dependencies: [],
  },
  payment_terms: {
    path: '/api/v1/payment_terms',
    dependencies: [],
  },
  statics: {
    path: '/api/v1/statics',
    dependencies: [],
  },
  task_schedulers: {
    path: '/api/v1/task_schedulers',
    dependencies: [],
  },
  subscriptions: {
    path: '/api/v1/subscriptions',
    dependencies: [],
  },
  activities: {
    path: '/api/v1/activities',
    dependencies: ['/api/v1/activities/entity'],
  },
  entity_validations: {
    path: '/api/v1/einvoice/validateEntity',
    dependencies: [],
  },
};

export type RefetchKey = keyof typeof keys;

/**
 * Determines which dependencies actually need to be invalidated.
 * 
 * RULES:
 * 1. Charts ALWAYS need updates (they aggregate data)
 * 2. Activities ALWAYS need updates (they show history)
 * 3. Documents for the SAME entity need updates
 * 4. Related entities (clients, vendors) DO NOT need invalidation by default
 *    - Client list doesn't change when invoice amount changes
 *    - Use deep:true if you need the old cascade behavior
 */
function getSmartDependencies(key: RefetchKey): string[] {
  const allDeps = keys[key].dependencies;
  
  // Filter to only "smart" dependencies that should auto-update
  return allDeps.filter(dep => {
    // Always invalidate charts - they aggregate data across entities
    if (dep.includes('/charts/')) return true;
    
    // Always invalidate activities - they show entity change history
    if (dep.includes('/activities')) return true;
    
    // Always invalidate documents - they're directly attached to entity
    if (dep === '/api/v1/documents') return true;
    
    // DO NOT automatically invalidate related entities to prevent cascades
    // Examples of what we're filtering OUT:
    // - /api/v1/clients (client list doesn't change when invoice amount changes)
    // - /api/v1/invoices (invoice list doesn't change when payment is made)
    // - /api/v1/tasks (task list doesn't change when project name changes)
    // 
    // If you need these, use $refetch(['invoices'], { deep: true })
    return false;
  });
}

export function useRefetch() {
  const queryClient = useQueryClient();

  return (
    property: Array<keyof typeof keys>,
    options: { deep?: boolean } = {}
  ) => {
    const { deep = false } = options;

    property.forEach((key) => {
      if (!keys[key]) {
        console.warn(`[useRefetch] Unknown refetch key: ${String(key)}`);
        return;
      }

      const entityPath = keys[key].path;

      // Invalidate the main entity queries
      // Only invalidate queries that actually exist in the cache
      const cachedQueries = queryClient
        .getQueryCache()
        .findAll({ predicate: (query) => {
          const queryKey = query.queryKey;
          if (Array.isArray(queryKey)) {
            return queryKey[0] === entityPath || 
                   (typeof queryKey[0] === 'string' && queryKey[0].startsWith(entityPath));
          }
          return queryKey === entityPath;
        }});

      cachedQueries.forEach((query) => {
        queryClient.invalidateQueries({ queryKey: query.queryKey });
      });

      // Handle dependencies based on the deep flag
      if (deep) {
        // OLD BEHAVIOR: Invalidate all dependencies (use sparingly)
        keys[key].dependencies.forEach((dependency) => {
          queryClient.invalidateQueries(dependency);
        });
      } else {
        // NEW BEHAVIOR: Only invalidate "smart" dependencies
        // These are dependencies that actually need to update when the entity changes
        const smartDeps = getSmartDependencies(key);
        smartDeps.forEach((dependency) => {
          const depQueries = queryClient
            .getQueryCache()
            .findAll({ predicate: (query) => {
              const queryKey = query.queryKey;
              if (Array.isArray(queryKey)) {
                return queryKey[0] === dependency || 
                       (typeof queryKey[0] === 'string' && queryKey[0].startsWith(dependency));
              }
              return queryKey === dependency;
            }});
          
          depQueries.forEach((query) => {
            queryClient.invalidateQueries({ queryKey: query.queryKey });
          });
        });
      }
    });
  };
}

export function $refetch(
  property: Array<RefetchKey>,
  options?: { deep?: boolean }
) {
  window.dispatchEvent(
    new CustomEvent('refetch', {
      detail: {
        property,
        options,
      },
    })
  );
}

export function getRefetchKeyByUrl(endpoint: string) {
  const key = Object.keys(keys).find(
    (key) =>
      keys[key as keyof typeof keys].path.startsWith(endpoint) ||
      endpoint.startsWith(keys[key as keyof typeof keys].path)
  );

  return key;
}

/**
 * Use with caution. Generally you should avoid using this,
 * and only use it when you know what you're doing. Prefer $refetch over this.
 *
 * This is fallback for states where $refetch is not available as we don't know plain string/resource,
 * we are working it so we have to fallback to domain lookup.
 *
 * @param endpoint string[]
 */
export function refetchByUrl(endpoint: string[]) {
  endpoint.map((url) => {
    const key = getRefetchKeyByUrl(url);

    if (key) {
      $refetch([key as keyof typeof keys]);
    }
  });
}
