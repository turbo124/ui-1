/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useQuery } from 'react-query';
import { Spinner } from '$app/components/Spinner';
import { AnalyticsKPICards } from './AnalyticsKPICards';
import { AnalyticsChartsGrid } from './AnalyticsChartsGrid';
import { AgingBar } from './AgingBar';
import { PaymentAnalyticsCards } from './PaymentAnalyticsCards';
import {
  AnalyticsSummaryCurrencyData,
  AnalyticsTotalsCurrencyData,
} from './interfaces';

interface Props {
  body: { start_date: string; end_date: string; date_range: string };
}

export function AnalyticsDashboard(props: Props) {
  const settings = useReactSettings();

  const currency = settings?.preferences?.dashboard_charts?.currency || 1;
  const includeDrafts =
    settings?.preferences?.dashboard_charts?.include_drafts || false;

  const summaryQuery = useQuery({
    queryKey: ['/api/v1/charts/analytics_summary', props.body, includeDrafts],
    queryFn: () =>
      request(
        'POST',
        endpoint(
          '/api/v1/charts/analytics_summary?include_drafts=:includeDrafts',
          { includeDrafts }
        ),
        props.body
      ).then((response) => response.data),
    staleTime: Infinity,
  });

  const totalsQuery = useQuery({
    queryKey: ['/api/v1/charts/analytics_totals', props.body, includeDrafts],
    queryFn: () =>
      request(
        'POST',
        endpoint(
          '/api/v1/charts/analytics_totals?include_drafts=:includeDrafts',
          { includeDrafts }
        ),
        props.body
      ).then((response) => response.data),
    staleTime: Infinity,
  });

  const summaryData: AnalyticsSummaryCurrencyData | undefined =
    summaryQuery.data?.[currency];
  const totalsData: AnalyticsTotalsCurrencyData | undefined =
    totalsQuery.data?.[currency];

  const isLoading = summaryQuery.isLoading || totalsQuery.isLoading;

  return (
    <div>
      {isLoading && (
        <div className="w-full flex justify-center mt-4">
          <Spinner />
        </div>
      )}

      <AnalyticsKPICards
        data={totalsData}
        currency={currency.toString()}
      />

      <AnalyticsChartsGrid
        data={summaryData}
        currency={currency.toString()}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <AgingBar
          data={totalsData?.aging}
          currency={currency.toString()}
        />

        {currency === 999 && (
          <div className="mt-8">
            <PaymentAnalyticsCards
              data={totalsData?.payment_analytics}
            />
          </div>
        )}
      </div>
    </div>
  );
}
