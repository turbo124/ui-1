import { Handle, NodeProps, Position } from '@xyflow/react';

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
      <Handle type="target" position={Position.Left} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500 text-white">
            <span className="material-symbols-outlined text-base">
              {String(data.icon)}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {String(data.label)}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {data.subtitle ? String(data.subtitle) : 'Branch / Decision'}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs font-semibold">
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-center text-emerald-700">
          {String(data.leftLabel || 'Yes')}
        </div>
        <div className="rounded-lg bg-amber-50 px-3 py-2 text-center text-amber-700">
          {String(data.rightLabel || 'No')}
        </div>
      </div>

      <Handle
        id="branch-left"
        type="source"
        position={Position.Right}
        style={{ top: '42%', background: '#10B981' }}
      />
      <Handle
        id="branch-right"
        type="source"
        position={Position.Right}
        style={{ top: '74%', background: '#F59E0B' }}
      />
    </div>
  );
}
