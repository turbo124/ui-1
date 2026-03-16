import { useMemo } from 'react';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import {
  ConditionFieldDef,
  WorkflowActionMetadata,
  WorkflowDateField,
  WorkflowOperation,
  WorkflowTriggerMetadata,
} from '../types/workflow';
import {
  defaultActionMetadata,
  defaultTriggerMetadata,
} from '../helpers/workflowTemplates';

function isValidTriggerMetadata(
  item: unknown
): item is WorkflowTriggerMetadata {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as WorkflowTriggerMetadata).id === 'string' &&
    typeof (item as WorkflowTriggerMetadata).entity === 'string' &&
    typeof (item as WorkflowTriggerMetadata).event === 'string' &&
    typeof (item as WorkflowTriggerMetadata).label === 'string'
  );
}

function isValidActionMetadata(
  item: unknown
): item is WorkflowActionMetadata {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof (item as WorkflowActionMetadata).id === 'string' &&
    typeof (item as WorkflowActionMetadata).name === 'string' &&
    typeof (item as WorkflowActionMetadata).type === 'string'
  );
}

const staleTime = 5 * 60 * 1000;

function fetchMetadata<T>(path: string, fallback: T): Promise<T> {
  return request('GET', endpoint(path), undefined, { skipIntercept: true })
    .then((response: { data?: { data?: unknown } }) => {
      const data = response.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data as T;
      }
      return fallback;
    })
    .catch(() => fallback);
}

const defaultDateFields: WorkflowDateField[] = [
  { key: '$trigger.date', label: 'Date' },
  { key: '$trigger.due_date', label: 'Due Date' },
  { key: '$trigger.created_at', label: 'Created At' },
  { key: '$trigger.updated_at', label: 'Updated At' },
];

const defaultOperations: WorkflowOperation[] = [
  { key: 'on', label: 'On' },
  { key: 'before', label: 'Before' },
  { key: 'after', label: 'After' },
];

const defaultFields: ConditionFieldDef[] = [
  { key: '$trigger.balance', label: 'Balance', type: 'number' },
  { key: '$trigger.amount', label: 'Amount', type: 'number' },
  { key: '$trigger.date', label: 'Date', type: 'date' },
  { key: '$trigger.due_date', label: 'Due Date', type: 'date' },
  { key: '$trigger.custom_value1', label: 'Custom Value 1', type: 'string' },
  { key: '$trigger.custom_value2', label: 'Custom Value 2', type: 'string' },
  { key: '$trigger.custom_value3', label: 'Custom Value 3', type: 'string' },
  { key: '$trigger.custom_value4', label: 'Custom Value 4', type: 'string' },
];

export function useWorkflowMetadata() {
  const triggers = useQuery<WorkflowTriggerMetadata[]>(
    ['/api/v1/workflows/metadata/triggers'],
    () =>
      request(
        'GET',
        endpoint('/api/v1/workflows/metadata/triggers'),
        undefined,
        { skipIntercept: true }
      )
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;

          if (
            Array.isArray(data) &&
            data.length > 0 &&
            data.every(isValidTriggerMetadata)
          ) {
            return (data as WorkflowTriggerMetadata[]).map((trigger) => ({
              ...trigger,
              condition_fields: Array.isArray(trigger.condition_fields)
                ? trigger.condition_fields.map((f: unknown): ConditionFieldDef =>
                    typeof f === 'string'
                      ? { key: f, label: f.replace(/_/g, ' '), type: 'string' as const }
                      : f as ConditionFieldDef
                  )
                : [],
            }));
          }

          return defaultTriggerMetadata;
        })
        .catch(() => defaultTriggerMetadata),
    {
      staleTime,
      placeholderData: defaultTriggerMetadata,
    }
  );

  const actions = useQuery<WorkflowActionMetadata[]>(
    ['/api/v1/workflows/metadata/actions'],
    () =>
      request(
        'GET',
        endpoint('/api/v1/workflows/metadata/actions'),
        undefined,
        { skipIntercept: true }
      )
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;

          if (
            Array.isArray(data) &&
            data.length > 0 &&
            data.every(isValidActionMetadata)
          ) {
            return (data as WorkflowActionMetadata[]).map((action) => ({
              ...action,
              params_schema: Array.isArray(action.params_schema)
                ? action.params_schema
                : [],
            }));
          }

          return defaultActionMetadata;
        })
        .catch(() => defaultActionMetadata),
    {
      staleTime,
      placeholderData: defaultActionMetadata,
    }
  );

  const fields = useQuery<ConditionFieldDef[]>(
    ['/api/v1/workflows/metadata/fields'],
    () => fetchMetadata('/api/v1/workflows/metadata/fields', defaultFields),
    { staleTime, placeholderData: defaultFields }
  );

  const dateFields = useQuery<WorkflowDateField[]>(
    ['/api/v1/workflows/metadata/date_fields'],
    () => fetchMetadata('/api/v1/workflows/metadata/date_fields', defaultDateFields),
    { staleTime, placeholderData: defaultDateFields }
  );

  const operations = useQuery<WorkflowOperation[]>(
    ['/api/v1/workflows/metadata/operations'],
    () => fetchMetadata('/api/v1/workflows/metadata/operations', defaultOperations),
    { staleTime, placeholderData: defaultOperations }
  );

  const resolvedTriggers = triggers.data ?? defaultTriggerMetadata;
  const resolvedActions = actions.data ?? defaultActionMetadata;
  const resolvedDateFields = dateFields.data ?? defaultDateFields;
  const resolvedOperations = operations.data ?? defaultOperations;
  const resolvedFields = fields.data ?? defaultFields;

  // Enrich wait_for_event action with entity/event options derived from
  // the trigger metadata so the dropdowns stay in sync with what the
  // backend actually supports.
  const enrichedActions = useMemo(() => {
    const entityOptions = Array.from(
      new Set(resolvedTriggers.map((t) => t.entity))
    ).map((entity) => ({ label: entity, value: entity }));

    const eventOptions = Array.from(
      new Set(resolvedTriggers.map((t) => t.event))
    ).map((event) => ({
      label: event.charAt(0).toUpperCase() + event.slice(1).replace(/_/g, ' '),
      value: event,
    }));

    return resolvedActions.map((action) => {
      if (action.id !== 'wait_for_event') return action;

      return {
        ...action,
        params_schema: action.params_schema.map((field) => {
          if (field.key === 'entity') {
            return { ...field, options: entityOptions };
          }
          if (field.key === 'event') {
            return { ...field, options: eventOptions };
          }
          return field;
        }),
      };
    });
  }, [resolvedTriggers, resolvedActions]);

  return {
    triggers: resolvedTriggers,
    actions: enrichedActions,
    dateFields: resolvedDateFields,
    operations: resolvedOperations,
    fields: resolvedFields,
    isLoading: false,
  };
}
