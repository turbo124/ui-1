/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { date as formatDate } from '$app/common/helpers';
import dayjs from 'dayjs';
import {
  Line,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  AreaChart,
  TooltipProps,
} from 'recharts';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useColorScheme } from '$app/common/colors';
import { TimeSeriesPoint } from './interfaces';
import { Card } from '$app/components/cards';

interface ChartDataPoint {
  date: string;
  value: number;
}

type YAxisFormat = 'money' | 'days' | 'percent';

type ChartSensitivity = 'day' | 'week' | 'month';

interface Props {
  title: string;
  data: TimeSeriesPoint[];
  currency: string;
  chartType?: 'line' | 'area';
  yAxisFormat: YAxisFormat;
  color: string;
  chartSensitivity?: ChartSensitivity;
}

export function AnalyticsChart(props: Props) {
  const [t] = useTranslation();
  const { chartType = 'line', yAxisFormat, color, chartSensitivity = 'month' } = props;

  const company = useCurrentCompany();
  const { dateFormat } = useCurrentCompanyDateFormats();
  const formatMoney = useFormatMoney();
  const colors = useColorScheme();

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!props.data) return [];

    const raw = props.data.map((point) => ({
      date: point.date,
      value: parseFloat(point.total) || 0,
    }));

    if (chartSensitivity === 'day') {
      return raw.map((p) => ({
        date: formatDate(p.date, dateFormat),
        value: p.value,
      }));
    }

    const buckets = new Map<string, { sum: number; count: number }>();

    raw.forEach((point) => {
      const d = dayjs(point.date);
      const key =
        chartSensitivity === 'week'
          ? d.startOf('week').format('YYYY-MM-DD')
          : d.format('YYYY-MM');

      const existing = buckets.get(key);
      if (existing) {
        existing.sum += point.value;
        existing.count += 1;
      } else {
        buckets.set(key, { sum: point.value, count: 1 });
      }
    });

    const isAverage = yAxisFormat === 'days' || yAxisFormat === 'percent';

    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, { sum, count }]) => ({
        date: formatDate(key, dateFormat),
        value: isAverage ? sum / count : sum,
      }));
  }, [props.data, dateFormat, chartSensitivity]);

  const formatValue = (value: number): string => {
    switch (yAxisFormat) {
      case 'money':
        return formatMoney(
          value,
          company?.settings.country_id,
          props.currency,
          2
        ).toString();
      case 'days':
        return `${Math.round(value)}d`;
      case 'percent':
        return `${(value * 100).toFixed(0)}%`;
      default:
        return value.toString();
    }
  };

  const yAxisWidth = useMemo(() => {
    const largestTick = chartData.reduce((max, point) => {
      const tickLength = formatValue(point.value * 10).length;
      return Math.max(max, tickLength);
    }, 0);

    return largestTick ? largestTick * 8.5 : undefined;
  }, [chartData]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        className="p-4 shadow-lg rounded-md border"
        style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
      >
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between space-x-10 py-1"
          >
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: item.color }}
              />
              <span style={{ color: colors.$3 }}>{item.name}</span>
            </div>
            <span className="font-medium font-mono">
              {formatValue(item.value || 0)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const sharedProps = {
    data: chartData,
    margin: { top: 17, left: 10 },
  };

  const sharedAxisProps = {
    xAxis: (
      <XAxis
        dataKey="date"
        tickMargin={8}
        tick={{ fontSize: 14 }}
        stroke={colors.$3}
      />
    ),
    yAxis: (
      <YAxis
        interval={0}
        tickCount={6}
        tickFormatter={(value) =>
          formatValue(value).replace(/ /g, '\u00A0')
        }
        tick={{ fontSize: 14 }}
        width={yAxisWidth}
        stroke={colors.$3}
      />
    ),
  };

  return (
    <Card
      title={props.title}
      className="shadow-sm"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      childrenClassName="px-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <ResponsiveContainer width="100%" height={250}>
        {chartType === 'area' ? (
          <AreaChart height={200} {...sharedProps}>
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              name={props.title}
              dataKey="value"
              stroke={color}
              fill={`url(#gradient-${color})`}
              strokeWidth={2}
            />
            <CartesianGrid strokeDasharray="0" vertical={false} />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />
            {sharedAxisProps.xAxis}
            {sharedAxisProps.yAxis}
          </AreaChart>
        ) : (
          <LineChart height={200} {...sharedProps}>
            <Line
              type="monotone"
              name={props.title}
              dataKey="value"
              stroke={color}
              dot={false}
              strokeWidth={2}
            />
            <CartesianGrid strokeDasharray="0" vertical={false} />
            <Tooltip
              content={<CustomTooltip />}
              wrapperStyle={{ outline: 'none' }}
            />
            {sharedAxisProps.xAxis}
            {sharedAxisProps.yAxis}
          </LineChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}
