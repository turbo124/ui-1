/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { date, endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { route } from '$app/common/helpers/route';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { useTitle } from '$app/common/hooks/useTitle';
import { GenericSingleResourceResponse } from '$app/common/interfaces/generic-api-response';
import { Project } from '$app/common/interfaces/project';
import { Page } from '$app/components/Breadcrumbs';
import { InfoCard } from '$app/components/InfoCard';
import { Spinner } from '$app/components/Spinner';
import { Button, Link } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { calculateTime } from '$app/pages/tasks/common/helpers/calculate-time';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import { useParams } from 'react-router-dom';
import duration from 'dayjs/plugin/duration';
import dayjs from 'dayjs';
import { Dropdown } from '$app/components/dropdown/Dropdown';
import { Inline } from '$app/components/Inline';
import { ResourceActions } from '$app/components/ResourceActions';
import { useActions } from '../common/hooks';

dayjs.extend(duration);

export default function Show() {
  const { documentTitle } = useTitle('project');
  const { t } = useTranslation();
  const { id } = useParams();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const pages: Page[] = [
    { name: t('projects'), href: '/projects' },
    { name: t('project'), href: route('/projects/:id', { id }) },
  ];

  const { data: project } = useQuery({
    queryKey: ['/api/v1/projects', `/api/v1/projects/${id}`],
    queryFn: () =>
      request(
        'GET',
        endpoint(`/api/v1/projects/${id}?include=client,tasks`)
      ).then(
        (response: GenericSingleResourceResponse<Project>) => response.data.data
      ),
    staleTime: Infinity,
  });

  const actions = useActions();

  if (!project) {
    return (
      <Default title={documentTitle} breadcrumbs={pages}>
        <Spinner />
      </Default>
    );
  }

  const duration = () => {
    let duration = 0;

    project.tasks?.map((task) => {
      duration += parseInt(calculateTime(task.time_log, { inSeconds: true }));
    });

    return dayjs.duration(duration, 'seconds').format('HH:mm:ss');
  };

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      navigationTopRight={
        <Inline>
          <Button to={`/projects/${id}/edit`}>{t('edit_project')}</Button>

          <ResourceActions
            resource={project}
            label={t('more_actions')}
            actions={actions}
          />
        </Inline>
      }
    >
      <div className="grid grid-cols-3 gap-4">
        <InfoCard title={t('details')}>
          <Link
            className="block"
            to={route('/clients/:id', { id: project.client_id })}
          >
            {project.client?.display_name}
          </Link>

          {project.due_date.length > 0 && (
            <p>
              {t('due_date')}: {date(project.due_date, dateFormat)}
            </p>
          )}

          <p>
            {t('budgeted_hours')}: {project.budgeted_hours}
          </p>

          <p>
            {t('task_rate')}: {project.task_rate}
          </p>
        </InfoCard>

        <InfoCard title={t('notes')}>
          <p>{project.public_notes}</p>
        </InfoCard>

        <InfoCard title={t('summary')}>
          <p>
            {t('tasks')}: {project.tasks?.length}
          </p>

          <p>
            {t('duration')}: {duration()}
          </p>
        </InfoCard>
      </div>
    </Default>
  );
}
