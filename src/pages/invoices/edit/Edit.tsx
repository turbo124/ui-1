/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom, useAtomValue } from 'jotai';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { ExternalLink } from 'react-feather';
import { useTranslation } from 'react-i18next';
import {
  Link as RouterLink,
  useNavigate,
  useOutletContext,
  useSearchParams,
} from 'react-router-dom';
import { useColorScheme } from '$app/common/colors';
import { route } from '$app/common/helpers/route';
import { toast } from '$app/common/helpers/toast/toast';
import {
  ProductTaskTab,
  reactSettingsAtom,
  useReactSettings,
  useSaveReactSettingWithRollback,
} from '$app/common/hooks/useReactSettings';
import { useScrollToLineItem } from '$app/common/hooks/useScrollToLineItem';
import { Client } from '$app/common/interfaces/client';
import { Invoice as IInvoice, Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { Project } from '$app/common/interfaces/project';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Assigned } from '$app/components/Assigned';
import { Badge } from '$app/components/Badge';
import { Card } from '$app/components/cards';
import { Button, InputLabel, Link } from '$app/components/forms';
import { HiddenResourceTaxesAlert } from '$app/components/HiddenResourceTaxesAlert';
import { Icon } from '$app/components/icons/Icon';
import { Modal } from '$app/components/Modal';
import { PreferenceHint } from '$app/components/PreferenceHint';
import { Spinner } from '$app/components/Spinner';
import { TabGroup } from '$app/components/TabGroup';
import { TaxExemptBadge } from '$app/pages/clients/show/components/TaxExemptBadge';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { useStatusThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import { invoiceSumAtom } from '../common/atoms';
import { ClientSelector } from '../common/components/ClientSelector';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import { InvoicePreview } from '../common/components/InvoicePreview';
import { InvoiceStatus as InvoiceStatusBadge } from '../common/components/InvoiceStatus';
import { InvoiceTotals } from '../common/components/InvoiceTotals';
import { ProductsTable } from '../common/components/ProductsTable';
import { TasksTabLabel } from '../common/components/TasksTabLabel';
import { useProductColumns } from '../common/hooks/useProductColumns';
import { useTaskColumns } from '../common/hooks/useTaskColumns';
import { useInvoiceUtilities } from '../create/hooks/useInvoiceUtilities';
import { TaxDataBadge } from './components/TaxDataBadge';
import { resolveInvoiceEditTab } from './resolveInvoiceEditTab';

const INVOICE_EDIT_DEFAULT_TAB_HINT_VERSION = 1;

export interface Context {
  invoice: Invoice | undefined;
  setInvoice: Dispatch<SetStateAction<Invoice | undefined>>;
  isDefaultTerms: boolean;
  setIsDefaultTerms: Dispatch<SetStateAction<boolean>>;
  isDefaultFooter: boolean;
  setIsDefaultFooter: Dispatch<SetStateAction<boolean>>;
  errors: ValidationBag | undefined;
  client: Client | undefined;
}

export default function Edit() {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  const context: Context = useOutletContext();
  const {
    invoice,
    isDefaultTerms,
    setIsDefaultTerms,
    isDefaultFooter,
    setIsDefaultFooter,
    errors,
    client,
  } = context;

  const taskColumns = useTaskColumns();
  const reactSettings = useReactSettings();
  const reactSettingsHydrated = useAtomValue(reactSettingsAtom) !== null;
  const saveReactSetting = useSaveReactSettingWithRollback();
  const productColumns = useProductColumns();

  const [preferenceModalTab, setPreferenceModalTab] =
    useState<ProductTaskTab | null>(null);
  const [isPreferenceSaving, setIsPreferenceSaving] = useState(false);

  const preferredInvoiceEditTab =
    reactSettings.preferences.preferred_tabs?.invoice_edit;
  const invoiceEditTab = resolveInvoiceEditTab(
    searchParams.get('table'),
    preferredInvoiceEditTab
  );
  const effectivePreferredInvoiceEditTab =
    preferredInvoiceEditTab ?? 'products';
  const preferenceHintState =
    reactSettings.preferences.preference_hints?.invoice_edit_default_tab;
  const shouldPulsePreferenceHint =
    (preferenceHintState?.version ?? 0) < INVOICE_EDIT_DEFAULT_TAB_HINT_VERSION;

  useScrollToLineItem(Boolean(invoice && client));

  useEffect(() => {
    if (searchParams.get('focus') === 'number') {
      requestAnimationFrame(() => document.getElementById('number')?.focus());
    }
  }, [searchParams]);

  const [invoiceSum] = useAtom(invoiceSumAtom);

  const {
    handleChange,
    handleInvitationChange,
    handleContactCanSignChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
  } = useInvoiceUtilities({ client });

  const { changeTemplateVisible, setChangeTemplateVisible } =
    useChangeTemplate();

  const statusThemeColors = useStatusThemeColorScheme();

  const openPreferenceModal = (tab: ProductTaskTab) => {
    setPreferenceModalTab(tab);

    if (shouldPulsePreferenceHint) {
      saveReactSetting(
        'preferences.preference_hints.invoice_edit_default_tab',
        {
          version: INVOICE_EDIT_DEFAULT_TAB_HINT_VERSION,
          seen_at: Math.floor(Date.now() / 1000),
        }
      ).catch(() => undefined);
    }
  };

  const savePreferredInvoiceEditTab = async () => {
    if (!preferenceModalTab || isPreferenceSaving) {
      return;
    }

    setIsPreferenceSaving(true);
    toast.processing();

    try {
      await saveReactSetting(
        'preferences.preferred_tabs.invoice_edit',
        preferenceModalTab
      );

      toast.success('updated_settings');
      setPreferenceModalTab(null);
    } catch {
      toast.error('an_error_occurred');
    } finally {
      setIsPreferenceSaving(false);
    }
  };

  const preferenceModalTabLabel = preferenceModalTab
    ? t(preferenceModalTab)
    : '';

  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <Card
          className="col-span-12 xl:col-span-4 h-max px-6 py-2 shadow-sm"
          style={{ borderColor: colors.$24 }}
        >
          <div className="flex flex-col space-y-4">
            {invoice && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-9">
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.$22 }}
                  >
                    {t('status')}
                  </span>

                  <div className="flex items-center space-x-2">
                    <InvoiceStatusBadge entity={invoice} />

                    {invoice &&
                      invoice.sync?.dn_completed &&
                      invoice.sync?.invitations[0]?.dn_id && (
                        <Badge
                          variant="green"
                          style={{ backgroundColor: statusThemeColors.$3 }}
                        >
                          <RouterLink
                            className="font-medium"
                            to={`/docuninja/${invoice.sync?.invitations[0]?.dn_id}`}
                          >
                            {t('signed_document')}
                          </RouterLink>
                        </Badge>
                      )}
                  </div>
                </div>

                <TaxExemptBadge
                  isTaxExempt={Boolean(invoice.client?.is_tax_exempt)}
                />
              </div>
            )}

            {invoice && invoice.recurring_id && (
              <div className="flex items-center space-x-9">
                <span
                  className="text-sm font-medium"
                  style={{ color: colors.$22 }}
                >
                  {t('recurring_invoice')}
                </span>

                <Link
                  to={route('/recurring_invoices/:id/edit', {
                    id: invoice.recurring_id,
                  })}
                >
                  {t('view')}
                </Link>
              </div>
            )}

            {invoice &&
              invoice.sync?.dn_completed &&
              invoice.sync?.invitations[0]?.dn_id && (
                <div className="flex items-center space-x-9">
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.$22 }}
                  >
                    {t('signed_document')}
                  </span>

                  <Link
                    to={`/docuninja/${invoice.sync?.invitations[0]?.dn_id}`}
                  >
                    {t('link')}
                  </Link>
                </div>
              )}

            <Assigned
              entityId={invoice?.project_id}
              cacheEndpoint="/api/v1/projects"
              apiEndpoint="/api/v1/projects/:id?include=client"
              componentCallbackFn={(resource: Project) => (
                <div className="flex space-x-4">
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.$22 }}
                  >
                    {t('project')}:
                  </span>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{resource.name}</span>

                    <div
                      className="cursor-pointer"
                      onClick={() =>
                        navigate(
                          route('/projects/:id', { id: invoice?.project_id })
                        )
                      }
                    >
                      <Icon
                        element={ExternalLink}
                        style={{ width: '1.17rem', height: '1.17rem' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            />

            <ClientSelector
              resource={invoice}
              onChange={(id) => handleChange('client_id', id)}
              onClearButtonClick={() => handleChange('client_id', '')}
              onLocationChange={(locationId) =>
                handleChange('location_id', locationId)
              }
              onContactCheckboxChange={handleInvitationChange}
              onContactCanSignCheckboxChange={handleContactCanSignChange}
              errorMessage={errors?.errors.client_id}
              textOnly
              readonly
              afterClientName={<TaxDataBadge resource={invoice} />}
            />
          </div>
        </Card>

        <InvoiceDetails
          invoice={invoice}
          handleChange={handleChange}
          errors={errors}
        />

        <div className="col-span-12">
          {invoice && (
            <HiddenResourceTaxesAlert className="mb-2" resource={invoice} />
          )}

          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={invoiceEditTab === 'tasks' ? 1 : 0}
            formatTabLabel={(index) => {
              if (index === 1) {
                return <TasksTabLabel lineItems={invoice?.line_items || []} />;
              }
            }}
            renderTabAccessory={(index) => {
              const tab: ProductTaskTab = index === 1 ? 'tasks' : 'products';

              if (
                !reactSettingsHydrated ||
                tab === effectivePreferredInvoiceEditTab
              ) {
                return;
              }

              const tabLabel = t(tab);

              return (
                <PreferenceHint
                  label={t('make_tab_default_for_invoice_editing', {
                    tab: tabLabel,
                    defaultValue:
                      'Make {{tab}} the default tab for invoice editing',
                  })}
                  pulsing={shouldPulsePreferenceHint}
                  onClick={() => openPreferenceModal(tab)}
                  cypressRef={`invoiceEdit${tab}PreferenceHint`}
                />
              );
            }}
          >
            <div className="w-full">
              {invoice && client ? (
                <ProductsTable
                  type="product"
                  resource={invoice}
                  shouldCreateInitialLineItem={invoiceEditTab === 'products'}
                  items={invoice.line_items.filter((item) =>
                    [
                      InvoiceItemType.Product,
                      InvoiceItemType.UnpaidFee,
                      InvoiceItemType.PaidFee,
                      InvoiceItemType.LateFee,
                    ].includes(item.type_id)
                  )}
                  columns={productColumns}
                  relationType="client_id"
                  onLineItemChange={handleLineItemChange}
                  onSort={(lineItems) => handleChange('line_items', lineItems)}
                  onLineItemPropertyChange={handleLineItemPropertyChange}
                  onCreateItemClick={() =>
                    handleCreateLineItem(InvoiceItemType.Product)
                  }
                  onDeleteRowClick={handleDeleteLineItem}
                />
              ) : (
                <Spinner />
              )}
            </div>

            <div>
              {invoice && client ? (
                <ProductsTable
                  type="task"
                  resource={invoice}
                  shouldCreateInitialLineItem={invoiceEditTab === 'tasks'}
                  items={invoice.line_items.filter(
                    (item) => item.type_id === InvoiceItemType.Task
                  )}
                  columns={taskColumns}
                  relationType="client_id"
                  onLineItemChange={handleLineItemChange}
                  onSort={(lineItems) => handleChange('line_items', lineItems)}
                  onLineItemPropertyChange={handleLineItemPropertyChange}
                  onCreateItemClick={() =>
                    handleCreateLineItem(InvoiceItemType.Task)
                  }
                  onDeleteRowClick={handleDeleteLineItem}
                />
              ) : (
                <Spinner />
              )}
            </div>
          </TabGroup>
        </div>

        <InvoiceFooter
          invoice={invoice}
          handleChange={handleChange}
          errors={errors}
          isDefaultFooter={isDefaultFooter}
          isDefaultTerms={isDefaultTerms}
          setIsDefaultFooter={setIsDefaultFooter}
          setIsDefaultTerms={setIsDefaultTerms}
        />

        {invoice && (
          <InvoiceTotals
            relationType="client_id"
            resource={invoice}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {invoice && (
            <InvoicePreview
              for="invoice"
              resource={invoice}
              entity="invoice"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
              observable={true}
              initiallyVisible={false}
              withRemoveLogoCTA
            />
          )}
        </div>
      )}

      <Modal
        visible={preferenceModalTab !== null}
        onClose={() => setPreferenceModalTab(null)}
        title={t('open_invoices_on_tab', {
          tab: preferenceModalTabLabel,
          defaultValue: 'Open invoices on {{tab}}?',
        })}
        size="extraSmall"
        disableClosing={isPreferenceSaving}
      >
        <p>
          {t('default_invoice_edit_tab_help', {
            tab: preferenceModalTabLabel,
            defaultValue:
              'Make {{tab}} the default tab when editing an invoice. Links that select a tab will still take priority.',
          })}
        </p>

        <div className="flex justify-end gap-2">
          <Button
            type="secondary"
            behavior="button"
            onClick={() => setPreferenceModalTab(null)}
            disabled={isPreferenceSaving}
            disableWithoutIcon
          >
            {t('cancel')}
          </Button>

          <Button
            behavior="button"
            onClick={savePreferredInvoiceEditTab}
            disabled={isPreferenceSaving}
          >
            {t('make_this_the_default', {
              defaultValue: 'Make this the default',
            })}
          </Button>
        </div>
      </Modal>

      {invoice ? (
        <ChangeTemplateModal<IInvoice>
          entity="invoice"
          entities={[invoice]}
          visible={changeTemplateVisible}
          setVisible={setChangeTemplateVisible}
          labelFn={(invoice) => (
            <div className="flex flex-col space-y-1">
              <InputLabel>{t('number')}</InputLabel>

              <span>{invoice.number}</span>
            </div>
          )}
          bulkUrl="/api/v1/invoices/bulk"
        />
      ) : null}
    </>
  );
}
