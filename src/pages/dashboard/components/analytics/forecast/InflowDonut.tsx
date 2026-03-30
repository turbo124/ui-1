/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ForecastBucket } from './interfaces';

interface Props {
  buckets: ForecastBucket[];
}

const COLORS = {
  outstanding_invoices: '#3b82f6',
  recurring_invoices: '#22c55e',
  quote_pipeline: '#8b5cf6',
};

export function InflowDonut(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const colors = useColorScheme();
  const companyCurrency = company?.settings?.currency_id || '1';

  const segments = useMemo(() => {
    const totals = { outstanding_invoices: 0, recurring_invoices: 0, quote_pipeline: 0 };

    (props.buckets || []).forEach((bucket) => {
      totals.outstanding_invoices += bucket.inflows.outstanding_invoices.amount;
      totals.recurring_invoices += bucket.inflows.recurring_invoices.amount;
      totals.quote_pipeline += bucket.inflows.quote_pipeline.amount;
    });

    const grand = totals.outstanding_invoices + totals.recurring_invoices + totals.quote_pipeline;

    return [
      {
        name: t('outstanding_invoices'),
        value: totals.outstanding_invoices,
        color: COLORS.outstanding_invoices,
        percent: grand > 0 ? ((totals.outstanding_invoices / grand) * 100).toFixed(0) : '0',
      },
      {
        name: t('recurring_invoices'),
        value: totals.recurring_invoices,
        color: COLORS.recurring_invoices,
        percent: grand > 0 ? ((totals.recurring_invoices / grand) * 100).toFixed(0) : '0',
      },
      {
        name: t('quote_pipeline'),
        value: totals.quote_pipeline,
        color: COLORS.quote_pipeline,
        percent: grand > 0 ? ((totals.quote_pipeline / grand) * 100).toFixed(0) : '0',
      },
    ];
  }, [props.buckets]);

  return (
    <Card
      title={t('inflow_sources')}
      className="shadow-sm mt-8"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <div className="flex items-center px-4 pb-4">
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={segments}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
                strokeWidth={0}
              >
                {segments.map((segment, index) => (
                  <Cell key={index} fill={segment.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col space-y-3 ml-6">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-sm" style={{ color: colors.$3 }}>
                {segment.name}:
              </span>
              <span className="text-sm font-mono" style={{ color: colors.$3 }}>
                {formatMoney(
                  segment.value,
                  company?.settings.country_id,
                  companyCurrency,
                  0
                )}
              </span>
              <span className="text-xs text-gray-400">({segment.percent}%)</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
