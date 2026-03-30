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
import { ForecastKPICards } from './ForecastKPICards';
import { ForecastChart } from './ForecastChart';
import { InflowDonut } from './InflowDonut';
import { CashFlowForecastResponse } from './interfaces';

interface Props {
  body: { start_date: string; end_date: string; date_range: string };
}

export function CashFlowForecast(props: Props) {
  const query = useQuery({
    queryKey: ['/api/v1/charts/cashflow_forecast', props.body],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/cashflow_forecast'),
        props.body
      ).then((response) => response.data as CashFlowForecastResponse),
    staleTime: Infinity,
  });

  return (
    <div>
      {query.isLoading && (
        <div className="w-full flex justify-center mt-4">
          <Spinner />
        </div>
      )}

      <ForecastKPICards data={query.data?.totals} />

      <ForecastChart buckets={query.data?.buckets || []} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <InflowDonut buckets={query.data?.buckets || []} />
      </div>
    </div>
  );
}
