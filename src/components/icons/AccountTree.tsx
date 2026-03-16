/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Props {
  size?: string;
  color?: string;
  strokeWidth?: string;
}

export function AccountTree(props: Props) {
  const { size = '1rem', color = '#000', strokeWidth = '1.5' } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
      viewBox="0 0 12 12"
      fill="none"
    >
      <rect
        x="4.25"
        y="0.75"
        width="3.5"
        height="2"
        rx="0.5"
        ry="0.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <rect
        x="0.75"
        y="9.25"
        width="3.5"
        height="2"
        rx="0.5"
        ry="0.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <rect
        x="7.75"
        y="9.25"
        width="3.5"
        height="2"
        rx="0.5"
        ry="0.5"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
      <path
        d="M6 2.75v3.5M6 6.25H2.5v3M6 6.25h3.5v3"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}
