/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { request } from '$app/common/helpers/request';
import { CompanyUser } from '$app/common/interfaces/company-user';
import {
  changeCurrentIndex,
  resetChanges,
  updateCompanyUsers,
} from '$app/common/stores/slices/company-users';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { AuthenticationTypes } from '../dtos/authentication';
import { endpoint } from '../helpers';
import { authenticate } from '../stores/slices/user';
import { RootState } from '../stores/store';
import dayjs from 'dayjs';
import { 
  getCompanyItem, 
  setCompanyIdMapping, 
  setCurrentCompanyIndex, 
  removeCompanyItem,
  getCurrentCompanyIndex,
  getCompanyIdForIndex,
  setCompanyItem,
} from '../helpers/company-storage';

export function useAuthenticated(): boolean {
  const user = useSelector((state: RootState) => state.user);
  
  // Get current company index and ID
  const currentIndex = getCurrentCompanyIndex();
  const companyId = getCompanyIdForIndex(currentIndex);
  
  // Get token for current company
  const token = companyId ? getCompanyItem('X-NINJA-TOKEN', companyId) : null;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  if (token === null) {
    return false;
  }

  if (user.authenticated) {
    return true;
  }

  queryClient.fetchQuery('/api/v1/refresh', () =>
    request(
      'POST',
      endpoint('/api/v1/refresh?updated_at=:updatedAt', {
        updatedAt: dayjs().unix(),
      })
    )
      .then((response) => {
        // Store company ID mapping for all companies
        const companyUsers: CompanyUser[] = response.data.data;
        companyUsers.forEach((companyUser, index) => {
          if (companyUser.company?.id) {
            setCompanyIdMapping(index, companyUser.company.id);
            // Store token for each company
            setCompanyItem('X-NINJA-TOKEN', companyUser.token.token, companyUser.company.id);
          }
        });

        let currentIndex = getCurrentCompanyIndex();
        
        // If no current index, use default company
        if (currentIndex === 0 && !getCompanyIdForIndex(0)) {
          const defaultCompanyId = companyUsers[0].account.default_company_id;
          currentIndex = companyUsers.findIndex(
            (companyUser) => companyUser.company.id === defaultCompanyId
          );
          
          if (currentIndex === -1) {
            currentIndex = 0;
          }
        }

        setCurrentCompanyIndex(currentIndex);
        
        // Get the company ID for the current index
        const selectedCompanyId = getCompanyIdForIndex(currentIndex);

        dispatch(
          authenticate({
            type: AuthenticationTypes.TOKEN,
            user: response.data.data[currentIndex].user,
            token: selectedCompanyId ? getCompanyItem('X-NINJA-TOKEN', selectedCompanyId) as string : companyUsers[currentIndex].token.token,
          })
        );

        dispatch(updateCompanyUsers(response.data.data));
        dispatch(resetChanges('company'));
        dispatch(changeCurrentIndex(currentIndex));
      })
      .catch((e) => {
        console.error(e);

        removeCompanyItem('X-NINJA-TOKEN');

        navigate('/login');
      })
  );

  return true;
}
