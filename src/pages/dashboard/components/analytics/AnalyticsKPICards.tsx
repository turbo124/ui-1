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
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { Badge } from '$app/components/Badge';
import {
  AnalyticsTotalsCurrencyData,
  AgingTotals,
  RecurringExpensesTotals,
} from './interfaces';

interface Props {
  data: AnalyticsTotalsCurrencyData | undefined;
  currency: string;
}

function totalOutstanding(aging: AgingTotals | undefined): number {
  if (!aging) return 0;
  return (
    aging.current_amount +
    aging.age_0_30 +
    aging.age_31_60 +
    aging.age_61_90 +
    aging.age_91_120 +
    aging.age_120_plus
  );
}

export function AnalyticsKPICards(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const colors = useColorScheme();

  const { data, currency } = props;

  const kpis = [
    {
      label: t('mrr'),
      value: formatMoney(
        data?.mrr?.mrr || 0,
        company?.settings.country_id,
        currency,
        2
      ),
      suffix: `/ ${t('month')}`,
      color: '#2176FF',
      bgColor: '#2176FF26',
    },
    {
      label: t('arr'),
      value: formatMoney(
        data?.mrr?.arr || 0,
        company?.settings.country_id,
        currency,
        2
      ),
      suffix: `/ ${t('year')}`,
      color: '#7C3AED',
      bgColor: '#7C3AED26',
    },
    {
      label: t('avg_payment_days'),
      value: data?.payment_analytics
        ? `${Math.round(data.payment_analytics.avg_payment_days)}`
        : '—',
      suffix: t('days'),
      color: '#F59E0B',
      bgColor: '#F59E0B26',
    },
    {
      label: t('late_payment_rate'),
      value: data?.payment_analytics
        ? `${(data.payment_analytics.late_payment_ratio * 100).toFixed(0)}%`
        : '—',
      suffix: '',
      color: '#EF4444',
      bgColor: '#EF444426',
    },
    {
      label: t('outstanding'),
      value: formatMoney(
        totalOutstanding(data?.aging),
        company?.settings.country_id,
        currency,
        2
      ),
      suffix: '',
      color: '#22C55E',
      bgColor: '#22C55E26',
    },
    {
      label: t('recurring_expenses'),
      value: formatMoney(
        data?.recurring_expenses?.monthly_total || 0,
        company?.settings.country_id,
        currency,
        2
      ),
      suffix: `/ ${t('month')}`,
      color: '#F97316',
      bgColor: '#F9731626',
    },
    {
      label: t('net_mrr'),
      value: formatMoney(
        (data?.mrr?.mrr || 0) - (data?.recurring_expenses?.monthly_total || 0),
        company?.settings.country_id,
        currency,
        2
      ),
      suffix: `/ ${t('month')}`,
      color: '#1E293B',
      bgColor: '#1E293B1A',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 mt-4">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          withoutBodyPadding
        >
          <div className="flex flex-col p-4">
            <span className="text-sm text-gray-500">{kpi.label}</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <Badge style={{ backgroundColor: kpi.bgColor }}>
                <span
                  className="text-lg font-mono font-semibold"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </span>
              </Badge>
              {kpi.suffix && (
                <span className="text-xs text-gray-400">{kpi.suffix}</span>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
