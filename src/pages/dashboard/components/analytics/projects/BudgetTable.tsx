/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { Table, Thead, Tbody, Tr, Th, Td } from '$app/components/tables';
import { date as formatDate } from '$app/common/helpers';
import { useCurrentCompanyDateFormats } from '$app/common/hooks/useCurrentCompanyDateFormats';
import { Link } from 'react-router-dom';
import { BudgetSummaryEntry } from './interfaces';
import { cloneDeep } from 'lodash';

interface Props {
  data: BudgetSummaryEntry[];
}

function utilizationColor(util: number): string {
  if (util > 1.0) return '#ef4444';
  if (util >= 0.75) return '#eab308';
  return '#22c55e';
}

type SortField =
  | 'project_name'
  | 'budgeted_hours'
  | 'current_hours'
  | 'utilization'
  | 'total_tasks'
  | 'due_date';

export function BudgetTable(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const { dateFormat } = useCurrentCompanyDateFormats();

  const [sortField, setSortField] = useState<SortField>('utilization');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'utilization' ? 'desc' : 'asc');
    }
  };

  const sorted = (() => {
    const copy = cloneDeep(props.data || []);
    return copy.sort((a, b) => {
      if (sortField === 'project_name') {
        return sortDir === 'asc'
          ? a.project_name.localeCompare(b.project_name)
          : b.project_name.localeCompare(a.project_name);
      }
      if (sortField === 'due_date') {
        const da = a.due_date || '';
        const db = b.due_date || '';
        return sortDir === 'asc' ? da.localeCompare(db) : db.localeCompare(da);
      }
      const va = a[sortField] as number;
      const vb = b[sortField] as number;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  })();

  const isUsed = (field: SortField) => field === sortField;

  return (
    <Card
      title={t('budget_details')}
      className="shadow-sm mt-8"
      headerClassName="px-3 sm:px-4 py-3 sm:py-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
      withoutBodyPadding
    >
      <Table>
        <Thead>
          <Th
            onColumnClick={() => handleSort('project_name')}
            isCurrentlyUsed={isUsed('project_name')}
          >
            {t('project')}
          </Th>
          <Th
            onColumnClick={() => handleSort('budgeted_hours')}
            isCurrentlyUsed={isUsed('budgeted_hours')}
          >
            {t('budget')}
          </Th>
          <Th
            onColumnClick={() => handleSort('current_hours')}
            isCurrentlyUsed={isUsed('current_hours')}
          >
            {t('used')}
          </Th>
          <Th
            onColumnClick={() => handleSort('utilization')}
            isCurrentlyUsed={isUsed('utilization')}
          >
            {t('utilization')}
          </Th>
          <Th
            onColumnClick={() => handleSort('total_tasks')}
            isCurrentlyUsed={isUsed('total_tasks')}
          >
            {t('tasks')}
          </Th>
          <Th>{t('invoiced')}</Th>
          <Th
            onColumnClick={() => handleSort('due_date')}
            isCurrentlyUsed={isUsed('due_date')}
          >
            {t('due_date')}
          </Th>
        </Thead>

        <Tbody>
          {sorted.map((project) => {
            const utilPercent = (project.utilization * 100).toFixed(0);

            return (
              <Tr key={project.project_id}>
                <Td>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          project.current_hours > 0
                            ? colors.$3
                            : 'transparent',
                        border:
                          project.current_hours > 0
                            ? 'none'
                            : `1.5px solid ${colors.$3}`,
                      }}
                    />
                    <Link
                      to={`/projects/${project.project_id}`}
                      className="hover:underline"
                      style={{ color: colors.$3 }}
                    >
                      {project.project_name}
                    </Link>
                  </div>
                </Td>
                <Td>
                  <span className="font-mono">
                    {project.budgeted_hours > 0
                      ? `${project.budgeted_hours} ${t('hours')}`
                      : '—'}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">
                    {project.current_hours} {t('hours')}
                  </span>
                </Td>
                <Td>
                  <span
                    className="font-mono font-medium"
                    style={{
                      color:
                        project.budgeted_hours > 0
                          ? utilizationColor(project.utilization)
                          : colors.$3,
                    }}
                  >
                    {project.budgeted_hours > 0 ? `${utilPercent}%` : '—'}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">
                    {project.total_tasks}
                    {project.running_tasks > 0 && (
                      <span style={{ color: '#3b82f6' }}>
                        {' '}
                        ({project.running_tasks}&#9654;)
                      </span>
                    )}
                  </span>
                </Td>
                <Td>
                  <span className="font-mono">
                    {project.invoiced_tasks}/{project.total_tasks}
                  </span>
                </Td>
                <Td>
                  {project.due_date ? (
                    <span className="font-mono">
                      {formatDate(project.due_date, dateFormat)}
                    </span>
                  ) : (
                    '—'
                  )}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Card>
  );
}
