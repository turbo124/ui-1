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
import { $refetch } from '$app/common/hooks/useRefetch';
import { useProjectQuery } from '$app/common/queries/projects';
import { DocumentsTable } from '$app/components/DocumentsTable';
import { Upload } from '$app/pages/settings/company/documents/components';
import { useParams } from 'react-router-dom';

export default function Documents() {
  const { id } = useParams();

  const { data: project } = useProjectQuery({ id });

  const onSuccess = () => {
    $refetch(['projects']);
  };

  return (
    <>
      <Upload
        endpoint={endpoint('/api/v1/projects/:id/upload', { id })}
        onSuccess={onSuccess}
      />

      <DocumentsTable
        documents={project?.documents || []}
        onDocumentDelete={onSuccess}
      />
    </>
  );
}
