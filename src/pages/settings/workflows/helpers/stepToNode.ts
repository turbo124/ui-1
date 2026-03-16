import { Edge, Position } from '@xyflow/react';
import {
  BuilderNode,
  WorkflowDefinition,
  WorkflowStepKind,
} from '../types/workflow';
import { defaultActionMetadata } from './workflowTemplates';

const nodeColors: Record<WorkflowStepKind, string> = {
  trigger: '#3B82F6',
  action: '#10B981',
  wait_event: '#F59E0B',
  wait_delay: '#F59E0B',
  branch: '#8B5CF6',
  end: '#6B7280',
};

export function stepToNodes(workflow: WorkflowDefinition): BuilderNode[] {
  // Build adjacency to lay out nodes following the flow
  const outgoing = new Map<string, string[]>();
  workflow.edges.forEach((edge) => {
    const list = outgoing.get(edge.source) ?? [];
    list.push(edge.target);
    outgoing.set(edge.source, list);
  });

  // BFS from trigger to assign positions top-down
  const positions = new Map<string, { x: number; y: number }>();
  const trigger = workflow.steps.find((s) => s.kind === 'trigger');
  const startId = trigger?.id ?? workflow.steps[0]?.id;

  if (startId) {
    const queue: Array<{ id: string; depth: number; lane: number }> = [
      { id: startId, depth: 0, lane: 0 },
    ];
    const visited = new Set<string>();
    const laneCountPerDepth = new Map<number, number>();

    while (queue.length > 0) {
      const { id, depth, lane } = queue.shift()!;

      if (visited.has(id)) continue;
      visited.add(id);

      positions.set(id, {
        x: 100 + lane * 300,
        y: 60 + depth * 140,
      });

      const children = outgoing.get(id) ?? [];
      const nextDepth = depth + 1;

      children.forEach((childId, i) => {
        if (!visited.has(childId)) {
          const currentLane =
            children.length > 1 ? lane + i - Math.floor(children.length / 2) : lane;
          const usedLane = laneCountPerDepth.get(nextDepth) ?? 0;
          const finalLane = children.length > 1 ? currentLane : usedLane;
          laneCountPerDepth.set(nextDepth, usedLane + 1);
          queue.push({ id: childId, depth: nextDepth, lane: finalLane });
        }
      });
    }
  }

  return workflow.steps.map((step, index) => {
    const action = defaultActionMetadata.find(
      (entry) => entry.id === step.action_id
    );
    const result = step.config.result;
    const color =
      step.kind === 'end' && result === 'lost'
        ? '#EF4444'
        : nodeColors[step.kind];

    const pos = positions.get(step.id) ?? {
      x: 100,
      y: 60 + index * 140,
    };

    return {
      id: step.id,
      type: step.kind,
      position: pos,
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
      data: {
        label: step.name,
        subtitle: action?.name ?? step.kind,
        kind: step.kind,
        color,
        icon: action?.icon ?? 'trip_origin',
        leftLabel: step.config.left_label,
        rightLabel: step.config.right_label,
      },
    };
  });
}

export function normalizeEdges(edges: Edge[]): Edge[] {
  return edges.map((edge) => ({ ...edge, type: 'workflow' }));
}
