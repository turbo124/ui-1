import { Edge, Position } from '@xyflow/react';
import {
  BuilderNode,
  WorkflowActionMetadata,
  WorkflowDateField,
  WorkflowDefinition,
  WorkflowStepKind,
} from '../types/workflow';

/**
 * Build a human-readable subtitle for wait_delay steps from their config.
 * e.g. "3 days after Due Date" or "On Due Date"
 */
export function buildWaitDelaySubtitle(
  config: Record<string, string>,
  dateFields?: WorkflowDateField[]
): string {
  const dateFieldKey = config.date_field;
  const operator = config.offset_operator;
  const days = config.offset_days;

  if (!dateFieldKey) return 'Wait / Delay';

  const dateLabel =
    dateFields?.find((df) => df.key === dateFieldKey)?.label ??
    dateFieldKey.replace(/^\$trigger\./, '').replace(/_/g, ' ');

  if (!operator || operator === 'on' || !days || days === '0') {
    return `On ${dateLabel}`;
  }

  const dayCount = parseInt(days, 10);
  const dayWord = dayCount === 1 ? 'day' : 'days';

  return `${dayCount} ${dayWord} ${operator} ${dateLabel}`;
}

/**
 * Build a human-readable subtitle for wait_event steps from their config.
 * e.g. "Invoice paid" or "Quote approved"
 */
export function buildWaitEventSubtitle(
  config: Record<string, string>
): string {
  const entity = config.entity;
  const event = config.event;

  if (!entity && !event) return 'Wait for Event';

  const parts: string[] = [];
  if (entity) parts.push(entity);
  if (event) parts.push(event.replace(/_/g, ' '));

  return parts.join(' ') || 'Wait for Event';
}

const nodeColors: Record<WorkflowStepKind, string> = {
  trigger: '#3B82F6',
  action: '#10B981',
  wait_event: '#F59E0B',
  wait_delay: '#F59E0B',
  branch: '#8B5CF6',
  end: '#6B7280',
};

export function stepToNodes(
  workflow: WorkflowDefinition,
  actions?: WorkflowActionMetadata[]
): BuilderNode[] {
  const nextStep = new Map<string, string>();
  (workflow.edges ?? []).forEach((edge) => {
    if (edge.sourceHandle === 'false') return;
    nextStep.set(edge.source, edge.target);
  });

  const positions = new Map<string, { x: number; y: number }>();
  const wfSteps = workflow.steps ?? [];
  const trigger = wfSteps.find((s) => s.kind === 'trigger');
  const startId = trigger?.id ?? wfSteps[0]?.id;

  if (startId) {
    let current: string | undefined = startId;
    let depth = 0;
    const visited = new Set<string>();

    while (current && !visited.has(current)) {
      visited.add(current);
      positions.set(current, { x: 100, y: 60 + depth * 140 });
      depth++;
      current = nextStep.get(current);
    }
  }

  const wfTrigger = workflow.trigger;
  const actionList = actions ?? [];

  return wfSteps.map((step, index) => {
    const action = actionList.find(
      (entry: WorkflowActionMetadata) => entry.id === step.action_id
    );
    const config = step.config ?? {};
    const result = config.end_status ?? config.result;
    const isRestart = config.restart === 'true';
    const color =
      step.kind === 'end' && isRestart
        ? '#3B82F6'
        : step.kind === 'end' && result === 'lost'
          ? '#EF4444'
          : nodeColors[step.kind] ?? nodeColors['action'];

    const pos = positions.get(step.id) ?? {
      x: 100,
      y: 60 + (positions.size + index) * 140,
    };

    const label =
      step.kind === 'trigger' && wfTrigger?.entity && wfTrigger?.event
        ? `${wfTrigger.entity} ${wfTrigger.event.replace(/_/g, ' ')}`
        : step.name;

    const subtitle =
      step.kind === 'trigger'
        ? wfTrigger?.description || 'Trigger'
        : step.kind === 'end' && isRestart
          ? 'Loops back to start'
          : step.kind === 'wait_delay'
            ? buildWaitDelaySubtitle(config)
            : step.kind === 'wait_event'
              ? buildWaitEventSubtitle(config)
              : action?.name ?? step.kind;

    const icon =
      step.kind === 'end' && isRestart
        ? 'replay'
        : action?.icon ?? 'trip_origin';

    const nodeType = step.kind && step.kind in nodeColors ? step.kind : 'action';

    return {
      id: step.id,
      type: nodeType,
      position: pos,
      sourcePosition: Position.Bottom,
      targetPosition: Position.Top,
      data: {
        label,
        subtitle,
        kind: step.kind,
        color,
        icon,
        restart: isRestart,
      },
    };
  });
}

export function normalizeEdges(edges: Edge[] | undefined): Edge[] {
  return (edges ?? []).map((edge) => ({ ...edge, type: 'workflow' }));
}
