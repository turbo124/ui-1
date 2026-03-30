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
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { ClientRiskEntry } from './interfaces';

interface Props {
  clients: ClientRiskEntry[];
}

const RISK_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#eab308',
  high: '#ef4444',
};

export function RiskDistributionBar(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const distribution = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 };
    (props.clients || []).forEach((c) => {
      counts[c.risk_level]++;
    });
    const total = props.clients?.length || 0;
    return [
      { level: 'low', label: t('low'), count: counts.low, percent: total > 0 ? (counts.low / total) * 100 : 0 },
      { level: 'medium', label: t('medium'), count: counts.medium, percent: total > 0 ? (counts.medium / total) * 100 : 0 },
      { level: 'high', label: t('high'), count: counts.high, percent: total > 0 ? (counts.high / total) * 100 : 0 },
    ];
  }, [props.clients]);

  const total = props.clients?.length || 0;

  return (
    <Card
      title={t('risk_distribution')}
      className="shadow-sm"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <div className="px-4 pb-4 space-y-3">
        {distribution.map((item) => (
          <div key={item.level} className="flex items-center space-x-3">
            <span
              className="text-sm font-medium w-16 uppercase"
              style={{ color: RISK_COLORS[item.level] }}
            >
              {item.label}
            </span>

            <div
              className="flex-1 h-5 rounded overflow-hidden"
              style={{ backgroundColor: colors.$4 }}
            >
              {item.percent > 0 && (
                <div
                  className="h-full rounded"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: RISK_COLORS[item.level],
                  }}
                />
              )}
            </div>

            <span className="text-sm text-gray-500 w-24 text-right">
              {item.count} {t('clients')} ({item.percent.toFixed(0)}%)
            </span>
          </div>
        ))}

        <div
          className="text-sm text-gray-400 pt-2 border-t"
          style={{ borderColor: colors.$21 }}
        >
          {total} {t('clients')} {t('total')}
        </div>
      </div>
    </Card>
  );
}
