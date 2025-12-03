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
  setCurrentCompanyIndex,
  setCurrentCompanyId,
  setGlobalAuthToken,
} from '$app/common/helpers/company-storage';

export function useLogin() {
  const dispatch = useDispatch();

  return (response: AxiosResponse) => {
    clearCurrentCompanyIndex();

    let currentIndex = 0;

    const companyUsers: CompanyUser[] = response.data.data;

    // Store company ID mappings for all companies
    companyUsers.forEach((companyUser, index) => {
      if (companyUser.company?.id) {
        setCompanyIdMapping(index, companyUser.company.id);
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
    
    // Set the current company ID globally
    if (companyUsers[currentIndex]?.company?.id) {
      setCurrentCompanyId(companyUsers[currentIndex].company.id);
    }
    
    // Store the token GLOBALLY (not company-scoped)
    // This allows any tab to authenticate and then get company list via /refresh
    setGlobalAuthToken(companyUsers[currentIndex].token.token);

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
