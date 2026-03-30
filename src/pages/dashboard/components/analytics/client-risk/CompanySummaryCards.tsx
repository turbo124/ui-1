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
  CompanySummary,
  ClientPaymentThresholds,
  TrafficLight,
} from './interfaces';

interface Props {
  data: CompanySummary | undefined;
  thresholds: ClientPaymentThresholds | undefined;
}

const TRAFFIC_COLORS: Record<TrafficLight, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

const TRAFFIC_BG: Record<TrafficLight, string> = {
  green: '#22c55e26',
  yellow: '#eab30826',
  red: '#ef444426',
};

function evaluateThreshold(
  value: number,
  green: number,
  yellow: number,
  lowerIsBetter: boolean
): TrafficLight {
  if (lowerIsBetter) {
    if (value < green) return 'green';
    if (value <= yellow) return 'yellow';
    return 'red';
  }
  // higher is better (inverted)
  if (value > green) return 'green';
  if (value >= yellow) return 'yellow';
  return 'red';
}

export function CompanySummaryCards(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { data, thresholds } = props;

  if (!data) return null;

  const cards = [
    {
      label: t('avg_payment_days'),
      value: `${Math.round(data.avg_payment_days)}`,
      suffix: t('days'),
      traffic: evaluateThreshold(
        data.avg_payment_days,
        thresholds?.avg_days?.green ?? 15,
        thresholds?.avg_days?.yellow ?? 30,
        true
      ),
    },
    {
      label: t('predictability'),
      value: `\u00B1${data.stddev_payment_days.toFixed(1)}`,
      suffix: t('days'),
      traffic: evaluateThreshold(
        data.stddev_payment_days,
        thresholds?.stddev?.green ?? 5,
        thresholds?.stddev?.yellow ?? 15,
        true
      ),
    },
    {
      label: t('late_payment_rate'),
      value: `${(data.late_payment_ratio * 100).toFixed(0)}%`,
      suffix: '',
      traffic: evaluateThreshold(
        data.late_payment_ratio,
        thresholds?.late_rate?.green ?? 0.1,
        thresholds?.late_rate?.yellow ?? 0.25,
        true
      ),
    },
    {
      label: t('confidence'),
      value: `${data.total_invoices}`,
      suffix: t('invoices'),
      traffic: evaluateThreshold(
        data.total_invoices,
        thresholds?.data_points?.green ?? 30,
        thresholds?.data_points?.yellow ?? 10,
        false
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
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
              {card.suffix && (
                <span className="text-xs text-gray-400">{card.suffix}</span>
              )}
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
                {card.traffic}
              </span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
