import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  ReactFlowInstance,
  Edge,
} from '@xyflow/react';
import { DragEvent, useCallback, useState } from 'react';
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

interface Props {
  nodes: BuilderNode[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: any) => void;
  onNodeClick: (_: unknown, node: BuilderNode) => void;
  onDropStep?: (payload: { x: number; y: number; actionId: string }) => void;
}

export function WorkflowCanvas(props: Props) {
  const colors = useColorScheme();
  const [instance, setInstance] = useState<ReactFlowInstance<BuilderNode> | null>(
    null
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const payload = event.dataTransfer.getData(
        'application/invoiceninja-workflow-step'
      );

      if (!payload || !instance || !props.onDropStep) {
        return;
      }

      const action = JSON.parse(payload) as { id: string };
      const position = instance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      props.onDropStep({
        x: position.x,
        y: position.y,
        actionId: action.id,
      });
    },
    [instance, props]
  );

  return (
    <ReactFlowProvider>
      <div
        className="relative h-[620px] rounded-lg border"
        style={{
          backgroundColor: colors.$1,
          borderColor: colors.$4,
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
              Drag a step from the Step Palette onto the canvas, or click a step
              to add it. Use Branch/Decision nodes to split the workflow.
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
          onInit={(value) => setInstance(value)}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
        >
          <Background gap={20} color={colors.$4} />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
