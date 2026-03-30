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
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Card } from '$app/components/cards';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  TooltipProps,
} from 'recharts';
import { ProfitabilityEntry } from './interfaces';

interface Props {
  data: ProfitabilityEntry[];
}

export function ProfitabilityChart(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const companyCurrency = company?.settings?.currency_id || '1';

  const chartData = props.data.map((p) => ({
    name: p.project_name,
    invoiced: p.invoiced_amount,
    expenses: p.expense_amount,
    margin: p.net_margin,
    margin_ratio: p.margin_ratio,
  }));

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (!active || !payload || !payload.length) return null;

    const item = payload[0]?.payload;
    return (
      <div
        className="p-3 shadow-lg rounded-md border"
        style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
      >
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-sm">
          {t('invoiced')}:{' '}
          <span className="font-mono">
            {formatMoney(item.invoiced, company?.settings.country_id, companyCurrency, 2)}
          </span>
        </p>
        <p className="text-sm">
          {t('expenses')}:{' '}
          <span className="font-mono">
            {formatMoney(item.expenses, company?.settings.country_id, companyCurrency, 2)}
          </span>
        </p>
        <p className="text-sm">
          {t('margin')}:{' '}
          <span className="font-mono">
            {formatMoney(item.margin, company?.settings.country_id, companyCurrency, 2)} (
            {(item.margin_ratio * 100).toFixed(1)}%)
          </span>
        </p>
      </div>
    );
  };

  return (
    <Card
      title={t('profitability')}
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
              <Legend />
              <Bar
                dataKey="invoiced"
                name={t('invoiced') as string}
                fill="#22c55e"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="expenses"
                name={t('expenses') as string}
                fill="#f97316"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
