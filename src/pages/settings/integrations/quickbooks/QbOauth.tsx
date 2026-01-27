/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { Button } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { useTranslation } from 'react-i18next';
import { MdLink } from 'react-icons/md';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useColorScheme } from '$app/common/colors';

export function QbOauth() {
    const [t] = useTranslation();
    const company = useCurrentCompany();
    const colors = useColorScheme();

    const isConnected = 
        company?.quickbooks?.refresh_token && 
        company?.quickbooks?.realmID;

    const handleAuthorize = () => {
        request('POST', endpoint('/api/v1/one_time_token'), {
            context: 'quickbooks',
            platform: 'react',
        }).then((tokenResponse) => {
            const hash = tokenResponse?.data?.hash;
            const authorizeUrl = `https://qb.romulus.com.au/quickbooks/authorize/${hash}`;
            
            window.open(authorizeUrl, '_blank');
        });
    };

    if (isConnected && company.quickbooks) {
        return (
            <span className="text-sm" style={{ color: colors.$3 }}>
                {t('realm_id')}: {company.quickbooks.realmID}
            </span>
        );
    }

    return (
        <Button type="secondary" behavior="button" onClick={handleAuthorize}>
            <span className="mr-2">
                <Icon element={MdLink} size={20} />
            </span>
            {t('authorize')}
        </Button>
    );
}
