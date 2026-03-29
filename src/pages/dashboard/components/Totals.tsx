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
import { Chart } from '$app/pages/dashboard/components/Chart';
import { useEffect, useState } from 'react';
import { Spinner } from '$app/components/Spinner';
import { Card } from '$app/components/cards';
import { useTranslation } from 'react-i18next';
import { request } from '$app/common/helpers/request';
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Badge } from '$app/components/Badge';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { usePreferences } from '$app/common/hooks/usePreferences';
import collect from 'collect.js';
import { useColorScheme } from '$app/common/colors';
import { useQuery } from 'react-query';

interface TotalsRecord {
  revenue: { paid_to_date: string; code: string };
  expenses: { amount: string; code: string };
  invoices: { invoiced_amount: string; code: string; date: string };
  outstanding: { outstanding_count: number; amount: string; code: string };
}

interface Currency {
  value: string;
  label: string;
}

export interface ChartData {
  invoices: {
    total: string;
    date: string;
    currency: string;
  }[];
  payments: {
    total: string;
    date: string;
    currency: string;
  }[];
  outstanding: {
    total: string;
    date: string;
    currency: string;
  }[];
  expenses: {
    total: string;
    date: string;
    currency: string;
  }[];
}

export enum TotalColors {
  Green = '#54B434',
  Blue = '#2596BE',
  Red = '#BE4D25',
  Gray = '#242930',
}

interface Props {
  body: { start_date: string; end_date: string; date_range: string };
  onCurrenciesChange: (currencies: Currency[]) => void;
}

export function Totals(props: Props) {
  const [t] = useTranslation();

  const settings = useReactSettings();
  const { update } = usePreferences();

  const formatMoney = useFormatMoney();

  const colors = useColorScheme();
  const company = useCurrentCompany();

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [totalsData, setTotalsData] = useState<TotalsRecord[]>([]);

  const [dates, setDates] = useState<{ start_date: string; end_date: string }>({
    start_date: props.body.start_date,
    end_date: props.body.end_date,
  });

  const chartScale =
    settings?.preferences?.dashboard_charts?.default_view || 'month';
  const currency = settings?.preferences?.dashboard_charts?.currency || 1;
  const includeDrafts =
    settings?.preferences?.dashboard_charts?.include_drafts || false;

  const totals = useQuery({
    queryKey: ['/api/v1/charts/totals_v2', props.body, includeDrafts],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/totals_v2?include_drafts=:includeDrafts', {
          includeDrafts,
        }),
        props.body
      ).then((response) => response.data),
    staleTime: Infinity,
  });

  const chart = useQuery({
    queryKey: ['/api/v1/charts/chart_summary_v2', props.body, includeDrafts],
    queryFn: () =>
      request(
        'POST',
        endpoint(
          '/api/v1/charts/chart_summary_v2?include_drafts=:includeDrafts',
          {
            includeDrafts,
          }
        ),
        props.body
      ).then((response) => response.data),
    staleTime: Infinity,
  });

  useEffect(() => {
    if (totals.data) {
      setTotalsData(totals.data);

      const currencies: Currency[] = [];

      Object.entries(totals.data.currencies).map(([id, name]) => {
        currencies.push({ value: id, label: name as unknown as string });
      });

      const $currencies = collect(currencies)
        .pluck('value')
        .map((value) => parseInt(value as string))
        .toArray() as number[];

      if (!$currencies.includes(currency) && currency !== 999) {
        update('preferences.dashboard_charts.currency', $currencies[0]);
      }

      props.onCurrenciesChange(currencies);
    }
  }, [totals.data]);

  useEffect(() => {
    if (chart.data) {
      setDates({
        start_date: chart.data.start_date,
        end_date: chart.data.end_date,
      });

      setChartData(chart.data);
    }
  }, [chart.data]);

  return (
    <>
      {totals.isLoading && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

      <div className="grid grid-cols-10 mt-4 gap-8">
        {company && (
          <Card
            title={t('recent_transactions')}
            className="col-span-10 xl:col-span-3 shadow-sm"
            headerClassName="px-3 sm:px-4 py-3 sm:py-4"
            withoutBodyPadding
            style={{ borderColor: colors.$24 }}
            headerStyle={{ borderColor: colors.$20 }}
            withoutHeaderPadding
          >
            <div className="flex flex-col px-4">
              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$21 }}
              >
                <span className="text-gray-500">{t('invoices')}</span>

                <Badge style={{ backgroundColor: '#2176FF26' }}>
                  <span
                    className="text-base font-mono"
                    style={{ color: '#2176FF' }}
                  >
                    {formatMoney(
                      totalsData[currency]?.invoices?.invoiced_amount || 0,
                      company.settings.country_id,
                      currency.toString(),
                      2
                    )}
                  </span>
                </Badge>
              </div>

              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$21 }}
              >
                <span className="text-gray-500">{t('payments')}</span>

                <Badge style={{ backgroundColor: '#22C55E26' }}>
                  <span
                    className="text-base font-mono"
                    style={{ color: '#22C55E' }}
                  >
                    {formatMoney(
                      totalsData[currency]?.revenue?.paid_to_date || 0,
                      company.settings.country_id,
                      currency.toString(),
                      2
                    )}
                  </span>
                </Badge>
              </div>

              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$21 }}
              >
                <span className="text-gray-500">{t('expenses')}</span>

                <Badge style={{ backgroundColor: '#A1A1AA26' }}>
                  <span
                    className="text-base font-mono"
                    style={{ color: '#A1A1AA' }}
                  >
                    {formatMoney(
                      totalsData[currency]?.expenses?.amount || 0,
                      company.settings.country_id,
                      currency.toString(),
                      2
                    )}
                  </span>
                </Badge>
              </div>

              <div
                className="flex justify-between items-center border-b border-dashed py-5"
                style={{ borderColor: colors.$21 }}
              >
                <span className="text-gray-500">{t('outstanding')}</span>

                <Badge style={{ backgroundColor: '#EF444426' }}>
                  <span
                    className="text-base font-mono"
                    style={{ color: '#EF4444' }}
                  >
                    {formatMoney(
                      totalsData[currency]?.outstanding?.amount || 0,
                      company.settings.country_id,
                      currency.toString(),
                      2
                    )}
                  </span>
                </Badge>
              </div>

              <div className="flex justify-between items-center py-5">
                <span className="text-gray-500">
                  {t('total_invoices_outstanding')}
                </span>

                <Badge
                  variant="transparent"
                  className="border"
                  style={{ borderColor: colors.$21 }}
                >
                  <span className="mx-2 text-base font-mono">
                    {totalsData[currency]?.outstanding?.outstanding_count || 0}
                  </span>
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {chartData && (
          <Card
            title={t('overview')}
            className="col-span-10 xl:col-span-7 shadow-sm"
            headerClassName="px-3 sm:px-4 py-3 sm:py-4"
            childrenClassName="px-4"
            style={{ borderColor: colors.$24 }}
            headerStyle={{ borderColor: colors.$20 }}
            withoutHeaderPadding
          >
            <Chart
              chartSensitivity={chartScale}
              dates={{ start_date: dates.start_date, end_date: dates.end_date }}
              data={chartData[currency]}
              currency={currency.toString()}
            />
          </Card>
        )}
      </div>
    </>
  );
}
