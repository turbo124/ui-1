import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';

export function WorkflowEdge(props: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath(props);

  return (
    <>
      <BaseEdge path={path} style={{ stroke: '#94A3B8', strokeWidth: 2 }} />
      <EdgeLabelRenderer>
        <button
          type="button"
          className="nodrag nopan absolute flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-500 shadow"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
        >
          +
        </button>
      </EdgeLabelRenderer>
    </>
  );
}
