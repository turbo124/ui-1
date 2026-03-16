import { Handle, NodeProps, Position } from '@xyflow/react';
import { WorkflowIcon } from '../../shared/WorkflowIcon';

export function BranchNode({ data, selected }: NodeProps<any>) {
  const borderColor =
    data.status === 'invalid' ? '#FCA5A5' : 'rgba(139, 92, 246, 0.2)';

  return (
    <div
      className="min-w-[240px] rounded-lg border bg-white px-4 py-3 shadow-sm"
      style={{
        borderColor,
        boxShadow: selected
          ? '0 0 0 2px rgba(139, 92, 246, 0.2)'
          : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} />

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white">
          <WorkflowIcon name={String(data.icon)} size={18} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">
            {String(data.label)}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {data.subtitle ? String(data.subtitle) : 'True / False'}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: '#10B981' }}
          />
          <span className="text-emerald-600">True</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-amber-600">False → GOTO</span>
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: '#F59E0B' }}
          />
        </div>
      </div>

      {/* True path — continues down the chain */}
      <Handle
        id="true"
        type="source"
        position={Position.Bottom}
        style={{ left: '30%', background: '#10B981' }}
      />

      {/* False path — GOTO link to another step */}
      <Handle
        id="false"
        type="source"
        position={Position.Bottom}
        style={{ left: '70%', background: '#F59E0B' }}
      />
    </div>
  );
}
