import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from '@xyflow/react';
import { useEdgeInsert } from '../WorkflowCanvas';

export function WorkflowEdge(props: EdgeProps) {
  const [path, labelX, labelY] = getBezierPath(props);
  const onInsert = useEdgeInsert();

  const isGoto = props.sourceHandleId === 'false';

  const edgeStyle = isGoto
    ? { stroke: '#F59E0B', strokeWidth: 2, strokeDasharray: '6 4' }
    : { stroke: '#94A3B8', strokeWidth: 2 };

  return (
    <>
      <BaseEdge path={path} style={edgeStyle} />
      {isGoto && (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan absolute rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
            }}
          >
            GOTO
          </div>
        </EdgeLabelRenderer>
      )}
      {!isGoto && onInsert && (
        <EdgeLabelRenderer>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onInsert(props.id);
            }}
            className="nodrag nopan absolute flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white text-sm text-slate-500 shadow transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            +
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
