/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { set } from 'lodash';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Authenticated, Registered } from '../../dtos/authentication';
import { setCompanyItem, setCompanyIdMapping, setCurrentCompanyIndex } from '../../helpers/company-storage';

interface UserState {
  authenticated: boolean;
  user: any;
  changes: any;
}

const initialState: UserState = {
  authenticated: false,
  user: {},
  changes: {},
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state.user = action.payload;
    },
    injectInChanges: (state) => {
      state.changes = state.user;
    },
    injectInChangesWithData: (state, action) => {
      state.changes = action.payload;
    },
    resetChanges: (state) => {
      state.changes = state.user;
    },
    authenticate: (state, action: PayloadAction<Authenticated>) => {
      state.authenticated = true;
      state.user = action.payload.user;

      // Note: Token storage is handled by useLogin() hook which stores ALL company tokens
      // This reducer just updates Redux state
    },
    register: (state, action: PayloadAction<Registered>) => {
      state.authenticated = true;
      state.user = action.payload.user;

      // Store token in company-scoped storage
      const userWithCompany = action.payload.user as any;
      if (userWithCompany?.company_user?.company?.id) {
        const companyId = userWithCompany.company_user.company.id;
        setCompanyIdMapping(0, companyId);
        setCurrentCompanyIndex(0);
        setCompanyItem('X-NINJA-TOKEN', action.payload.token, companyId);
      } else {
        // Fallback for backward compatibility
        setCompanyItem('X-NINJA-TOKEN', action.payload.token);
      }
    },
    updateChanges: (
      state,
      action: PayloadAction<{ property: string; value: any }>
    ) => {
      set(state.changes, action.payload.property, action.payload.value);
    },
    deletePassword: (state) => {
      delete state.changes['password'];
      delete state.user['password'];
    },
  },
});

export const {
  updateUser,
  injectInChanges,
  injectInChangesWithData,
  resetChanges,
  authenticate,
  register,
  updateChanges,
  deletePassword,
} = userSlice.actions;
