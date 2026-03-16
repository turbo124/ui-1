import { Button } from '$app/components/forms';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { WorkflowIcon } from '../components/shared/WorkflowIcon';
import { WorkflowTemplate } from '../types/workflow';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Spinner } from '$app/components/Spinner';

function useWorkflowTemplates() {
  return useQuery<WorkflowTemplate[]>(
    ['/api/v1/workflows/templates'],
    () =>
      request('GET', endpoint('/api/v1/workflows/templates'))
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;
          if (Array.isArray(data)) {
            return data as WorkflowTemplate[];
          }
          return [];
        })
        .catch(() => []),
    { staleTime: 5 * 60 * 1000 }
  );
}

export function WorkflowTemplates() {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { data: templates, isLoading } = useWorkflowTemplates();

  const categories = Array.from(
    new Set((templates ?? []).map((tpl) => tpl.category))
  );

  return (
    <Default
      title={t('workflow_templates')}
      breadcrumbs={[
        { name: t('workflows'), href: '/workflows' },
        { name: t('templates'), href: '/workflows/templates' },
      ]}
    >
      {isLoading ? (
        <Spinner />
      ) : (templates ?? []).length === 0 ? (
        <div
          className="rounded-lg border border-dashed p-8 text-center text-sm"
          style={{ color: colors.$3, borderColor: colors.$4 }}
        >
          {t('no_records_found')}
        </div>
      ) : (
        categories.map((category) => (
          <div key={category} className="mb-6">
            <h2
              className="mb-3 text-lg font-semibold"
              style={{ color: colors.$3 }}
            >
              {category}
            </h2>
            <div className="grid gap-4 xl:grid-cols-2">
              {(templates ?? [])
                .filter((tpl) => tpl.category === category)
                .map((template) => (
                  <div
                    key={template.id}
                    className="rounded-lg border p-5"
                    style={{
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-800 text-white">
                          <WorkflowIcon name={template.icon} size={24} />
                        </div>
                        <div>
                          <div
                            className="text-lg font-semibold"
                            style={{ color: colors.$3 }}
                          >
                            {template.name}
                          </div>
                          <div
                            className="text-sm"
                            style={{ color: colors.$3, opacity: 0.6 }}
                          >
                            {template.summary}
                          </div>
                        </div>
                      </div>
                      <span
                        className="rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          backgroundColor: colors.$2,
                          color: colors.$3,
                        }}
                      >
                        {template.category}
                      </span>
                    </div>

                    <div
                      className="space-y-1 text-sm"
                      style={{ color: colors.$3 }}
                    >
                      <div>
                        {t('trigger')}: {template.trigger_description}
                      </div>
                      <div>
                        {t('steps')}: {template.step_count}
                      </div>
                    </div>

                    <div className="mt-5">
                      <Button
                        to={`/workflows/create?template=${template.id}`}
                      >
                        {t('use_this_template')}
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))
      )}
    </Default>
  );
}

export default WorkflowTemplates;
