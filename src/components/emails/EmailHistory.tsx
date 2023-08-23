/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { endpoint } from "$app/common/helpers";
import { request } from '$app/common/helpers/request';
import { GenericManyResponse } from '$app/common/interfaces/generic-many-response';
import { EmailHistory } from "$app/common/interfaces/email-history";
import invoice from "$tests/helpers/data/invoice";
import { AxiosResponse } from 'axios';
import { useQuery } from 'react-query';

interface Props {
    history?: EmailHistory[];
}

export function EmailHistory(props: Props) {
    
    return (
        <>
            {props.history && (
                
                <div>
                    {props.history
                        .map((record, index) => (
                            <p key={index}>
                                {record.subject}
                                    <span className="font-semibold"> {record.subject}</span>
                                    <span className="font-semibold"> {record.recipients}</span>
                            </p>
                            
                            {record?.events && record.events.map((event, index) => (
                            <div>
                                <p key={index}>
                                    {event.date}
                                    <span className="font-semibold"> {event.recipient}</span>
                                    <span className="font-semibold"> {event.delivery_message}</span>
                                    <span className="font-semibold"> {event.server} {event.server_ip}</span>
                                    <span className="font-semibold"> {event.status}</span>
                                </p>
                            </div>
                            ))}
                </div>
                
            )}
            
        </>
    );
}
