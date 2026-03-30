/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from '$app/common/colors';
import { Card } from '$app/components/cards';
import { Table, Thead, Tbody, Tr, Th, Td } from '$app/components/tables';
import { Badge } from '$app/components/Badge';
import { Link } from 'react-router-dom';
import { useClientResolver } from '$app/common/hooks/clients/useClientResolver';
import { Client } from '$app/common/interfaces/client';
import { ClientRiskEntry, TrafficLight } from './interfaces';
import { cloneDeep } from 'lodash';

interface Props {
  clients: ClientRiskEntry[];
}

const TINT_COLORS: Record<TrafficLight, string> = {
  green: '#f0fdf4',
  yellow: '#fefce8',
  red: '#fef2f2',
};

const RISK_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  low: { bg: '#22c55e26', text: '#22c55e' },
  medium: { bg: '#eab30826', text: '#eab308' },
  high: { bg: '#ef444426', text: '#ef4444' },
};

const INDICATOR_DOT_COLORS: Record<TrafficLight, string> = {
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
};

type SortField =
  | 'client_name'
  | 'avg_payment_days'
  | 'stddev_payment_days'
  | 'late_payment_ratio'
  | 'total_invoices'
  | 'risk_score';

export function ClientRiskTable(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();
  const clientResolver = useClientResolver();

  const [clientNames, setClientNames] = useState<Record<number, string>>({});
  const [sortField, setSortField] = useState<SortField>('risk_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    (props.clients || []).forEach((entry) => {
      if (!clientNames[entry.client_id]) {
        clientResolver
          .find(entry.client_id.toString())
          .then((client: Client) => {
            setClientNames((prev) => ({
              ...prev,
              [entry.client_id]: client.display_name || client.name || `#${entry.client_id}`,
            }));
          });
      }
    });
  }, [props.clients]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'risk_score' ? 'desc' : 'asc');
    }
  };

  const sortedClients = (() => {
    const copy = cloneDeep(props.clients || []);
    return copy.sort((a, b) => {
      let valA: number | string;
      let valB: number | string;

      if (sortField === 'client_name') {
        valA = clientNames[a.client_id] || '';
        valB = clientNames[b.client_id] || '';
        return sortDir === 'asc'
          ? (valA as string).localeCompare(valB as string)
          : (valB as string).localeCompare(valA as string);
      }

      valA = a[sortField] as number;
      valB = b[sortField] as number;
      return sortDir === 'asc' ? valA - valB : valB - valA;
    });
  })();

  const isUsed = (field: SortField) => field === sortField;

  return (
    <Card
      title={t('client_risk_scorecards')}
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
            onColumnClick={() => handleSort('client_name')}
            isCurrentlyUsed={isUsed('client_name')}
          >
            {t('client')}
          </Th>
          <Th
            onColumnClick={() => handleSort('avg_payment_days')}
            isCurrentlyUsed={isUsed('avg_payment_days')}
          >
            {t('avg_days')}
          </Th>
          <Th
            onColumnClick={() => handleSort('stddev_payment_days')}
            isCurrentlyUsed={isUsed('stddev_payment_days')}
          >
            {t('std_dev')}
          </Th>
          <Th
            onColumnClick={() => handleSort('late_payment_ratio')}
            isCurrentlyUsed={isUsed('late_payment_ratio')}
          >
            {t('late_payment_rate')}
          </Th>
          <Th
            onColumnClick={() => handleSort('total_invoices')}
            isCurrentlyUsed={isUsed('total_invoices')}
          >
            {t('confidence')}
          </Th>
          <Th
            onColumnClick={() => handleSort('risk_score')}
            isCurrentlyUsed={isUsed('risk_score')}
          >
            {t('score')}
          </Th>
          <Th>{t('risk')}</Th>
        </Thead>

        <Tbody>
          {sortedClients.map((client) => {
            const riskStyle = RISK_BADGE_COLORS[client.risk_level];

            return (
              <Tr key={client.client_id}>
                <Td>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor:
                          INDICATOR_DOT_COLORS[
                            client.risk_level === 'low'
                              ? 'green'
                              : client.risk_level === 'medium'
                                ? 'yellow'
                                : 'red'
                          ],
                      }}
                    />
                    <Link
                      to={`/clients/${client.client_id}`}
                      className="hover:underline"
                      style={{ color: colors.$3 }}
                    >
                      {clientNames[client.client_id] || `#${client.client_id}`}
                    </Link>
                  </div>
                </Td>
                <Td
                  style={{ backgroundColor: TINT_COLORS[client.indicators.avg_days] }}
                >
                  <span className="font-mono">
                    {Math.round(client.avg_payment_days)}d
                  </span>
                </Td>
                <Td
                  style={{ backgroundColor: TINT_COLORS[client.indicators.stddev] }}
                >
                  <span className="font-mono">
                    &plusmn;{client.stddev_payment_days.toFixed(1)}
                  </span>
                </Td>
                <Td
                  style={{ backgroundColor: TINT_COLORS[client.indicators.late_rate] }}
                >
                  <span className="font-mono">
                    {(client.late_payment_ratio * 100).toFixed(0)}%
                  </span>
                </Td>
                <Td
                  style={{ backgroundColor: TINT_COLORS[client.indicators.data_points] }}
                >
                  <span className="font-mono">
                    {client.total_invoices} inv
                  </span>
                </Td>
                <Td>
                  <span className="font-mono font-medium">
                    {Math.round(client.risk_score)}
                  </span>
                </Td>
                <Td>
                  <Badge
                    style={{
                      backgroundColor: riskStyle.bg,
                      color: riskStyle.text,
                    }}
                  >
                    <span className="text-xs font-semibold uppercase">
                      {client.risk_level}
                    </span>
                  </Badge>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Card>
  );
}
