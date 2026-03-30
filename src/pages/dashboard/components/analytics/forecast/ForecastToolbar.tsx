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
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import styled from 'styled-components';

const ToggleBox = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  &:hover {
    background-color: ${(props) => props.theme.hoverBgColor};
  }
`;

interface Props {
  bucketType: string;
  rangeMonths: string;
  onBucketTypeChange: (value: string) => void;
  onRangeChange: (value: string) => void;
}

export function ForecastToolbar(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  return (
    <div className="flex items-center space-x-3 mt-4">
      <div
        className="flex rounded-lg overflow-hidden border shadow-sm"
        style={{ borderColor: colors.$24 }}
      >
        <ToggleBox
          className="flex items-center px-4 py-2 cursor-pointer text-sm"
          onClick={() => props.onBucketTypeChange('monthly')}
          theme={{
            backgroundColor:
              props.bucketType === 'monthly' ? colors.$3 : colors.$1,
            hoverBgColor:
              props.bucketType === 'monthly' ? colors.$3 : colors.$4,
          }}
          style={{
            borderColor: colors.$24,
            color: props.bucketType === 'monthly' ? colors.$1 : colors.$3,
          }}
        >
          {t('monthly')}
        </ToggleBox>

        <ToggleBox
          className="flex items-center px-4 py-2 cursor-pointer border-l text-sm"
          onClick={() => props.onBucketTypeChange('weekly')}
          theme={{
            backgroundColor:
              props.bucketType === 'weekly' ? colors.$3 : colors.$1,
            hoverBgColor:
              props.bucketType === 'weekly' ? colors.$3 : colors.$4,
          }}
          style={{
            borderColor: colors.$24,
            color: props.bucketType === 'weekly' ? colors.$1 : colors.$3,
          }}
        >
          {t('weekly')}
        </ToggleBox>
      </div>

      <SelectField
        className="rounded-md shadow-sm"
        value={props.rangeMonths}
        onValueChange={props.onRangeChange}
        customSelector
        dismissable={false}
      >
        <option value="3">3 {t('months')}</option>
        <option value="6">6 {t('months')}</option>
        <option value="12">12 {t('months')}</option>
      </SelectField>
    </div>
  );
}
