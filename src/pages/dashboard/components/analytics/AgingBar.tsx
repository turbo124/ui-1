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
import { AgingTotals } from './interfaces';

interface Props {
  data: AgingTotals | undefined;
  currency: string;
}

const AGING_BUCKETS = [
  { key: 'current_amount', label: 'current', color: '#22C55E' },
  { key: 'age_0_30', label: '0-30', color: '#84CC16' },
  { key: 'age_31_60', label: '31-60', color: '#F59E0B' },
  { key: 'age_61_90', label: '61-90', color: '#F97316' },
  { key: 'age_91_120', label: '91-120', color: '#EF4444' },
  { key: 'age_120_plus', label: '120+', color: '#DC2626' },
] as const;

export function AgingBar(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const colors = useColorScheme();

  const { data, currency } = props;

  const total = data
    ? AGING_BUCKETS.reduce(
        (sum, bucket) => sum + (data[bucket.key] || 0),
        0
      )
    : 0;

  return (
    <Card
      title={t('aging')}
      className="shadow-sm mt-8"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <div className="px-4 pb-4">
        {total > 0 && (
          <div
            className="flex h-6 rounded-md overflow-hidden mb-4"
            style={{ backgroundColor: colors.$4 }}
          >
            {AGING_BUCKETS.map((bucket) => {
              const value = data?.[bucket.key] || 0;
              const percent = (value / total) * 100;
              if (percent === 0) return null;
              return (
                <div
                  key={bucket.key}
                  style={{
                    width: `${percent}%`,
                    backgroundColor: bucket.color,
                  }}
                  title={`${bucket.label}: ${formatMoney(
                    value,
                    company?.settings.country_id,
                    currency,
                    2
                  )} (${percent.toFixed(0)}%)`}
                />
              );
            })}
          </div>
        )}

        <div className="space-y-3">
          {AGING_BUCKETS.map((bucket) => {
            const value = data?.[bucket.key] || 0;
            const percent = total > 0 ? ((value / total) * 100).toFixed(0) : '0';

            return (
              <div
                key={bucket.key}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: bucket.color }}
                  />
                  <span className="text-sm" style={{ color: colors.$3 }}>
                    {bucket.label === 'current' ? t('current') : bucket.label}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-sm font-mono" style={{ color: colors.$3 }}>
                    {formatMoney(
                      value,
                      company?.settings.country_id,
                      currency,
                      2
                    )}
                  </span>
                  <span className="text-sm text-gray-400 w-10 text-right">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}

          <div
            className="flex items-center justify-between pt-3 border-t"
            style={{ borderColor: colors.$21 }}
          >
            <span className="text-sm font-medium" style={{ color: colors.$3 }}>
              {t('total')} {t('outstanding')}
            </span>
            <span className="text-sm font-mono font-semibold" style={{ color: colors.$3 }}>
              {formatMoney(
                total,
                company?.settings.country_id,
                currency,
                2
              )}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
