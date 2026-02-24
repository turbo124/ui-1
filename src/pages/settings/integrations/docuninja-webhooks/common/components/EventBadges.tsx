/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Badge } from '$app/components/Badge';

interface Props {
  events: string[];
  maxVisible?: number;
}

function formatEventName(event: string): string {
  return event
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function EventBadges(props: Props) {
  const { events, maxVisible = 3 } = props;

  if (events.includes('*')) {
    return <Badge variant="primary">All Events</Badge>;
  }

  const visible = events.slice(0, maxVisible);
  const remaining = events.length - maxVisible;

  return (
    <div className="flex flex-wrap gap-1">
      {visible.map((event) => (
        <Badge key={event} variant="light-blue">
          {formatEventName(event)}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="generic">+{remaining} more</Badge>
      )}
    </div>
  );
}
