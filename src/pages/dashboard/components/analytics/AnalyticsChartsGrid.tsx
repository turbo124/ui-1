/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { AnalyticsChart } from './AnalyticsChart';
import { AnalyticsSummaryCurrencyData } from './interfaces';

interface Props {
  data: AnalyticsSummaryCurrencyData | undefined;
  currency: string;
  chartSensitivity: 'day' | 'week' | 'month';
}

export function AnalyticsChartsGrid(props: Props) {
  const [t] = useTranslation();
  const { data, currency, chartSensitivity } = props;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
      <AnalyticsChart
        title={t('mrr')}
        data={data?.mrr || []}
        currency={currency}
        chartType="line"
        yAxisFormat="money"
        color="#2176FF"
        chartSensitivity={chartSensitivity}
      />

      <AnalyticsChart
        title={t('avg_payment_days')}
        data={data?.payment_delay || []}
        currency={currency}
        chartType="line"
        yAxisFormat="days"
        color="#F59E0B"
        chartSensitivity={chartSensitivity}
      />

      <AnalyticsChart
        title={t('late_payment_rate')}
        data={data?.late_payment_rate || []}
        currency={currency}
        chartType="line"
        yAxisFormat="percent"
        color="#EF4444"
        chartSensitivity={chartSensitivity}
      />

      <AnalyticsChart
        title={t('quote_pipeline')}
        data={data?.quote_pipeline || []}
        currency={currency}
        chartType="area"
        yAxisFormat="money"
        color="#22C55E"
        chartSensitivity={chartSensitivity}
      />
    </div>
  );
}
