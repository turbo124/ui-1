/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useResolveCountry } from './useResolveCountry';

export function useCalculateTaxesRegion() {
  /**
   * Supported tax regions
   */
  const supportedCountries: string[] = [
    'AT',
    'BE',
    'BG',
    'CY',
    'CZ',
    'DE',
    'DK',
    'EE',
    'ES',
    'FI',
    'FR',
    'GR',
    'HR',
    'HU',
    'IE',
    'IT',
    'LT',
    'LU',
    'LV',
    'MT',
    'NL',
    'PL',
    'PT',
    'RO',
    'SE',
    'SI',
    'SK',//EU

    'US',//US

    'AU',//AU
  ];

  const resolveCountry = useResolveCountry();

  return (countryId: string | number) =>
    supportedCountries.includes(resolveCountry(countryId)?.iso_3166_2 || '');
}
