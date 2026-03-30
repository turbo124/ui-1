/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Spinner } from '$app/components/Spinner';
import { ForecastToolbar } from './ForecastToolbar';
import { ForecastKPICards } from './ForecastKPICards';
import { ForecastChart } from './ForecastChart';
import { InflowDonut } from './InflowDonut';
import { CashFlowForecastResponse } from './interfaces';
import dayjs from 'dayjs';

export function CashFlowForecast() {
  const [bucketType, setBucketType] = useState('monthly');
  const [rangeMonths, setRangeMonths] = useState('6');

  const body = {
    start_date: dayjs().format('YYYY-MM-DD'),
    end_date: dayjs()
      .add(parseInt(rangeMonths), 'months')
      .format('YYYY-MM-DD'),
    bucket_type: bucketType,
  };

  const query = useQuery({
    queryKey: ['/api/v1/charts/cashflow_forecast', body],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/cashflow_forecast'),
        body
      ).then((response) => response.data as CashFlowForecastResponse),
    staleTime: Infinity,
  });

  return (
    <div>
      <ForecastToolbar
        bucketType={bucketType}
        rangeMonths={rangeMonths}
        onBucketTypeChange={setBucketType}
        onRangeChange={setRangeMonths}
      />

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
