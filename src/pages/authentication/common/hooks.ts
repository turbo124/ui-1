/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { AxiosResponse } from 'axios';
import { AuthenticationTypes } from '$app/common/dtos/authentication';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  changeCurrentIndex,
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { authenticate } from '$app/common/stores/slices/user';
import { useDispatch } from 'react-redux';
import {
  clearCurrentCompanyIndex,
  setCompanyIdMapping,
  setCompanyItem,
  setCurrentCompanyIndex,
} from '$app/common/helpers/company-storage';

export function useLogin() {
  const dispatch = useDispatch();

  return (response: AxiosResponse) => {
    clearCurrentCompanyIndex();

    let currentIndex = 0;

    const companyUsers: CompanyUser[] = response.data.data;

    // Store ALL company tokens, not just the default one
    // This ensures that /refresh can work from any tab
    companyUsers.forEach((companyUser, index) => {
      if (companyUser.company?.id && companyUser.token?.token) {
        setCompanyIdMapping(index, companyUser.company.id);
        setCompanyItem('X-NINJA-TOKEN', companyUser.token.token, companyUser.company.id);
      }
    });

    const defaultCompanyId = companyUsers[0].account.default_company_id;

    currentIndex = companyUsers.findIndex(
      (companyUser) => companyUser.company.id === defaultCompanyId
    );

    if (currentIndex === -1) {
      currentIndex = 0;
    }

    // Set the current company index
    setCurrentCompanyIndex(currentIndex);

    dispatch(
      authenticate({
        type: AuthenticationTypes.TOKEN,
        user: response.data.data[currentIndex].user,
        token: response.data.data[currentIndex].token.token,
      })
    );

    dispatch(updateCompanyUsers(response.data.data));
    dispatch(resetChanges('company'));
    dispatch(changeCurrentIndex(currentIndex));
  };
}
