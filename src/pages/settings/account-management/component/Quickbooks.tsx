/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { Button } from '$app/components/forms';
import { SelectField } from '$app/components/forms/SelectField';
import { InputField } from '$app/components/forms/InputField';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { QuickbooksSyncDirection } from '$app/common/interfaces/quickbooks';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

export function Quickbooks() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const company = useInjectCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag>();

  const isConnected = Boolean(company?.quickbooks?.accessTokenKey);
  const quickbooksSettings = company?.quickbooks?.settings;

  const syncDirectionOptions = [
    { value: QuickbooksSyncDirection.None, label: t('none') },
    { value: QuickbooksSyncDirection.Push, label: t('push') },
    { value: QuickbooksSyncDirection.Pull, label: t('pull') },
    { value: QuickbooksSyncDirection.Bidirectional, label: t('bidirectional') },
  ];

  const handleConnect = () => {
    // TODO: Implement QuickBooks OAuth connection flow
    toast.processing();
    // This would typically redirect to QuickBooks OAuth
    // window.location.href = endpoint('/api/v1/quickbooks/connect');
  };

  const handleDisconnect = () => {
    if (isFormBusy) return;

    toast.processing();
    setIsFormBusy(true);
    setErrors(undefined);

    request('POST', endpoint('/api/v1/quickbooks/disconnect'), {})
      .then(() => {
        toast.success('disconnected');
        $refetch(['companies']);
      })
      .catch((error: AxiosError<ValidationBag>) => {
        if (error.response?.status === 422) {
          setErrors(error.response.data);
          toast.dismiss();
        } else {
          toast.error();
        }
      })
      .finally(() => setIsFormBusy(false));
  };

  const handleSyncDirectionChange = (
    entity: string,
    direction: QuickbooksSyncDirection
  ) => {
    handleChange(`quickbooks.settings.${entity}.direction`, direction);
  };

  const handleIncomeAccountIdChange = (value: string) => {
    handleChange('quickbooks.settings.qb_income_account_id', value || null);
  };

  return (
    <Card
      title="QuickBooks"
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
    >
      <div className="space-y-4">
        <Element leftSide={t('status')}>
          {isConnected ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: colors.$3 }}>
                {t('connected')}
              </span>
              <Button
                type="minimal"
                behavior="button"
                onClick={handleDisconnect}
                disabled={isFormBusy}
              >
                {t('disconnect')}
              </Button>
            </div>
          ) : (
            <Button
              type="minimal"
              behavior="button"
              onClick={handleConnect}
              disabled={isFormBusy}
            >
              {t('connect')}
            </Button>
          )}
        </Element>

        {isConnected && quickbooksSettings && (
          <>
            <div className="border-t pt-4" style={{ borderColor: colors.$20 }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: colors.$3 }}>
                {t('sync_settings')}
              </h3>

            <Element leftSide={t('client')}>
              <SelectField
                value={quickbooksSettings.client?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('client', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('invoice')}>
              <SelectField
                value={quickbooksSettings.invoice?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('invoice', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('vendor')}>
              <SelectField
                value={quickbooksSettings.vendor?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('vendor', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('sales')}>
              <SelectField
                value={quickbooksSettings.sales?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('sales', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('quote')}>
              <SelectField
                value={quickbooksSettings.quote?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('quote', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('purchase_order')}>
              <SelectField
                value={quickbooksSettings.purchase_order?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('purchase_order', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('product')}>
              <SelectField
                value={quickbooksSettings.product?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('product', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('payment')}>
              <SelectField
                value={quickbooksSettings.payment?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('payment', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('expense')}>
              <SelectField
                value={quickbooksSettings.expense?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('expense', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('expense_category')}>
              <SelectField
                value={quickbooksSettings.expense_category?.direction ?? QuickbooksSyncDirection.None}
                onValueChange={(value) =>
                  handleSyncDirectionChange('expense_category', value as QuickbooksSyncDirection)
                }
                customSelector
                dismissable={false}
              >
                {syncDirectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectField>
            </Element>

            <Element leftSide={t('qb_income_account_id')}>
              <SelectField
                value={quickbooksSettings.qb_income_account_id || ''}
                onValueChange={handleIncomeAccountIdChange}
                errorMessage={errors?.errors?.['quickbooks.settings.qb_income_account_id']}
                customSelector
                withBlank
              >
                {quickbooksSettings.income_account_map &&
                  quickbooksSettings.income_account_map.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.name} ({entry.fully_qualified_name})
                    </option>
                  ))}
              </SelectField>
            </Element>
            </div>

            <div className="border-t pt-4" style={{ borderColor: colors.$20 }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: colors.$3 }}>
                {t('read_only_settings')}
              </h3>

              <Element leftSide={t('automatic_taxes')}>
                <div className="text-sm" style={{ color: colors.$3 }}>
                  {quickbooksSettings.automatic_taxes ? t('yes') : t('no')}
                </div>
              </Element>

              {quickbooksSettings.income_account_map &&
                quickbooksSettings.income_account_map.length > 0 && (
                  <Element leftSide={t('income_account_map')}>
                    <div className="space-y-2">
                      {quickbooksSettings.income_account_map.map((entry, index) => (
                        <div
                          key={index}
                          className="text-sm p-2 rounded"
                          style={{ backgroundColor: colors.$4, color: colors.$3 }}
                        >
                          <div>
                            <strong>{t('id')}:</strong> {entry.id}
                          </div>
                          <div>
                            <strong>{t('name')}:</strong> {entry.name}
                          </div>
                          <div>
                            <strong>{t('fully_qualified_name')}:</strong> {entry.fully_qualified_name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Element>
                )}

              {quickbooksSettings.tax_rate_map &&
                quickbooksSettings.tax_rate_map.length > 0 && (
                  <Element leftSide={t('tax_rate_map')}>
                    <div className="space-y-2">
                      {quickbooksSettings.tax_rate_map.map((entry, index) => (
                        <div
                          key={index}
                          className="text-sm p-2 rounded"
                          style={{ backgroundColor: colors.$4, color: colors.$3 }}
                        >
                          <div>
                            <strong>{t('id')}:</strong> {entry.id}
                          </div>
                          <div>
                            <strong>{t('name')}:</strong> {entry.name}
                          </div>
                          <div>
                            <strong>{t('rate')}:</strong> {entry.rate}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </Element>
                )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
