import { Edge, Position } from '@xyflow/react';
import {
  BuilderNode,
  WorkflowDateField,
  WorkflowDefinition,
  WorkflowStepKind,
} from '../types/workflow';
import { defaultActionMetadata } from './workflowTemplates';

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

const nodeColors: Record<WorkflowStepKind, string> = {
  trigger: '#3B82F6',
  action: '#10B981',
  wait_event: '#F59E0B',
  wait_delay: '#F59E0B',
  branch: '#8B5CF6',
  end: '#6B7280',
};

export function stepToNodes(workflow: WorkflowDefinition): BuilderNode[] {
  // Build adjacency to lay out nodes following the linear flow
  const nextStep = new Map<string, string>();
  (workflow.edges ?? []).forEach((edge) => {
    nextStep.set(edge.source, edge.target);
  });

  // Walk the chain from trigger to assign positions top-down
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

  return wfSteps.map((step, index) => {
    const action = defaultActionMetadata.find(
      (entry) => entry.id === step.action_id
    );
    const config = step.config ?? {};
    const result = config.result;
    const color =
      step.kind === 'end' && result === 'lost'
        ? '#EF4444'
        : nodeColors[step.kind] ?? nodeColors['action'];

    const pos = positions.get(step.id) ?? {
      x: 100,
      y: 60 + index * 140,
    };

    // For trigger steps, derive label from entity/event
    const label =
      step.kind === 'trigger' && wfTrigger?.entity && wfTrigger?.event
        ? `${wfTrigger.entity} ${wfTrigger.event.replace(/_/g, ' ')}`
        : step.name;

    const subtitle =
      step.kind === 'trigger'
        ? wfTrigger?.description || 'Trigger'
        : step.kind === 'wait_delay'
          ? buildWaitDelaySubtitle(config)
          : action?.name ?? step.kind;

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
        icon: action?.icon ?? 'trip_origin',
      },
    };
  });
}

export function normalizeEdges(edges: Edge[] | undefined): Edge[] {
  return (edges ?? []).map((edge) => ({ ...edge, type: 'workflow' }));
}
