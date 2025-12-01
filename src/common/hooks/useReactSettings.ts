/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { RootState } from '$app/common/stores/store';
import { useSelector } from 'react-redux';
import { useInjectUserChanges } from './useInjectUserChanges';
import { useMemo } from 'react';
import { cloneDeep } from 'lodash';
import { Record as ClientMapRecord } from '../constants/exports/client-map';
import { Entity } from '$app/components/CommonActionsPreferenceModal';
import { PerPage } from '$app/components/DataTable';
import { ThemeColorField } from '$app/pages/settings/user/components/StatusColorTheme';
import { ClientShowCard } from '$app/pages/clients/show/components/CardsCustomizationModal';

export type ChartsDefaultView = 'day' | 'week' | 'month';

export interface TableFiltersPreference {
  filter?: string;
  customFilter?: string[];
  currentPage?: number;
  sort?: string;
  status: string[];
  sortedBy?: string;
  perPage?: PerPage;
}

export interface Preferences {
  dashboard_charts: {
    default_view: 'day' | 'week' | 'month';
    range: string;
    currency: number;
  };
  datatables: {
    clients: {
      sort: string;
    };
  };
  reports: {
    columns: Record<string, ClientMapRecord[][]>;
  };
  auto_expand_product_table_notes: boolean;
  enable_public_notifications: boolean | null;
  use_system_fonts: boolean;
  use_legacy_editor: boolean;
  feedback_slider_displayed_at: number;
  feedback_given_at: number;
}

export type ImportTemplates = Record<string, Record<string, (string | null)[]>>;

type ColorTheme = Record<ThemeColorField, string>;

export interface ReactSettings {
  show_pdf_preview: boolean;
  react_table_columns?: Record<ReactTableColumns, string[]>;
  react_notification_link: boolean;
  number_precision?: number;
  show_document_preview?: boolean;
  preferences: Preferences;
  table_filters?: Record<string, TableFiltersPreference>;
  common_actions?: Record<Entity, string[]>;
  show_mini_sidebar?: boolean;
  import_templates?: ImportTemplates;
  table_footer_columns?: Record<ReactTableColumns, string[]>;
  show_table_footer?: boolean;
  dark_mode?: boolean;
  color_theme?: ColorTheme;
  client_show_cards?: ClientShowCard[];
}

export type ReactTableColumns =
  | 'invoice'
  | 'client'
  | 'product'
  | 'recurringInvoice'
  | 'payment'
  | 'quote'
  | 'credit'
  | 'project'
  | 'task'
  | 'vendor'
  | 'purchaseOrder'
  | 'expense'
  | 'recurringExpense'
  | 'clientDocument'
  | 'transaction';

export const preferencesDefaults: Preferences = {
  dashboard_charts: {
    default_view: 'month',
    currency: 1,
    range: 'this_month',
  },
  datatables: {
    clients: {
      sort: 'id|desc',
    },
  },
  reports: {
    columns: {},
  },
  auto_expand_product_table_notes: false,
  enable_public_notifications: null,
  use_system_fonts: false,
  use_legacy_editor: false,
  feedback_slider_displayed_at: 0,
  feedback_given_at: 0,
};

interface Options {
  overwrite?: boolean;
}

export function useReactSettings(options?: Options) {
  const user = useInjectUserChanges({ overwrite: options?.overwrite });

  const reactSettings = useSelector(
    (state: RootState) => state.user.changes?.company_user?.react_settings
  );

  const previousReactTableColumns =
    user?.company_user?.settings?.react_table_columns;

  // Memoize the settings computation to prevent unnecessary recalculations
  // We use cloneDeep to avoid mutation of the shared preferencesDefaults object
  // The memoization only recomputes when reactSettings or previousReactTableColumns change
  return useMemo(() => {
    // Start with a deep clone of defaults to prevent any mutation issues
    const basePreferences = cloneDeep(preferencesDefaults);
    
    const settings: ReactSettings = {
      show_pdf_preview: true,
      react_notification_link: true,
      preferences: basePreferences,
    };

    // Manually merge to avoid lodash.merge mutation issues
    // Spread operator for top-level is safe and fast
    const result = { ...settings, ...reactSettings };
    
    // Handle nested react_table_columns merge (legacy fallback)
    if (previousReactTableColumns || reactSettings?.react_table_columns) {
      result.react_table_columns = {
        ...previousReactTableColumns,
        ...reactSettings?.react_table_columns,
      };
    }
    
    // Deep merge preferences if user has custom preferences
    if (reactSettings?.preferences) {
      result.preferences = {
        ...basePreferences,
        ...reactSettings.preferences,
        // Handle nested objects in preferences
        dashboard_charts: {
          ...basePreferences.dashboard_charts,
          ...reactSettings.preferences.dashboard_charts,
        },
        datatables: {
          ...basePreferences.datatables,
          ...reactSettings.preferences.datatables,
          clients: {
            ...basePreferences.datatables.clients,
            ...reactSettings.preferences.datatables?.clients,
          },
        },
        reports: {
          ...basePreferences.reports,
          ...reactSettings.preferences.reports,
        },
      };
    }
    
    return result;
  }, [
    previousReactTableColumns,
    reactSettings,
  ]);
}
