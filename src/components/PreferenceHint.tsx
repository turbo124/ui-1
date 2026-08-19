/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2026. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Props {
  label: string;
  onClick: () => void;
  pulsing?: boolean;
  cypressRef?: string;
}

export function PreferenceHint(props: Props) {
  const { label, onClick, pulsing = false, cypressRef } = props;

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      data-cy={cypressRef}
      className="relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <span className="relative flex h-2.5 w-2.5">
        {pulsing && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 motion-safe:animate-ping" />
        )}

        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
      </span>
    </button>
  );
}
