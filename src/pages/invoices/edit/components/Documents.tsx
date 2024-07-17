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
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { $refetch } from '$app/common/hooks/useRefetch';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useOutletContext, useParams } from 'react-router-dom';
import { Context } from '../Edit';

export default function Documents() {
  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const context: Context = useOutletContext();

  const { invoice } = context;

  return (
    <div className="w-2/3">
      <Upload
        widgetOnly
        endpoint={endpoint('/api/v1/invoices/:id/upload', {
          id,
        })}
        onSuccess={() => $refetch(['invoices'])}
        disableUpload={
          !hasPermission('edit_invoice') && !entityAssigned(invoice)
        }
      />

      <DocumentsTable
        documents={invoice?.documents || []}
        onDocumentDelete={() => $refetch(['invoices'])}
        disableEditableOptions={!entityAssigned(invoice, true)}
      />
    </div>
  );
}
