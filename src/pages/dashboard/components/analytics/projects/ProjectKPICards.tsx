/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { Badge } from '$app/components/Badge';
import { BudgetSummaryEntry } from './interfaces';

interface Props {
  data: BudgetSummaryEntry[];
}

export function ProjectKPICards(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { data } = props;

  const stats = useMemo(() => {
    const activeProjects = data.length;

    const withBudget = data.filter((p) => p.budgeted_hours > 0);
    const avgUtilization =
      withBudget.length > 0
        ? withBudget.reduce((sum, p) => sum + p.utilization, 0) /
          withBudget.length
        : 0;

    const overBudget = data.filter((p) => p.utilization > 1.0).length;

    const runningTimers = data.reduce((sum, p) => sum + p.running_tasks, 0);

    return { activeProjects, avgUtilization, overBudget, runningTimers };
  }, [data]);

  const kpis = [
    {
      label: t('active_projects'),
      value: `${stats.activeProjects}`,
      color: '#3b82f6',
      bgColor: '#3b82f626',
    },
    {
      label: t('avg_utilization'),
      value: `${(stats.avgUtilization * 100).toFixed(0)}%`,
      color: '#22c55e',
      bgColor: '#22c55e26',
    },
    {
      label: t('over_budget'),
      value: `${stats.overBudget}`,
      color: '#ef4444',
      bgColor: '#ef444426',
    },
    {
      label: t('running_timers'),
      value: `${stats.runningTimers}`,
      color: '#3b82f6',
      bgColor: '#3b82f626',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className="shadow-sm"
          style={{ borderColor: colors.$24 }}
          withoutBodyPadding
        >
          <div className="flex flex-col p-4">
            <span className="text-sm text-gray-500">{kpi.label}</span>
            <div className="flex items-baseline space-x-1 mt-1">
              <Badge style={{ backgroundColor: kpi.bgColor }}>
                <span
                  className="text-lg font-mono font-semibold"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </span>
              </Badge>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
