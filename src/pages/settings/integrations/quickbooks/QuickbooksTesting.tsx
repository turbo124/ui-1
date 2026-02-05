/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '$app/pages/settings/common/hooks/useHandleCurrentCompanyChange';
import { useTranslation } from 'react-i18next';
import { Element } from '$app/components/cards';
import { InputField, SelectField } from '$app/components/forms';
import { useDispatch } from 'react-redux';
import { updateChanges } from '$app/common/stores/slices/company-users';
import { useEffect } from 'react';
import {
  Quickbooks,
  QuickbooksSyncDirection,
  QuickbooksSettings,
} from '$app/common/interfaces/quickbooks';
import { useAtomValue } from 'jotai';
import { companySettingsErrorsAtom } from '$app/pages/settings/common/atoms';

const defaultSync = { direction: QuickbooksSyncDirection.None };

const defaultQuickbooksSettings: QuickbooksSettings = {
  client: { ...defaultSync },
  invoice: { ...defaultSync },
  vendor: { ...defaultSync },
  sales: { ...defaultSync },
  quote: { ...defaultSync },
  purchase_order: { ...defaultSync },
  product: { ...defaultSync },
  payment: { ...defaultSync },
  expense: { ...defaultSync },
  default_income_account: '',
  default_expense_account: '',
};

const defaultQuickbooks: Quickbooks = {
  accessTokenKey: '',
  refresh_token: '',
  realmID: '',
  accessTokenExpiresAt: 0,
  refreshTokenExpiresAt: 0,
  baseURL: '',
  companyName: '',
  settings: defaultQuickbooksSettings,
};

const syncDirectionOptions = [
  { value: QuickbooksSyncDirection.None, label: 'None' },
  { value: QuickbooksSyncDirection.Push, label: 'Push' },
  { value: QuickbooksSyncDirection.Pull, label: 'Pull' },
  { value: QuickbooksSyncDirection.Bidirectional, label: 'Bidirectional' },
];

const syncEntityKeys: (keyof QuickbooksSettings)[] = [
  'client',
  'invoice',
  'vendor',
  'sales',
  'quote',
  'purchase_order',
  'product',
  'payment',
  'expense',
];

export function QuickbooksTesting() {
  const [t] = useTranslation();
  const companyChanges = useCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const dispatch = useDispatch();
  const errors = useAtomValue(companySettingsErrorsAtom);

  const qb = companyChanges?.quickbooks;

  useEffect(() => {
    if (companyChanges && qb === undefined) {
      dispatch(
        updateChanges({
          object: 'company',
          property: 'quickbooks',
          value: { ...defaultQuickbooks },
        })
      );
    }
  }, [companyChanges, qb, dispatch]);

  if (!companyChanges) {
    return null;
  }

  const quickbooks = qb ?? defaultQuickbooks;
  const settings = quickbooks.settings ?? defaultQuickbooksSettings;

  return (
    <div className="flex flex-col space-y-4">
      <Element leftSide="Access Token Key">
        <InputField
          id="quickbooks-accessTokenKey"
          value={quickbooks.accessTokenKey ?? ''}
          onValueChange={(value) =>
            handleChange('quickbooks.accessTokenKey', value)
          }
          errorMessage={errors?.errors['quickbooks.accessTokenKey']}
        />
      </Element>

      <Element leftSide="Refresh Token">
        <InputField
          id="quickbooks-refresh_token"
          value={quickbooks.refresh_token ?? ''}
          onValueChange={(value) =>
            handleChange('quickbooks.refresh_token', value)
          }
          errorMessage={errors?.errors['quickbooks.refresh_token']}
        />
      </Element>

      <Element leftSide="Realm ID">
        <InputField
          id="quickbooks-realmID"
          value={quickbooks.realmID ?? ''}
          onValueChange={(value) => handleChange('quickbooks.realmID', value)}
          errorMessage={errors?.errors['quickbooks.realmID']}
        />
      </Element>

      <Element leftSide="Access Token Expires At">
        <InputField
          id="quickbooks-accessTokenExpiresAt"
          type="number"
          value={String(quickbooks.accessTokenExpiresAt ?? 0)}
          onValueChange={(value) =>
            handleChange(
              'quickbooks.accessTokenExpiresAt',
              value ? Number(value) : 0
            )
          }
          errorMessage={
            errors?.errors['quickbooks.accessTokenExpiresAt']
          }
        />
      </Element>

      <Element leftSide="Refresh Token Expires At">
        <InputField
          id="quickbooks-refreshTokenExpiresAt"
          type="number"
          value={String(quickbooks.refreshTokenExpiresAt ?? 0)}
          onValueChange={(value) =>
            handleChange(
              'quickbooks.refreshTokenExpiresAt',
              value ? Number(value) : 0
            )
          }
          errorMessage={
            errors?.errors['quickbooks.refreshTokenExpiresAt']
          }
        />
      </Element>

      <Element leftSide="Base URL">
        <InputField
          id="quickbooks-baseURL"
          value={quickbooks.baseURL ?? ''}
          onValueChange={(value) =>
            handleChange('quickbooks.baseURL', value)
          }
          errorMessage={errors?.errors['quickbooks.baseURL']}
        />
      </Element>

      <Element leftSide="Company Name">
        <InputField
          id="quickbooks-companyName"
          value={quickbooks.companyName ?? ''}
          onValueChange={(value) =>
            handleChange('quickbooks.companyName', value)
          }
          errorMessage={errors?.errors['quickbooks.companyName']}
        />
      </Element>

      <Element leftSide="Default Income Account">
        <InputField
          id="quickbooks-default_income_account"
          value={settings.default_income_account ?? ''}
          onValueChange={(value) =>
            handleChange(
              'quickbooks.settings.default_income_account',
              value
            )
          }
        />
      </Element>

      <Element leftSide="Default Expense Account">
        <InputField
          id="quickbooks-default_expense_account"
          value={settings.default_expense_account ?? ''}
          onValueChange={(value) =>
            handleChange(
              'quickbooks.settings.default_expense_account',
              value
            )
          }
        />
      </Element>

      {syncEntityKeys.map((entityKey) => (
        <Element key={entityKey} leftSide={`Sync: ${entityKey.replace('_', ' ')}`}>
          <SelectField
            value={settings[entityKey]?.direction ?? QuickbooksSyncDirection.None}
            onValueChange={(value) =>
              handleChange(
                `quickbooks.settings.${entityKey}.direction`,
                value as QuickbooksSyncDirection
              )
            }
            customSelector
            dismissable={false}
          >
            {syncDirectionOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </SelectField>
        </Element>
      ))}
    </div>
  );
}
