import { Edge } from '@xyflow/react';
import { BuilderNode, WorkflowStep } from '../types/workflow';

export function nodesToSteps(nodes: BuilderNode[], existingSteps: WorkflowStep[]): WorkflowStep[] {
  return nodes.map((node) => {
    const existing = existingSteps.find((step) => step.id === node.id);

    return {
      id: node.id,
      kind: node.data.kind,
      action_id: existing?.action_id,
      name: node.data.label,
      config: existing?.config || {},
      meta: existing?.meta,
    };
  });
}

export function normalizeWorkflowEdges(edges: Edge[]): Edge[] {
  return edges.map((edge) => ({
    ...edge,
    id: edge.id || `${edge.source}-${edge.target}`,
    type: 'workflow',
  }));
}
