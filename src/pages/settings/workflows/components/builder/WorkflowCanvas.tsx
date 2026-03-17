import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  Edge,
} from '@xyflow/react';
import { createContext, useContext } from 'react';
import { useColorScheme } from '$app/common/colors';
import { BuilderNode } from '../../types/workflow';
import { WorkflowEdge } from './edges/WorkflowEdge';
import { TriggerNode } from './nodes/TriggerNode';
import { ActionNode } from './nodes/ActionNode';
import { WaitEventNode } from './nodes/WaitEventNode';
import { WaitDelayNode } from './nodes/WaitDelayNode';
import { BranchNode } from './nodes/BranchNode';
import { EndNode } from './nodes/EndNode';

const nodeTypes: Record<string, React.ComponentType<any>> = {
  trigger: TriggerNode,
  action: ActionNode,
  wait_event: WaitEventNode,
  wait_delay: WaitDelayNode,
  branch: BranchNode,
  end: EndNode,
};

const edgeTypes: Record<string, React.ComponentType<any>> = {
  workflow: WorkflowEdge,
};

export const EdgeInsertContext = createContext<
  ((edgeId: string) => void) | null
>(null);

export function useEdgeInsert() {
  return useContext(EdgeInsertContext);
}

interface Props {
  nodes: BuilderNode[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeClick: (_: unknown, node: BuilderNode) => void;
  onEdgeInsertClick?: (edgeId: string) => void;
}

export function WorkflowCanvas(props: Props) {
  const colors = useColorScheme();

  return (
    <ReactFlowProvider>
      <EdgeInsertContext.Provider value={props.onEdgeInsertClick ?? null}>
        <div
          className="relative rounded-lg border"
          style={{
            backgroundColor: colors.$1,
            borderColor: colors.$4,
            height: 'calc(100vh - 220px)',
            minHeight: '500px',
          }}
        >
          {props.nodes.length <= 1 && (
            <div
              className="pointer-events-none absolute z-10 ml-6 mt-6 max-w-sm rounded-lg border border-dashed px-4 py-3 shadow-sm"
              style={{
                backgroundColor: colors.$1,
                borderColor: colors.$4,
                color: colors.$3,
              }}
            >
              <div className="text-sm font-semibold">Start Building</div>
              <div className="mt-1 text-xs opacity-70">
                Click a step from the Step Palette to add it, or use the + button
                on an edge to insert between steps.
              </div>
            </div>
          )}
          <ReactFlow<BuilderNode>
            fitView
            nodes={props.nodes}
            edges={props.edges}
            onNodesChange={props.onNodesChange}
            onEdgesChange={props.onEdgesChange}
            onConnect={props.onConnect}
            onNodeClick={props.onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
          >
            <Background gap={20} color={colors.$4} />
            <Controls />
            <MiniMap zoomable pannable />
          </ReactFlow>
        </div>
      </EdgeInsertContext.Provider>
    </ReactFlowProvider>
  );
}
