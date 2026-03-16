import { Edge } from '@xyflow/react';
import {
  BuilderNode,
  WorkflowActionMetadata,
  WorkflowDefinition,
  WorkflowValidationIssue,
} from '../types/workflow';

function hasCycle(nodes: BuilderNode[], edges: Edge[]) {
  const adjacency = new Map<string, string[]>();
  const visited = new Set<string>();
  const active = new Set<string>();

  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach((edge) => adjacency.get(edge.source)?.push(edge.target));

  const dfs = (nodeId: string): boolean => {
    if (active.has(nodeId)) {
      return true;
    }

    if (visited.has(nodeId)) {
      return false;
    }

    visited.add(nodeId);
    active.add(nodeId);

    for (const next of adjacency.get(nodeId) || []) {
      if (dfs(next)) {
        return true;
      }
    }

    active.delete(nodeId);
    return false;
  };

  return nodes.some((node) => dfs(node.id));
}

function reachableEnds(nodes: BuilderNode[], edges: Edge[]) {
  const adjacency = new Map<string, string[]>();
  const ends = new Set(
    nodes.filter((node) => node.data.kind === 'end').map((node) => node.id)
  );

  nodes.forEach((node) => adjacency.set(node.id, []));
  edges.forEach((edge) => adjacency.get(edge.source)?.push(edge.target));

  const trigger = nodes.find((node) => node.data.kind === 'trigger');

  if (!trigger) {
    return false;
  }

  const stack = [trigger.id];
  const seen = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop() as string;

    if (seen.has(current)) {
      continue;
    }

    seen.add(current);

    if (ends.has(current)) {
      return true;
    }

    for (const next of adjacency.get(current) || []) {
      stack.push(next);
    }
  }

  return false;
}

export function validateWorkflow(
  workflow: WorkflowDefinition,
  nodes: BuilderNode[],
  actions: WorkflowActionMetadata[]
): WorkflowValidationIssue[] {
  const issues: WorkflowValidationIssue[] = [];
  const edges = workflow.edges ?? [];
  const trigger = workflow.trigger;

  if (!trigger?.entity || !trigger?.event) {
    issues.push({ id: 'trigger-required', message: 'Trigger entity and event are required.' });
  }

  if (nodes.filter((node) => node.data?.kind !== 'trigger').length === 0) {
    issues.push({ id: 'steps-required', message: 'Add at least one step after the trigger.' });
  }

  const orphanNodes = nodes.filter(
    (node) =>
      node.data?.kind !== 'trigger' &&
      !edges.some((edge) => edge.source === node.id || edge.target === node.id)
  );

  orphanNodes.forEach((node) => {
    issues.push({
      id: `orphan-${node.id}`,
      nodeId: node.id,
      message: `"${node.data?.label ?? node.id}" is not connected to the workflow.`,
    });
  });

  if (hasCycle(nodes, edges)) {
    issues.push({ id: 'cycle', message: 'Circular paths are not allowed in the workflow DAG.' });
  }

  (workflow.steps ?? []).forEach((step) => {
    const action = actions.find((entry) => entry.id === step.action_id);

    if (!action) {
      return;
    }

    const paramsSchema = Array.isArray(action.params_schema)
      ? action.params_schema
      : [];
    const config = step.config ?? {};

    paramsSchema.forEach((field) => {
      if (field.required && !config[field.key]) {
        issues.push({
          id: `${step.id}-${field.key}`,
          nodeId: step.id,
          message: `"${step.name}" is missing "${field.label}".`,
        });
      }
    });

  });

  if (!reachableEnds(nodes, edges)) {
    issues.push({
      id: 'end-reachable',
      message: 'At least one End node must be reachable from the trigger.',
    });
  }

  return issues;
}
