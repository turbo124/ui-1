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
import { useFormatMoney } from '$app/common/hooks/money/useFormatMoney';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { Card } from '$app/components/cards';
import { Table, Thead, Tbody, Tr, Th, Td } from '$app/components/tables';
import { Link } from 'react-router-dom';
import { ProfitabilityEntry } from './interfaces';
import { cloneDeep } from 'lodash';

interface Props {
  data: ProfitabilityEntry[];
}

function marginColor(ratio: number): string {
  if (ratio >= 0.5) return '#22c55e';
  if (ratio >= 0.25) return '#eab308';
  return '#ef4444';
}

type SortField =
  | 'project_name'
  | 'invoiced_amount'
  | 'expense_amount'
  | 'net_margin'
  | 'margin_ratio';

export function ProfitabilityTable(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const formatMoney = useFormatMoney();
  const company = useCurrentCompany();
  const companyCurrency = company?.settings?.currency_id || '1';

  const [sortField, setSortField] = useState<SortField>('net_margin');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'net_margin' || field === 'margin_ratio' ? 'desc' : 'asc');
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
      const va = a[sortField] as number;
      const vb = b[sortField] as number;
      return sortDir === 'asc' ? va - vb : vb - va;
    });
  })();

  const isUsed = (field: SortField) => field === sortField;

  return (
    <Card
      title={t('profitability')}
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
            onColumnClick={() => handleSort('invoiced_amount')}
            isCurrentlyUsed={isUsed('invoiced_amount')}
          >
            {t('invoiced')}
          </Th>
          <Th
            onColumnClick={() => handleSort('expense_amount')}
            isCurrentlyUsed={isUsed('expense_amount')}
          >
            {t('expenses')}
          </Th>
          <Th
            onColumnClick={() => handleSort('net_margin')}
            isCurrentlyUsed={isUsed('net_margin')}
          >
            {t('net_margin')}
          </Th>
          <Th
            onColumnClick={() => handleSort('margin_ratio')}
            isCurrentlyUsed={isUsed('margin_ratio')}
          >
            {t('margin')}
          </Th>
        </Thead>

        <Tbody>
          {sorted.map((project) => (
            <Tr key={project.project_id}>
              <Td>
                <Link
                  to={`/projects/${project.project_id}`}
                  className="hover:underline"
                  style={{ color: colors.$3 }}
                >
                  {project.project_name}
                </Link>
              </Td>
              <Td>
                <span className="font-mono">
                  {formatMoney(
                    project.invoiced_amount,
                    company?.settings.country_id,
                    companyCurrency,
                    2
                  )}
                </span>
              </Td>
              <Td>
                <span className="font-mono">
                  {formatMoney(
                    project.expense_amount,
                    company?.settings.country_id,
                    companyCurrency,
                    2
                  )}
                </span>
              </Td>
              <Td>
                <span
                  className="font-mono font-medium"
                  style={{
                    color: project.net_margin < 0 ? '#ef4444' : colors.$3,
                  }}
                >
                  {formatMoney(
                    project.net_margin,
                    company?.settings.country_id,
                    companyCurrency,
                    2
                  )}
                </span>
              </Td>
              <Td>
                <span
                  className="font-mono font-medium"
                  style={{ color: marginColor(project.margin_ratio) }}
                >
                  {(project.margin_ratio * 100).toFixed(1)}%
                </span>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Card>
  );
}
