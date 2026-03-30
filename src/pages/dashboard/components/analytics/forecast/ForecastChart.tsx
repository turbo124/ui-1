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
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  Cell,
  TooltipProps,
} from 'recharts';
import { ForecastBucket } from './interfaces';

interface Props {
  buckets: ForecastBucket[];
}

interface ChartDataPoint {
  period: string;
  outstanding_invoices: number;
  recurring_invoices: number;
  quote_pipeline: number;
  recurring_expenses: number;
  one_off_expenses: number;
  weighted_net: number;
  confidence: number;
}

const COLORS = {
  oi: '#3b82f6',
  ri: '#22c55e',
  qp: '#8b5cf6',
  re: '#f97316',
  oe: '#ef4444',
  net: '#1e293b',
};

export function ForecastChart(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const colors = useColorScheme();
  const companyCurrency = company?.settings?.currency_id || '1';

  const chartData: ChartDataPoint[] = useMemo(() => {
    return (props.buckets || []).map((bucket) => ({
      period: bucket.period,
      outstanding_invoices: bucket.inflows.outstanding_invoices.amount,
      recurring_invoices: bucket.inflows.recurring_invoices.amount,
      quote_pipeline: bucket.inflows.quote_pipeline.amount,
      recurring_expenses: -bucket.outflows.recurring_expenses.amount,
      one_off_expenses: -bucket.outflows.one_off_expenses.amount,
      weighted_net: bucket.weighted_net,
      confidence: bucket.confidence,
    }));
  }, [props.buckets]);

  const fmt = (value: number) =>
    formatMoney(
      Math.abs(value),
      company?.settings.country_id,
      companyCurrency,
      0
    ).toString();

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;

    const bucket = props.buckets.find((b) => b.period === label);

    return (
      <div
        className="p-4 shadow-lg rounded-md border text-sm"
        style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
      >
        <p className="font-semibold mb-2">{label}</p>

        <div className="space-y-1">
          <div className="flex justify-between space-x-6">
            <span style={{ color: COLORS.oi }}>{t('total_outstanding_invoices')}</span>
            <span className="font-mono">
              {fmt(bucket?.inflows.outstanding_invoices.amount || 0)}
              <span className="text-gray-400 ml-1">
                ({bucket?.inflows.outstanding_invoices.count})
              </span>
            </span>
          </div>
          <div className="flex justify-between space-x-6">
            <span style={{ color: COLORS.ri }}>{t('recurring_invoices')}</span>
            <span className="font-mono">
              {fmt(bucket?.inflows.recurring_invoices.amount || 0)}
              <span className="text-gray-400 ml-1">
                ({bucket?.inflows.recurring_invoices.count})
              </span>
            </span>
          </div>
          <div className="flex justify-between space-x-6">
            <span style={{ color: COLORS.qp }}>{t('quote_pipeline')}</span>
            <span className="font-mono">
              {fmt(bucket?.inflows.quote_pipeline.amount || 0)}
              <span className="text-gray-400 ml-1">
                ({bucket?.inflows.quote_pipeline.count})
              </span>
            </span>
          </div>

          <div className="border-t my-1" style={{ borderColor: colors.$21 }} />

          <div className="flex justify-between space-x-6">
            <span style={{ color: COLORS.re }}>{t('recurring_expenses')}</span>
            <span className="font-mono">
              {fmt(bucket?.outflows.recurring_expenses.amount || 0)}
            </span>
          </div>
          <div className="flex justify-between space-x-6">
            <span style={{ color: COLORS.oe }}>{t('expenses')}</span>
            <span className="font-mono">
              {fmt(bucket?.outflows.one_off_expenses.amount || 0)}
            </span>
          </div>

          <div className="border-t my-1" style={{ borderColor: colors.$21 }} />

          <div className="flex justify-between space-x-6 font-medium">
            <span>{t('net')} ({t('weighted')})</span>
            <span className="font-mono">{fmt(bucket?.weighted_net || 0)}</span>
          </div>
          <div className="flex justify-between space-x-6">
            <span className="text-gray-400">{t('confidence')}</span>
            <span className="font-mono">
              {((bucket?.confidence || 0) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card
      title={t('cash_flow_by_period')}
      className="shadow-sm mt-8"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      childrenClassName="px-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 17, left: 5 }}>
          <CartesianGrid strokeDasharray="0" vertical={false} />

          <XAxis
            dataKey="period"
            tickMargin={8}
            tick={{ fontSize: 14 }}
            stroke={colors.$3}
          />
          <YAxis
            tickFormatter={(value) =>
              fmt(value).replace(/ /g, '\u00A0')
            }
            tick={{ fontSize: 14 }}
            stroke={colors.$3}
          />

          <Tooltip
            content={<CustomTooltip />}
            wrapperStyle={{ outline: 'none' }}
          />

          <Bar
            dataKey="outstanding_invoices"
            stackId="inflows"
            name={t('outstanding_invoices') || ''}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS.oi}
                fillOpacity={entry.confidence}
              />
            ))}
          </Bar>
          <Bar
            dataKey="recurring_invoices"
            stackId="inflows"
            name={t('recurring_invoices') || ''}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS.ri}
                fillOpacity={entry.confidence}
              />
            ))}
          </Bar>
          <Bar
            dataKey="quote_pipeline"
            stackId="inflows"
            name={t('quote_pipeline') || ''}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS.qp}
                fillOpacity={entry.confidence}
              />
            ))}
          </Bar>

          <Bar
            dataKey="recurring_expenses"
            stackId="outflows"
            name={t('recurring_expenses') || ''}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS.re}
                fillOpacity={entry.confidence}
              />
            ))}
          </Bar>
          <Bar
            dataKey="one_off_expenses"
            stackId="outflows"
            name={t('expenses') || ''}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={index}
                fill={COLORS.oe}
                fillOpacity={entry.confidence}
              />
            ))}
          </Bar>

          <Line
            type="monotone"
            dataKey="weighted_net"
            name={t('net_cash_flow') || ''}
            stroke={COLORS.net}
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Card>
  );
}
