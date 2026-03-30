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
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  TooltipProps,
} from 'recharts';
import { BudgetSummaryEntry } from './interfaces';

interface Props {
  data: BudgetSummaryEntry[];
}

function utilizationColor(util: number): string {
  if (util > 1.0) return '#ef4444';
  if (util >= 0.75) return '#eab308';
  return '#22c55e';
}

export function BudgetUtilizationChart(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const withBudget = props.data.filter((p) => p.budgeted_hours > 0);

  const chartData = withBudget.map((p) => ({
    name: p.project_name,
    utilization: Math.round(p.utilization * 100),
    current_hours: p.current_hours,
    budgeted_hours: p.budgeted_hours,
  }));

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0].payload;
    return (
      <div
        className="p-3 shadow-lg rounded-md border"
        style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
      >
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-sm font-mono">
          {item.current_hours}/{item.budgeted_hours} {t('hours')} (
          {item.utilization}%)
        </p>
      </div>
    );
  };

  return (
    <Card
      title={t('budget_utilization')}
      className="shadow-sm mt-8"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <div className="px-4 pb-4">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-400 py-4">{t('no_records_found')}</p>
        ) : (
          <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 48)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="0" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, (max: number) => Math.max(max, 100)]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 13 }}
                stroke={colors.$3}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 13 }}
                stroke={colors.$3}
              />
              <Tooltip
                content={<CustomTooltip />}
                wrapperStyle={{ outline: 'none' }}
              />
              <Bar dataKey="utilization" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={utilizationColor(entry.utilization / 100)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
