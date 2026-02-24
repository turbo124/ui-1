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
import { Modal } from '$app/components/Modal';
import { CopyToClipboard } from '$app/components/CopyToClipboard';
import { Button } from '$app/components/forms';
import { Badge } from '$app/components/Badge';

interface Props {
  visible: boolean;
  secret: string;
  url: string;
  onClose: () => void;
}

export function SecretRevealModal(props: Props) {
  const { visible, secret, url, onClose } = props;
  const colors = useColorScheme();

  return (
    <Modal
      visible={visible}
      onClose={() => onClose()}
      title="Webhook Endpoint Created"
      size="regular"
      disableClosing
    >
      <div className="flex flex-col space-y-4">
        <div
          className="p-3 rounded-md border"
          style={{
            backgroundColor: `rgba(234, 179, 8, 0.1)`,
            borderColor: 'rgb(234, 179, 8)',
          }}
        >
          <p className="text-sm font-medium" style={{ color: 'rgb(161, 98, 7)' }}>
            Copy your signing secret now — it will not be shown again.
          </p>
        </div>

        <div>
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: colors.$17 }}
          >
            Endpoint URL
          </span>
          <p className="text-sm mt-1 break-all" style={{ color: colors.$3 }}>
            {url}
          </p>
        </div>

        <div>
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: colors.$17 }}
          >
            Signing Secret
          </span>
          <div
            className="mt-1 p-3 rounded-md border font-mono text-sm break-all"
            style={{
              backgroundColor: colors.$4,
              borderColor: colors.$5,
              color: colors.$3,
            }}
          >
            <CopyToClipboard text={secret} />
          </div>
        </div>

        <div>
          <span
            className="text-xs font-medium uppercase tracking-wider"
            style={{ color: colors.$17 }}
          >
            Signature Verification
          </span>
          <p className="text-sm mt-1" style={{ color: colors.$17 }}>
            Verify deliveries using the{' '}
            <Badge variant="generic">X-DocuNinja-Signature</Badge> header.
            Compute:{' '}
            <code className="text-xs">
              HMAC-SHA256(&quot;{'timestamp'}.{'body'}&quot;, secret)
            </code>
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={() => onClose()}>Done</Button>
        </div>
      </div>
    </Modal>
  );
}
