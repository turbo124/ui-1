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
import { Badge } from '$app/components/Badge';
import { ForecastTotals } from './interfaces';

interface Props {
  data: ForecastTotals | undefined;
}

export function ForecastKPICards(props: Props) {
  const [t] = useTranslation();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const colors = useColorScheme();
  const { data } = props;

  const companyCurrency = company?.settings?.currency_id || '1';

  const kpis = [
    {
      label: t('expected_inflows'),
      value: formatMoney(
        data?.total_inflows || 0,
        company?.settings.country_id,
        companyCurrency,
        2
      ),
      subtitle: t('optimistic'),
      color: '#3b82f6',
      bgColor: '#3b82f626',
    },
    {
      label: t('realistic_inflows'),
      value: formatMoney(
        data?.weighted_inflows || 0,
        company?.settings.country_id,
        companyCurrency,
        2
      ),
      subtitle: t('weighted'),
      color: '#22c55e',
      bgColor: '#22c55e26',
    },
    {
      label: t('expected_outflows'),
      value: formatMoney(
        data?.total_outflows || 0,
        company?.settings.country_id,
        companyCurrency,
        2
      ),
      subtitle: '',
      color: '#f97316',
      bgColor: '#f9731626',
    },
    {
      label: t('net_cash_flow'),
      value: formatMoney(
        data?.weighted_net || 0,
        company?.settings.country_id,
        companyCurrency,
        2
      ),
      subtitle: t('weighted'),
      color: '#1e293b',
      bgColor: '#1e293b1a',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          withoutBodyPadding
        >
          <div className="flex flex-col p-4">
            <span className="text-sm text-gray-500">{kpi.label}</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <Badge style={{ backgroundColor: kpi.bgColor }}>
                <span
                  className="text-lg font-mono font-semibold"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </span>
              </Badge>
            </div>
            {kpi.subtitle && (
              <span className="text-xs text-gray-400 mt-1">
                {kpi.subtitle}
              </span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
