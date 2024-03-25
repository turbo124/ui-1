/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectOption } from '$app/components/datatables/Actions';
import { useStatusThemeColorByIndex } from '$app/pages/settings/user/components/StatusColorTheme';
import { useTranslation } from 'react-i18next';

export function usePaymentFilters() {
  const [t] = useTranslation();

  const statusThemeColorByIndex = useStatusThemeColorByIndex();

  const filters: SelectOption[] = [
    {
      label: t('all'),
      value: 'all',
      color: 'black',
      backgroundColor: '#e4e4e4',
    },
    {
      label: t('pending'),
      value: 'pending',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('cancelled'),
      value: 'cancelled',
      color: 'white',
      backgroundColor: statusThemeColorByIndex(3) || '#93C5FD',
    },
    {
      label: t('failed'),
      value: 'failed',
      color: 'white',
      backgroundColor: statusThemeColorByIndex(4) || '#DC2626',
    },
    {
      label: t('completed'),
      value: 'completed',
      color: 'white',
      backgroundColor: statusThemeColorByIndex(2) || '#22C55E',
    },
    {
      label: t('partially_refunded'),
      value: 'partially_refunded',
      color: 'white',
      backgroundColor: statusThemeColorByIndex(1) || '#1D4ED8',
    },
    {
      label: t('refunded'),
      value: 'refunded',
      color: 'white',
      backgroundColor: '#6B7280',
    },
    {
      label: t('partially_unapplied'),
      value: 'partially_unapplied',
      color: 'white',
      backgroundColor: '#bf83cc',
    },
  ];

  return filters;
}
