/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import { useDocuNinjaWebhookEventsQuery } from '$app/common/queries/docuninja/webhooks';
import { Checkbox } from '$app/components/forms/Checkbox';
import Toggle from '$app/components/forms/Toggle';
import { Spinner } from '$app/components/Spinner';

interface Props {
  selectedEvents: string[];
  onChange: (events: string[]) => void;
}

const EVENT_GROUPS: Record<string, string[]> = {
  'Signing Flow': [
    'document.sent',
    'document.viewed',
    'document.signed',
    'document.completed',
  ],
  'Approval Flow': [
    'document.approval_requested',
    'document.approved',
    'document.rejected',
  ],
  Lifecycle: ['document.voided', 'document.expired'],
};

function formatEventName(event: string): string {
  return event
    .split('.')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function EventSelector(props: Props) {
  const { selectedEvents, onChange } = props;
  const colors = useColorScheme();

  const { data: availableEvents, isLoading } =
    useDocuNinjaWebhookEventsQuery();

  const isWildcard = selectedEvents.includes('*');

  const handleToggleAll = (value: boolean) => {
    if (value) {
      onChange(['*']);
    } else {
      onChange([]);
    }
  };

  const handleToggleEvent = (event: string, checked: boolean) => {
    if (checked) {
      const newEvents = [...selectedEvents.filter((e) => e !== '*'), event];
      onChange(newEvents);
    } else {
      onChange(selectedEvents.filter((e) => e !== event));
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col space-y-4">
      <Toggle
        checked={isWildcard}
        label="All Events"
        onValueChange={handleToggleAll}
      />

      {!isWildcard && (
        <div className="flex flex-col space-y-4">
          {Object.entries(EVENT_GROUPS).map(([groupName, groupEvents]) => {
            const eventsInGroup = groupEvents.filter((e) =>
              availableEvents?.includes(e)
            );

            if (eventsInGroup.length === 0) return null;

            return (
              <div key={groupName}>
                <span
                  className="text-xs font-semibold uppercase tracking-wider"
                  style={{ color: colors.$17 }}
                >
                  {groupName}
                </span>

                <div className="mt-2 flex flex-col space-y-2">
                  {eventsInGroup.map((event) => (
                    <Checkbox
                      key={event}
                      label={formatEventName(event)}
                      checked={selectedEvents.includes(event)}
                      onValueChange={(_value, checked) =>
                        handleToggleEvent(event, Boolean(checked))
                      }
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
