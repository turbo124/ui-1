/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { EmailHistory } from "$app/common/interfaces/email-history";

interface Props {
    history?: EmailHistory[];
}

export function EmailHistory(props: Props) {
    if (!props.history) {
        return null;
    }

    return (
        <>
            {props.history.map((record, index) => (
                <div key={index}>
                    <p>
                        {record.subject}
                        <span className="font-semibold"> {record.subject}</span>
                        <span className="font-semibold"> {record.recipients}</span>
                    </p>

                    {record?.events &&
                        record.events.map((event, index) => (
                            <p key={index}>
                                {event.date}
                                <span className="font-semibold"> {event.recipient}</span>
                                <span className="font-semibold"> {event.delivery_message}</span>
                                <span className="font-semibold">
                                    {event.server} {event.server_ip}
                                </span>
                                <span className="font-semibold"> {event.status}</span>
                            </p>
                        ))}
                </div>
            ))}
        </>
    );
}
