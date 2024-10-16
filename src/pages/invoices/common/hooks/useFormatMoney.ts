/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Number as NumberHelper } from '$app/common/helpers/number';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useResolveCountry } from '$app/common/hooks/useResolveCountry';
import { useResolveCurrency } from '$app/common/hooks/useResolveCurrency';
import { useVendorResolver } from '$app/common/hooks/vendors/useVendorResolver';
import { Client } from '$app/common/interfaces/client';
import { Country } from '$app/common/interfaces/country';
import { Currency } from '$app/common/interfaces/currency';
import { Vendor } from '$app/common/interfaces/vendor';
import { useEffect, useState } from 'react';
import {
  ProductTableResource,
  RelationType,
} from '../components/ProductsTable';

interface Props {
  resource: ProductTableResource | undefined;
  relationType: RelationType;
}

export function useFormatMoney(props: Props) {
  const company = useCurrentCompany();

  const currencyResolver = useResolveCurrency();
  const countryResolver = useResolveCountry();
  const vendorResolver = useVendorResolver();
  const clientResolver = useClientResolver();

  const [clientId, setClientId] = useState<string>('');
  const [vendorId, setVendorId] = useState<string>('');

  const { resource, relationType } = props;

  const [country, setCountry] = useState<Country>();
  const [currency, setCurrency] = useState<Currency>();

  const [relation, setRelation] = useState<Client | Vendor>();

  useEffect(() => {
    if (clientId && relationType === 'client_id') {
      clientResolver.find(clientId).then((client) => setRelation(client));
    }

    if (vendorId && relationType === 'vendor_id') {
      vendorResolver.find(vendorId).then((vendor) => setRelation(vendor));
    }
  }, [clientId, vendorId]);

  useEffect(() => {
    resource?.vendor_id && setVendorId(resource.vendor_id);

    resource?.client_id && setClientId(resource.client_id);
  }, [resource?.client_id, resource?.vendor_id]);

  useEffect(() => {
    if (relation && relationType === 'client_id') {
      const client = relation as Client;

      setCurrency(
        currencyResolver(
          client.settings.currency_id || company?.settings.currency_id
        )
      );

      setCountry(
        countryResolver(client.country_id || company?.settings.country_id)
      );
    }

    if (relation && relationType === 'vendor_id') {
      const vendor = relation as Vendor;

      setCurrency(
        currencyResolver(vendor.currency_id || company?.settings.currency_id)
      );

      setCountry(
        countryResolver(vendor.country_id || company?.settings.country_id)
      );
    }
  }, [relation]);

  return (value: number | string) => {
    if (currency && country) {
      return NumberHelper.formatMoney(
        isNaN(Number(value)) ? 0 : value,
        currency,
        country
      );
    }

    return value;
  };
}
