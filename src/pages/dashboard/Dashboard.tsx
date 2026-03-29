/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Activity } from '$app/pages/dashboard/components/Activity';
import { PastDueInvoices } from '$app/pages/dashboard/components/PastDueInvoices';
import { RecentPayments } from '$app/pages/dashboard/components/RecentPayments';
import { Totals } from '$app/pages/dashboard/components/Totals';
import { UpcomingInvoices } from '$app/pages/dashboard/components/UpcomingInvoices';
import { useTranslation } from 'react-i18next';
import { Default } from '../../components/layouts/Default';
import { ExpiredQuotes } from './components/ExpiredQuotes';
import { UpcomingQuotes } from './components/UpcomingQuotes';
import { useEnabled } from '$app/common/guards/guards/enabled';
import { ModuleBitmask } from '../settings';
import { UpcomingRecurringInvoices } from './components/UpcomingRecurringInvoices';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useOpenFeedbackSlider } from '$app/common/hooks/useOpenFeedbackSlider';
import { useEffect, useState } from 'react';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { useCurrentUser } from '$app/common/hooks/useCurrentUser';
import { TabGroup } from '$app/components/TabGroup';
import { DashboardToolbar } from './components/DashboardToolbar';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { GLOBAL_DATE_RANGES } from './helpers/helpers';

interface Currency {
  value: string;
  label: string;
}

export default function Dashboard() {
  useTitle('dashboard');

  const [t] = useTranslation();
  const enabled = useEnabled();
  const openFeedbackSlider = useOpenFeedbackSlider();

  const settings = useReactSettings();
  const { update } = usePreferences();
  const currentUser = useCurrentUser();

  const dateRange =
    settings?.preferences?.dashboard_charts?.range || 'this_month';
  const activeTab =
    settings?.preferences?.dashboard_charts?.active_tab || 0;

  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [dates, setDates] = useState<{ start_date: string; end_date: string }>({
    start_date: GLOBAL_DATE_RANGES[dateRange]?.start || '',
    end_date: GLOBAL_DATE_RANGES[dateRange]?.end || '',
  });

  const [body, setBody] = useState<{
    start_date: string;
    end_date: string;
    date_range: string;
  }>({
    start_date: GLOBAL_DATE_RANGES[dateRange]?.start || '',
    end_date: GLOBAL_DATE_RANGES[dateRange]?.end || '',
    date_range: dateRange,
  });

  useEffect(() => {
    setBody((current) => ({
      ...current,
      date_range: dateRange,
    }));
  }, [settings?.preferences?.dashboard_charts?.range]);

  const handleDateChange = (DateSet: string) => {
    const [startDate, endDate] = DateSet.split(',');
    if (new Date(startDate) > new Date(endDate)) {
      setBody({
        start_date: endDate,
        end_date: startDate,
        date_range: 'custom',
      });
    } else {
      setBody({
        start_date: startDate,
        end_date: endDate,
        date_range: 'custom',
      });
    }
  };

  useEffect(() => {
    return () => {
      if (settings?.preferences?.dashboard_charts?.range === 'custom') {
        const currentRange =
          currentUser?.company_user?.react_settings?.preferences
            ?.dashboard_charts?.range;

        update(
          'preferences.dashboard_charts.range',
          currentRange || 'this_month'
        );
      }
    };
  }, []);

  useSocketEvent({
    on: 'App\\Events\\Invoice\\InvoiceWasPaid',
    callback: () => $refetch(['invoices']),
  });

  useEffect(() => {
    openFeedbackSlider();
  }, []);

  return (
    <Default title={t('dashboard')} breadcrumbs={[]}>
      <DashboardToolbar
        currencies={currencies}
        dates={dates}
        dateRange={body.date_range}
        onDateChange={handleDateChange}
      />

      <TabGroup
        tabs={[t('overview'), t('analytics')]}
        defaultTabIndex={activeTab}
        onTabChange={(index) =>
          update('preferences.dashboard_charts.active_tab', index)
        }
        withoutVerticalMargin
      >
        <div>
          <Totals
            body={body}
            onCurrenciesChange={(c) => {
              setCurrencies(c);
              setDates((prev) => ({ ...prev }));
            }}
          />

          <div className="grid grid-cols-12 gap-8 my-8">
            <div className="col-span-12 xl:col-span-6">
              <Activity />
            </div>

            <div className="col-span-12 xl:col-span-6">
              <RecentPayments />
            </div>

            {enabled(ModuleBitmask.Invoices) && (
              <div className="col-span-12 xl:col-span-6">
                <UpcomingInvoices />
              </div>
            )}

            {enabled(ModuleBitmask.Invoices) && (
              <div className="col-span-12 xl:col-span-6">
                <PastDueInvoices />
              </div>
            )}

            {enabled(ModuleBitmask.Quotes) && (
              <div className="col-span-12 xl:col-span-6">
                <ExpiredQuotes />
              </div>
            )}

            {enabled(ModuleBitmask.Quotes) && (
              <div className="col-span-12 xl:col-span-6">
                <UpcomingQuotes />
              </div>
            )}

            {enabled(ModuleBitmask.RecurringInvoices) && (
              <div className="col-span-12 xl:col-span-6">
                <UpcomingRecurringInvoices />
              </div>
            )}
          </div>
        </div>

        <div>
          {activeTab === 1 && (
            <AnalyticsDashboard body={body} />
          )}
        </div>
      </TabGroup>
    </Default>
  );
}
