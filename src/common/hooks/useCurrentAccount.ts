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

export function useCurrentAccount() {
  const companyUserState = useSelector(
    (state: RootState) => state.companyUsers
  );

  return companyUserState.api[companyUserState.currentIndex]?.account;
}
