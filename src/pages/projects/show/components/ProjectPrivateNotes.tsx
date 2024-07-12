/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { sanitizeHTML } from '$app/common/helpers/html-string';
import { Project } from '$app/common/interfaces/project';
import { InfoCard } from '$app/components/InfoCard';
import { useTranslation } from 'react-i18next';

interface Props {
  project: Project;
}

export function ProjectPrivateNotes(props: Props) {
  const [t] = useTranslation();

  const { project } = props;

  return (
    <>
      {Boolean(project && project.private_notes) && (
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <InfoCard
            title={t('private_notes')}
            value={
              <div className="whitespace-normal max-h-56 overflow-y-auto">
                <article
                  className="prose prose-sm"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHTML(project.private_notes),
                  }}
                />
              </div>
            }
            className="h-full"
          />
        </div>
      )}
    </>
  );
}