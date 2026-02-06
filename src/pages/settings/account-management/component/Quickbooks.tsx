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
import { Modal } from '$app/components/Modal';
import { TabGroup } from '$app/components/TabGroup';
import { Button } from '$app/components/forms';
import { SelectField } from '$app/components/forms/SelectField';
import Toggle from '$app/components/forms/Toggle';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useInjectCompanyChanges } from '$app/common/hooks/useInjectCompanyChanges';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { QuickbooksSyncDirection } from '$app/common/interfaces/quickbooks';
import { request } from '$app/common/helpers/request';
import { endpoint } from '$app/common/helpers';
import { toast } from '$app/common/helpers/toast/toast';
import { useRefreshCompanyUsers } from '$app/common/hooks/useRefreshCompanyUsers';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

export function Quickbooks() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const company = useCurrentCompany();
  const companyChanges = useInjectCompanyChanges();
  const handleChange = useHandleCurrentCompanyChangeProperty();
  const refresh = useRefreshCompanyUsers();
  const [isFormBusy, setIsFormBusy] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationBag>();
  const [initialSyncProduct, setInitialSyncProduct] = useState(false);
  const [initialSyncClient, setInitialSyncClient] = useState(false);
  const [initialSyncInvoice, setInitialSyncInvoice] = useState(false);
  const [isSyncBusy, setIsSyncBusy] = useState(false);
  const [isSyncInfoModalVisible, setIsSyncInfoModalVisible] = useState(false);
  const [isDisconnectModalVisible, setIsDisconnectModalVisible] = useState(false);

  const quickbooks = company?.quickbooks;
  const isConnected = Boolean(
    quickbooks?.accessTokenKey ||
      (quickbooks?.refresh_token && quickbooks.refresh_token.length > 0) ||
      (quickbooks?.realmID && quickbooks.realmID.length > 0)
  );
  const quickbooksSettings = isConnected
    ? (companyChanges?.quickbooks?.settings ?? quickbooks?.settings)
    : undefined;

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
        refresh();
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

  const handleInitialSync = () => {
    if (isSyncBusy) return;
    if (!initialSyncProduct && !initialSyncClient && !initialSyncInvoice) return;

    setIsSyncBusy(true);
    toast.processing();

    request('POST', endpoint('/api/v1/quickbooks/sync'), {
      product: initialSyncProduct,
      client: initialSyncClient,
      invoice: initialSyncInvoice,
    })
      .then(() => {
        toast.success('synced');
        setInitialSyncProduct(false);
        setInitialSyncClient(false);
        setInitialSyncInvoice(false);
        setIsSyncInfoModalVisible(true);
      })
      .catch(() => {
        toast.error();
      })
      .finally(() => {
        setIsSyncBusy(false);
      });
  };

  return (
    <>
    <Card
      title="QuickBooks"
      className="shadow-sm"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutBodyPadding
    >
      {isConnected ? (
        <TabGroup
          tabs={[t('connect'), t('import'), t('sync_settings')]}
          withHorizontalPadding
          fullRightPadding
          horizontalPaddingWidth="1.5rem"
        >
          <div className="space-y-4 px-4 sm:px-6 py-4">
            <Element leftSide={t('status')}>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium" style={{ color: colors.$3 }}>
                  {t('connected')}
                </span>
                <Button
                  type="secondary"
                  behavior="button"
                  onClick={() => setIsDisconnectModalVisible(true)}
                  disabled={isFormBusy}
                  className="!bg-red-600 !border-red-600 !text-white hover:!bg-red-700 hover:!border-red-700"
                >
                  {t('disconnect')}
                </Button>
              </div>
            </Element>
            {quickbooks?.companyName && (
              <Element leftSide={t('company_name')}>
                <span className="text-sm" style={{ color: colors.$3 }}>
                  {quickbooks.companyName}
                </span>
              </Element>
            )}
            {quickbooksSettings && (
              <>
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
                          {entry.name}
                        </option>
                      ))}
                  </SelectField>
                </Element>
                <Element leftSide={t('automatic_taxes')}>
                  <div className="text-sm" style={{ color: colors.$3 }}>
                    {quickbooksSettings.automatic_taxes ? t('yes') : t('no')}
                  </div>
                </Element>
              </>
            )}
          </div>

          <div className="space-y-4 px-4 sm:px-6 py-4">
            <p className="text-sm mb-4" style={{ color: colors.$3 }}>
              {t('sync_data_from_quickbooks_to_invoice_ninja')}
            </p>
            <Element leftSide={t('products')}>
              <Toggle
                checked={initialSyncProduct}
                onChange={(value: boolean) => setInitialSyncProduct(value)}
              />
            </Element>
            <Element leftSide={t('clients')}>
              <Toggle
                checked={initialSyncClient}
                onChange={(value: boolean) => setInitialSyncClient(value)}
              />
            </Element>
            <Element leftSide={t('invoices')}>
              <Toggle
                checked={initialSyncInvoice}
                onChange={(value: boolean) => setInitialSyncInvoice(value)}
              />
            </Element>
            <Element leftSide="">
              <Button
                type="primary"
                behavior="button"
                onClick={handleInitialSync}
                disabled={
                  isSyncBusy ||
                  (!initialSyncProduct && !initialSyncClient && !initialSyncInvoice)
                }
              >
                {t('sync')}
              </Button>
            </Element>
          </div>

          <div className="space-y-4 px-4 sm:px-6 py-4">
            {quickbooksSettings && (
              <>
                <p className="text-sm" style={{ color: colors.$3 }}>
                  {t('sync_settings_quickbooks_help')}
                </p>
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

            <Element leftSide={t('products')}>
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

            <div className="border-t pt-4 mt-4" style={{ borderColor: colors.$20 }}>
              <h3 className="text-sm font-medium mb-4" style={{ color: colors.$3 }}>
                {t('read_only_settings')}
              </h3>

              {quickbooksSettings.income_account_map &&
                quickbooksSettings.income_account_map.length > 0 && (
                  <Element leftSide={t('income_account_map')}>
                    <div
                      className="grid grid-cols-2 gap-2 text-sm"
                      style={{ color: colors.$3 }}
                    >
                      {quickbooksSettings.income_account_map.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="p-2 rounded truncate"
                          style={{ backgroundColor: colors.$4 }}
                          title={entry.name}
                        >
                          {entry.name}
                        </div>
                      ))}
                    </div>
                  </Element>
                )}

              {quickbooksSettings.tax_rate_map &&
                quickbooksSettings.tax_rate_map.length > 0 && (
                  <Element leftSide={t('taxes')}>
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
        </TabGroup>
      ) : (
        <div className="space-y-4 px-4 sm:px-6 py-4">
          <Element leftSide={t('status')}>
            <Button
              type="minimal"
              behavior="button"
              onClick={handleConnect}
              disabled={isFormBusy}
            >
              {t('connect')}
            </Button>
          </Element>
        </div>
      )}
    </Card>

    <Modal
      title={t('initial_sync')}
      visible={isSyncInfoModalVisible}
      onClose={() => setIsSyncInfoModalVisible(false)}
    >
      <div className="flex flex-col space-y-4">
        <div className="text-sm whitespace-pre-line" style={{ color: colors.$3 }}>
          {t('quickbooks_sync_info')}
        </div>
        <div className="flex justify-end">
          <Button
            type="secondary"
            behavior="button"
            onClick={() => setIsSyncInfoModalVisible(false)}
          >
            {t('close')}
          </Button>
        </div>
      </div>
    </Modal>

    <Modal
      title={t('disconnect')}
      visible={isDisconnectModalVisible}
      onClose={() => setIsDisconnectModalVisible(false)}
    >
      <div className="flex flex-col space-y-4">
        <p className="text-sm" style={{ color: colors.$3 }}>
          {t('are_you_sure')}
        </p>
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            type="secondary"
            behavior="button"
            onClick={() => setIsDisconnectModalVisible(false)}
          >
            {t('cancel')}
          </Button>
          <Button
            type="secondary"
            behavior="button"
            onClick={() => {
              setIsDisconnectModalVisible(false);
              handleDisconnect();
            }}
            disabled={isFormBusy}
            className="!bg-red-600 !border-red-600 !text-white hover:!bg-red-700 hover:!border-red-700"
          >
            {t('disconnect')}
          </Button>
        </div>
      </div>
    </Modal>
    </>
  );
}
