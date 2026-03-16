import {
  addEdge,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { useMemo, useState } from 'react';
import { nodesToSteps, normalizeWorkflowEdges } from '../helpers/nodeToStep';
import { normalizeEdges, stepToNodes } from '../helpers/stepToNode';
import { validateWorkflow } from '../helpers/validateWorkflow';
import {
  BuilderNode,
  WorkflowActionMetadata,
  WorkflowDefinition,
} from '../types/workflow';

export function useWorkflowBuilder(
  workflow: WorkflowDefinition,
  actions: WorkflowActionMetadata[]
) {
  const [nodes, setNodes] = useState<BuilderNode[]>(stepToNodes(workflow));
  const [edges, setEdges] = useState<Edge[]>(normalizeEdges(workflow.edges));
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    workflow.steps.find((step) => step.kind === 'trigger')?.id || 'trigger'
  );

  const currentWorkflow = useMemo<WorkflowDefinition>(
    () => ({
      ...workflow,
      steps: nodesToSteps(nodes, workflow.steps),
      edges: normalizeWorkflowEdges(edges),
    }),
    [edges, nodes, workflow]
  );

  const issues = useMemo(
    () => validateWorkflow(currentWorkflow, nodes, actions),
    [actions, currentWorkflow, nodes]
  );

  const invalidNodeIds = new Set(
    issues.filter((issue) => issue.nodeId).map((issue) => issue.nodeId as string)
  );

  const presentNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: invalidNodeIds.has(node.id) ? 'invalid' : 'valid',
        },
      })),
    [invalidNodeIds, nodes]
  );

  return {
    nodes: presentNodes,
    edges,
    selectedNodeId,
    selectedStep: currentWorkflow.steps.find((step) => step.id === selectedNodeId),
    issues,
    workflow: currentWorkflow,
    setSelectedNodeId,
    setNodes,
    setEdges,
    onNodesChange: (changes: NodeChange[]) =>
      setNodes((current) => applyNodeChanges(changes as any, current as any) as BuilderNode[]),
    onEdgesChange: (changes: EdgeChange[]) =>
      setEdges((current) => applyEdgeChanges(changes, current)),
    onConnect: (connection: Connection) =>
      setEdges((current) => addEdge({ ...connection, type: 'workflow' }, current)),
  };
}
