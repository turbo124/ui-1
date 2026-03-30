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
import { useQuery } from 'react-query';
import { Spinner } from '$app/components/Spinner';
import { CompanySummaryCards } from './CompanySummaryCards';
import { RiskDistributionBar } from './RiskDistributionBar';
import { ClientRiskTable } from './ClientRiskTable';
import { ClientPaymentAnalyticsResponse } from './interfaces';

interface Props {
  body: { start_date: string; end_date: string; date_range: string };
}

export function ClientPaymentAnalytics(props: Props) {
  const query = useQuery({
    queryKey: ['/api/v1/charts/client_payment_analytics', props.body],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/client_payment_analytics'),
        props.body
      ).then(
        (response) => response.data as ClientPaymentAnalyticsResponse
      ),
    staleTime: Infinity,
  });

  return (
    <div>
      {query.isLoading && (
        <div className="w-full flex justify-center mt-4">
          <Spinner />
        </div>
      )}

      <CompanySummaryCards
        data={query.data?.company_summary}
        thresholds={query.data?.thresholds}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-8">
        <div className="xl:col-span-1">
          <RiskDistributionBar clients={query.data?.clients || []} />
        </div>

        <div className="xl:col-span-2">
          <ClientRiskTable clients={query.data?.clients || []} />
        </div>
      </div>
    </div>
  );
}
