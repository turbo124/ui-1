import { useMemo } from 'react';
import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import {
  ConditionFieldDef,
  DateFieldsResponse,
  TriggerEntityMetadata,
  WorkflowActionField,
  WorkflowActionMetadata,
  WorkflowDateField,
  WorkflowOperation,
  WorkflowTriggerMetadata,
} from '../types/workflow';

const staleTime = 5 * 60 * 1000;

const queryOptions = {
  staleTime,
  refetchOnMount: false as const,
  refetchOnWindowFocus: false as const,
};

// ---------------------------------------------------------------------------
// Triggers — API returns {entity, label, events[]} per entity.
// We flatten to one WorkflowTriggerMetadata per entity+event for the builder.
// ---------------------------------------------------------------------------

function flattenTriggers(
  raw: TriggerEntityMetadata[]
): WorkflowTriggerMetadata[] {
  const result: WorkflowTriggerMetadata[] = [];

  for (const entry of raw) {
    if (entry.entity === 'manual') {
      result.push({
        id: 'manual',
        entity: 'manual',
        event: '',
        label: entry.label,
        description: '',
      });
      continue;
    }

    for (const evt of entry.events ?? []) {
      result.push({
        id: `${entry.entity}.${evt.event}`,
        entity: entry.entity,
        event: evt.event,
        label: evt.label,
        description: '',
      });
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Fields — API returns { data: { invoice: [...], quote: [...] } }.
// We flatten into ConditionFieldDef[] keyed as entity.field.
// ---------------------------------------------------------------------------

function flattenFields(
  raw: Record<string, Array<{ field: string; label: string; type: string; operators?: string[]; options?: Array<{ value: string | number; label: string }> }>>,
  triggerEntity: string
): ConditionFieldDef[] {
  const result: ConditionFieldDef[] = [];

  // Prefer the trigger entity's fields; fall back to all if none match
  const fields = raw[triggerEntity] ?? Object.values(raw).flat();

  for (const f of fields) {
    result.push({
      key: f.field,
      label: f.label,
      type: (f.type as ConditionFieldDef['type']) ?? 'string',
      operators: f.operators,
      options: f.options,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Date fields — API returns { offset_operators: [...], entity_fields: { invoice: [...] } }.
// We flatten entity_fields to WorkflowDateField[] and extract offset_operators.
// ---------------------------------------------------------------------------

function flattenDateFields(
  raw: DateFieldsResponse,
  triggerEntity: string
): {
  dateFields: WorkflowDateField[];
  offsetOperators: Array<{ value: string; label: string }>;
} {
  const offsetOperators = raw.offset_operators ?? [];
  const entityFields = raw.entity_fields ?? {};

  // Prefer the trigger entity's fields, but include all if none match
  const fields = entityFields[triggerEntity] ?? Object.values(entityFields).flat();

  const dateFields: WorkflowDateField[] = fields.map((f) => ({
    key: `$trigger.${f.field}`,
    label: f.label,
  }));

  return { dateFields, offsetOperators };
}

// ---------------------------------------------------------------------------
// Operations — API returns { data: { invoice: { category: [...] } } }.
// We flatten into WorkflowOperation[].
// ---------------------------------------------------------------------------

function flattenOperations(
  raw: Record<string, Record<string, Array<{ operation: string; label: string; args?: unknown[]; guard?: unknown }>>>
): WorkflowOperation[] {
  const result: WorkflowOperation[] = [];

  for (const [, categories] of Object.entries(raw)) {
    for (const [category, ops] of Object.entries(categories)) {
      for (const op of ops) {
        result.push({
          key: op.operation,
          label: op.label,
          category,
          guard: op.guard as WorkflowOperation['guard'],
          args: op.args as WorkflowOperation['args'],
        });
      }
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Actions — API returns { type, label, icon, category, params_schema: {} }.
// params_schema is an object; we normalize to WorkflowActionField[].
// ---------------------------------------------------------------------------

function normalizeAction(raw: Record<string, unknown>): WorkflowActionMetadata {
  const type = (raw.type as string) ?? '';
  const paramsRaw = raw.params_schema;

  let paramsSchema: WorkflowActionField[] = [];

  if (Array.isArray(paramsRaw)) {
    paramsSchema = paramsRaw as WorkflowActionField[];
  } else if (paramsRaw && typeof paramsRaw === 'object') {
    paramsSchema = Object.entries(paramsRaw as Record<string, Record<string, unknown>>).map(
      ([key, def]) => ({
        key,
        label: (def.label as string) ?? key,
        type: (def.type as WorkflowActionField['type']) ?? 'text',
        required: (def.required as boolean) ?? false,
        options: Array.isArray(def.options)
          ? (def.options as string[]).map((o) =>
              typeof o === 'string' ? { label: o, value: o } : o
            )
          : undefined,
        placeholder: def.placeholder as string | undefined,
      })
    );
  }

  // Map API action type to builder step kind
  let stepKind: WorkflowActionMetadata['type'] = 'action';
  if (type === 'wait_delay') stepKind = 'wait_delay';
  else if (type === 'wait_for_event') stepKind = 'wait_event';
  else if (type === 'branch') stepKind = 'branch';
  else if (type === 'end') stepKind = 'end';

  // Use raw category from API; only override for built-in step kinds
  let category = (raw.category as string) || 'actions';
  if (stepKind === 'wait_delay' || stepKind === 'wait_event') {
    category = 'waits';
  } else if (stepKind === 'branch' || stepKind === 'end') {
    category = 'flow';
  }

  return {
    id: type,
    name: (raw.label as string) ?? type,
    category,
    type: stepKind,
    description: (raw.description as string) ?? '',
    icon: (raw.icon as string) ?? 'settings',
    entities: Array.isArray(raw.entities) ? (raw.entities as string[]) : undefined,
    params_schema: paramsSchema,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useWorkflowMetadata(triggerEntity?: string) {
  const triggers = useQuery<WorkflowTriggerMetadata[]>(
    ['/api/v1/workflows/metadata/triggers'],
    () =>
      request('GET', endpoint('/api/v1/workflows/metadata/triggers'))
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;
          if (Array.isArray(data)) {
            return flattenTriggers(data as TriggerEntityMetadata[]);
          }
          return [];
        })
        .catch(() => []),
    queryOptions
  );

  const actions = useQuery<WorkflowActionMetadata[]>(
    ['/api/v1/workflows/metadata/actions'],
    () =>
      request('GET', endpoint('/api/v1/workflows/metadata/actions'))
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;
          if (Array.isArray(data)) {
            return data.map((item) => normalizeAction(item as Record<string, unknown>));
          }
          return [];
        })
        .catch(() => []),
    queryOptions
  );

  type RawFieldsMap = Record<string, Array<{ field: string; label: string; type: string; operators?: string[]; options?: Array<{ value: string | number; label: string }> }>>;

  const fieldsRaw = useQuery<RawFieldsMap>(
    ['/api/v1/workflows/metadata/fields'],
    () =>
      request('GET', endpoint('/api/v1/workflows/metadata/fields'))
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            return data as RawFieldsMap;
          }
          return {};
        })
        .catch(() => ({})),
    queryOptions
  );

  const dateFieldsRaw = useQuery<DateFieldsResponse>(
    ['/api/v1/workflows/metadata/date_fields'],
    () =>
      request('GET', endpoint('/api/v1/workflows/metadata/date_fields'))
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;
          if (data && typeof data === 'object') {
            return data as DateFieldsResponse;
          }
          return { offset_operators: [], entity_fields: {} };
        })
        .catch(() => ({ offset_operators: [], entity_fields: {} } as DateFieldsResponse)),
    queryOptions
  );

  const operationsQuery = useQuery<WorkflowOperation[]>(
    ['/api/v1/workflows/metadata/operations'],
    () =>
      request('GET', endpoint('/api/v1/workflows/metadata/operations'))
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;
          if (data && typeof data === 'object' && !Array.isArray(data)) {
            return flattenOperations(
              data as Record<string, Record<string, Array<{ operation: string; label: string }>>>
            );
          }
          return [];
        })
        .catch(() => []),
    queryOptions
  );

  const resolvedTriggers = triggers.data ?? [];
  const resolvedFields = useMemo(
    () => flattenFields(fieldsRaw.data ?? {}, triggerEntity ?? ''),
    [fieldsRaw.data, triggerEntity]
  );
  const resolvedOperations = operationsQuery.data ?? [];

  // The actions endpoint only returns action-type steps (send_email, etc.).
  // Wait/delay, wait/event, branch, and end are built-in step types that
  // must always be available in the palette regardless of entity.
  const builtInSteps: WorkflowActionMetadata[] = [
    {
      id: 'wait_delay',
      name: 'wait_delay',
      category: 'waits',
      type: 'wait_delay',
      description: 'wait_delay_description',
      icon: 'schedule',
      params_schema: [
        { key: 'date_field', label: 'date_field', type: 'date_field', required: true },
        {
          key: 'offset_operator',
          label: 'when',
          type: 'select',
          required: true,
          options: [
            { label: 'on', value: 'on' },
            { label: 'before', value: 'before' },
            { label: 'after', value: 'after' },
          ],
        },
        { key: 'offset_days', label: 'offset_days', type: 'number', placeholder: '0' },
      ],
    },
    {
      id: 'wait_for_event',
      name: 'wait_for_event',
      category: 'waits',
      type: 'wait_event',
      description: 'wait_for_event_description',
      icon: 'hourglass_top',
      params_schema: [
        { key: 'event', label: 'event', type: 'select', required: true },
        { key: 'timeout_days', label: 'timeout_days', type: 'number', placeholder: '30' },
      ],
    },
    {
      id: 'branch',
      name: 'conditional',
      category: 'flow',
      type: 'branch',
      description: 'conditional_description',
      icon: 'alt_route',
      params_schema: [
        { key: 'field', label: 'field', type: 'entity_field', required: true },
        { key: 'operator', label: 'operator', type: 'operator', required: true },
        { key: 'value', label: 'value', type: 'text' },
      ],
    },
    {
      id: 'end',
      name: 'end_workflow',
      category: 'flow',
      type: 'end',
      description: 'end_workflow_description',
      icon: 'flag',
      params_schema: [
        {
          key: 'end_status',
          label: 'outcome',
          type: 'select',
          options: [
            { label: 'completed', value: 'completed' },
            { label: 'lost', value: 'lost' },
          ],
        },
        {
          key: 'restart',
          label: 'repeat_workflow',
          type: 'select',
          options: [
            { label: 'no', value: 'false' },
            { label: 'yes', value: 'true' },
          ],
        },
      ],
    },
  ];

  // Merge API actions with built-in steps, avoiding duplicates
  const resolvedActions = useMemo(() => {
    const apiActions = actions.data ?? [];
    const builtInIds = new Set(builtInSteps.map((s) => s.id));
    const filtered = apiActions.filter((a) => !builtInIds.has(a.id));
    return [...filtered, ...builtInSteps];
  }, [actions.data]);

  const { dateFields, offsetOperators } = useMemo(
    () => flattenDateFields(dateFieldsRaw.data ?? { offset_operators: [], entity_fields: {} }, triggerEntity ?? ''),
    [dateFieldsRaw.data, triggerEntity]
  );

  // Filter actions by trigger entity — only applies to the "Actions" category.
  // Waits and Flow are always available regardless of entity.
  const entityFilteredActions = useMemo(() => {
    if (!triggerEntity) return resolvedActions;

    const entity = triggerEntity.toLowerCase();

    return resolvedActions.filter((action) => {
      if (action.category === 'waits' || action.category === 'flow') return true;
      if (!action.entities || action.entities.length === 0) return true;
      return action.entities.some((e) => e.toLowerCase() === entity);
    });
  }, [resolvedActions, triggerEntity]);

  // Enrich wait_for_event action with entity/event options from triggers.
  // Events are scoped to the trigger entity so the user only sees valid options.
  const enrichedActions = useMemo(() => {
    const entityOptions = Array.from(
      new Set(resolvedTriggers.map((t) => t.entity).filter((e) => e !== 'manual'))
    ).map((entity) => ({ label: entity, value: entity }));

    const triggerEvents = triggerEntity
      ? resolvedTriggers.filter(
          (t) => t.entity.toLowerCase() === triggerEntity.toLowerCase()
        )
      : resolvedTriggers;

    const eventOptions = Array.from(
      new Set(triggerEvents.map((t) => t.event).filter(Boolean))
    ).map((event) => ({
      label: event.charAt(0).toUpperCase() + event.slice(1).replace(/_/g, ' '),
      value: event,
    }));

    return entityFilteredActions.map((action) => {
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
  }, [resolvedTriggers, entityFilteredActions, triggerEntity]);

  const isLoading =
    triggers.isLoading ||
    actions.isLoading ||
    fieldsRaw.isLoading ||
    dateFieldsRaw.isLoading ||
    operationsQuery.isLoading;

  return {
    triggers: resolvedTriggers,
    actions: enrichedActions,
    dateFields,
    offsetOperators,
    operations: resolvedOperations,
    fields: resolvedFields,
    isLoading,
  };
}
