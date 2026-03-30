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
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { Spinner } from '$app/components/Spinner';
import { ProjectKPICards } from './ProjectKPICards';
import { BudgetUtilizationChart } from './BudgetUtilizationChart';
import { BudgetTable } from './BudgetTable';
import { ProfitabilityChart } from './ProfitabilityChart';
import { ProfitabilityTable } from './ProfitabilityTable';
import { ProjectAnalyticsResponse } from './interfaces';

interface Props {
  body: { start_date: string; end_date: string; date_range: string };
}

export function ProjectAnalytics(props: Props) {
  const query = useQuery({
    queryKey: ['/api/v1/charts/project_analytics', props.body],
    queryFn: () =>
      request(
        'POST',
        endpoint('/api/v1/charts/project_analytics'),
        props.body
      ).then((response) => response.data as ProjectAnalyticsResponse),
    staleTime: Infinity,
  });

  const budgetSummary = query.data?.budget_summary || [];
  const profitability = query.data?.profitability || [];

  return (
    <div>
      {query.isLoading && (
        <div className="w-full flex justify-center mt-4">
          <Spinner />
        </div>
      )}

      <ProjectKPICards data={budgetSummary} />

      <BudgetUtilizationChart data={budgetSummary} />

      <BudgetTable data={budgetSummary} />

      <ProfitabilityChart data={profitability} />

      <ProfitabilityTable data={profitability} />
    </div>
  );
}
