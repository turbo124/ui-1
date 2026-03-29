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
import { PaymentAnalyticsTotals } from './interfaces';

interface Props {
  data: PaymentAnalyticsTotals | undefined;
}

type TrafficLight = 'green' | 'yellow' | 'red';

function getAvgDaysColor(days: number): TrafficLight {
  if (days < 15) return 'green';
  if (days <= 30) return 'yellow';
  return 'red';
}

function getStddevColor(stddev: number): TrafficLight {
  if (stddev < 5) return 'green';
  if (stddev <= 15) return 'yellow';
  return 'red';
}

function getLateRateColor(rate: number): TrafficLight {
  if (rate < 0.1) return 'green';
  if (rate <= 0.25) return 'yellow';
  return 'red';
}

function getConfidenceColor(count: number): TrafficLight {
  if (count > 30) return 'green';
  if (count >= 10) return 'yellow';
  return 'red';
}

const TRAFFIC_COLORS: Record<TrafficLight, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

const TRAFFIC_BG: Record<TrafficLight, string> = {
  green: '#22C55E26',
  yellow: '#F59E0B26',
  red: '#EF444426',
};

const TRAFFIC_LABELS: Record<TrafficLight, string> = {
  green: 'good',
  yellow: 'warning',
  red: 'critical',
};

export function PaymentAnalyticsCards(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { data } = props;

  if (!data) return null;

  const cards = [
    {
      label: t('avg_payment_days'),
      value: `${Math.round(data.avg_payment_days)}`,
      suffix: t('days'),
      traffic: getAvgDaysColor(data.avg_payment_days),
    },
    {
      label: t('predictability'),
      value: `\u00B1${data.stddev_payment_days.toFixed(1)}`,
      suffix: t('days'),
      traffic: getStddevColor(data.stddev_payment_days),
    },
    {
      label: t('late_payment_rate'),
      value: `${(data.late_payment_ratio * 100).toFixed(0)}%`,
      suffix: `${data.late_invoices} / ${data.total_invoices}`,
      traffic: getLateRateColor(data.late_payment_ratio),
    },
    {
      label: t('confidence'),
      value: `${data.total_invoices}`,
      suffix: t('invoices'),
      traffic: getConfidenceColor(data.total_invoices),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
      {cards.map((card, index) => (
        <Card
          key={index}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          withoutBodyPadding
        >
          <div className="flex flex-col p-4">
            <span className="text-sm text-gray-500">{card.label}</span>

            <div className="flex items-baseline space-x-2 mt-2">
              <span
                className="text-2xl font-mono font-semibold"
                style={{ color: colors.$3 }}
              >
                {card.value}
              </span>
              <span className="text-xs text-gray-400">{card.suffix}</span>
            </div>

            <div className="flex items-center space-x-1.5 mt-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: TRAFFIC_COLORS[card.traffic] }}
              />
              <span
                className="text-xs font-medium"
                style={{
                  color: TRAFFIC_COLORS[card.traffic],
                  backgroundColor: TRAFFIC_BG[card.traffic],
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}
              >
                {t(TRAFFIC_LABELS[card.traffic])}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
