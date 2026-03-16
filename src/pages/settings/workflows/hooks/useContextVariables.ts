import { Edge } from '@xyflow/react';
import { WorkflowActionMetadata, WorkflowStep } from '../types/workflow';

export function useContextVariables(
  currentStepId: string | undefined,
  steps: WorkflowStep[],
  edges: Edge[],
  actions: WorkflowActionMetadata[]
) {
  if (!currentStepId) {
    return [];
  }

  const incoming = new Map<string, string[]>();
  edges.forEach((edge) => {
    const current = incoming.get(edge.target) || [];
    current.push(edge.source);
    incoming.set(edge.target, current);
  });

  const visited = new Set<string>();
  const stack = [...(incoming.get(currentStepId) || [])];

  while (stack.length > 0) {
    const nodeId = stack.pop() as string;

    if (visited.has(nodeId)) {
      continue;
    }

    visited.add(nodeId);
    stack.push(...(incoming.get(nodeId) || []));
  }

  return steps
    .filter((step) => visited.has(step.id))
    .flatMap((step) => {
      const action = actions.find((entry) => entry.id === step.action_id);

      if (!action?.produces_entity) {
        return [];
      }

      return [
        {
          value: action.produces_entity.variable,
          label: `${action.produces_entity.variable} -> ${action.produces_entity.label}`,
        },
      ];
    });
}
