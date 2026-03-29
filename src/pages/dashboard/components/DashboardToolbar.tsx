/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { SelectField } from '$app/components/forms';
import { DropdownDateRangePicker } from '../../../components/DropdownDateRangePicker';
import { useTranslation } from 'react-i18next';
import {
  ChartsDefaultView,
  useReactSettings,
} from '$app/common/hooks/useReactSettings';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { useColorScheme } from '$app/common/colors';
import { CurrencySelector } from '$app/components/CurrencySelector';
import Toggle from '$app/components/forms/Toggle';
import styled from 'styled-components';

const ChartScaleBox = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  &:hover {
    background-color: ${(props) => props.theme.hoverBgColor};
  }
`;

interface Currency {
  value: string;
  label: string;
}

interface Props {
  currencies: Currency[];
  dates: { start_date: string; end_date: string };
  dateRange: string;
  onDateChange: (dateSet: string) => void;
}

export function DashboardToolbar(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const settings = useReactSettings();
  const { Preferences, update } = usePreferences();

  const chartScale =
    settings?.preferences?.dashboard_charts?.default_view || 'month';
  const currency = settings?.preferences?.dashboard_charts?.currency || 1;
  const includeDrafts =
    settings?.preferences?.dashboard_charts?.include_drafts || false;

  return (
    <div className="flex items-center justify-end lg:justify-between">
      <span className="hidden lg:inline-block text-sm text-gray-500">
        {t('account_login_text')}
      </span>

      <div className="flex">
        <div className="flex space-x-2">
          {props.currencies && (
            <SelectField
              className="rounded-md shadow-sm"
              value={currency.toString()}
              onValueChange={(value) =>
                update(
                  'preferences.dashboard_charts.currency',
                  parseInt(value)
                )
              }
              customSelector
              dismissable={false}
            >
              <option value="999">{t('all')}</option>

              {props.currencies.map((currency, index) => (
                <option key={index} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </SelectField>
          )}

          <div
            className="flex rounded-lg overflow-hidden border shadow-sm"
            style={{ borderColor: colors.$24 }}
          >
            <ChartScaleBox
              className="flex items-center px-4 cursor-pointer text-sm"
              onClick={() =>
                update('preferences.dashboard_charts.default_view', 'day')
              }
              theme={{
                backgroundColor: chartScale === 'day' ? colors.$3 : colors.$1,
                hoverBgColor: chartScale === 'day' ? colors.$3 : colors.$4,
              }}
              style={{
                borderColor: colors.$24,
                color: chartScale === 'day' ? colors.$1 : colors.$3,
              }}
            >
              {t('day')}
            </ChartScaleBox>

            <ChartScaleBox
              className="flex items-center px-4 cursor-pointer border-l text-sm"
              onClick={() =>
                update('preferences.dashboard_charts.default_view', 'week')
              }
              theme={{
                backgroundColor:
                  chartScale === 'week' ? colors.$3 : colors.$1,
                hoverBgColor: chartScale === 'week' ? colors.$3 : colors.$4,
              }}
              style={{
                borderColor: colors.$24,
                color: chartScale === 'week' ? colors.$1 : colors.$3,
              }}
            >
              {t('week')}
            </ChartScaleBox>

            <ChartScaleBox
              className="flex items-center px-4 cursor-pointer border-l text-sm"
              onClick={() =>
                update('preferences.dashboard_charts.default_view', 'month')
              }
              theme={{
                backgroundColor:
                  chartScale === 'month' ? colors.$3 : colors.$1,
                hoverBgColor: chartScale === 'month' ? colors.$3 : colors.$4,
              }}
              style={{
                borderColor: colors.$24,
                color: chartScale === 'month' ? colors.$1 : colors.$3,
              }}
            >
              {t('month')}
            </ChartScaleBox>
          </div>

          <div className="flex flex-auto justify-center sm:col-start-3 ">
            <DropdownDateRangePicker
              handleDateChange={props.onDateChange}
              startDate={props.dates.start_date}
              endDate={props.dates.end_date}
              handleDateRangeChange={(value) =>
                update('preferences.dashboard_charts.range', value)
              }
              value={props.dateRange}
            />
          </div>

          <Preferences>
            <CurrencySelector
              label={t('currency')}
              value={currency.toString()}
              onChange={(v) =>
                update('preferences.dashboard_charts.currency', parseInt(v))
              }
              additionalCurrencies={[{ id: '999', label: t('all') }]}
            />

            <SelectField
              label={t('range')}
              value={chartScale}
              onValueChange={(value) =>
                update(
                  'preferences.dashboard_charts.default_view',
                  value as ChartsDefaultView
                )
              }
            >
              <option value="day">{t('day')}</option>
              <option value="week">{t('week')}</option>
              <option value="month">{t('month')}</option>
            </SelectField>

            <SelectField
              label={t('date_range')}
              value={props.dateRange}
              onValueChange={(value) =>
                update('preferences.dashboard_charts.range', value)
              }
            >
              <option value="last7_days">{t('last_7_days')}</option>
              <option value="last30_days">{t('last_30_days')}</option>
              <option value="this_month">{t('this_month')}</option>
              <option value="last_month">{t('last_month')}</option>
              <option value="this_quarter">{t('current_quarter')}</option>
              <option value="last_quarter">{t('last_quarter')}</option>
              <option value="this_year">{t('this_year')}</option>
              <option value="last_year">{t('last_year')}</option>
              <option value={'last365_days'}>{`${t('last365_days')}`}</option>
            </SelectField>

            <Toggle
              label={t('include_drafts')}
              checked={includeDrafts}
              onValueChange={(value) =>
                update('preferences.dashboard_charts.include_drafts', value)
              }
            />
          </Preferences>
        </div>
      </div>
    </div>
  );
}
