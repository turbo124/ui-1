/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useDisableSettingsField } from '$app/common/hooks/useDisableSettingsField';
import { NumberInputField } from '$app/components/forms/NumberInputField';
import { PropertyCheckbox } from '$app/components/PropertyCheckbox';
import { SettingsLabel } from '$app/components/SettingsLabel';
import { Element } from '../../../../components/cards';
import { InputField } from '../../../../components/forms';
import { companySettingsErrorsAtom } from '../../common/atoms';
import { useHandleCurrentCompanyChangeProperty } from '../../common/hooks/useHandleCurrentCompanyChange';
import { GeneratedNumberVariables } from '../common/components/GeneratedNumberVariables';

export function Projects() {
  const [t] = useTranslation();

  const companyChanges = useCompanyChanges();

  const disableSettingsField = useDisableSettingsField();

  const errors = useAtomValue(companySettingsErrorsAtom);

  const handleChange = useHandleCurrentCompanyChangeProperty();

  return (
    <>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="project_number_pattern"
            labelElement={<SettingsLabel label={t('number_pattern')} />}
          />
        }
      >
        <InputField
          value={companyChanges?.settings?.project_number_pattern || ''}
          onValueChange={(value) =>
            handleChange('settings.project_number_pattern', value)
          }
          disabled={disableSettingsField('project_number_pattern')}
          errorMessage={errors?.errors['settings.project_number_pattern']}
        />
      </Element>
      <Element
        leftSide={
          <PropertyCheckbox
            propertyKey="project_number_counter"
            labelElement={<SettingsLabel label={t('number_counter')} />}
          />
        }
      >
        <NumberInputField
          precision={0}
          value={companyChanges?.settings?.project_number_counter || ''}
          onValueChange={(value) =>
            handleChange(
              'settings.project_number_counter',
              parseFloat(value) || 0
            )
          }
          disabled={disableSettingsField('project_number_counter')}
          errorMessage={errors?.errors['settings.project_number_counter']}
        />
      </Element>

      <GeneratedNumberVariables entity="project" />
    </>
  );
}
