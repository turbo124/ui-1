import { Handle, NodeProps, Position } from '@xyflow/react';
import classNames from 'classnames';
import { WorkflowIcon } from '../../shared/WorkflowIcon';
import { MdReplay } from 'react-icons/md';

const handleStyle: React.CSSProperties = {
  width: 12,
  height: 12,
  borderRadius: '50%',
  border: '2px solid #fff',
  boxShadow: '0 0 0 1px #94a3b8',
};

export function EndNode({ data, selected }: NodeProps<any>) {
  const isRestart = Boolean(data.restart);

  const borderColor =
    data.status === 'invalid' ? '#FCA5A5' : `${data.color}33`;
  const ringColor =
    data.status === 'invalid'
      ? 'rgba(252, 165, 165, 0.3)'
      : `${data.color}33`;

  return (
    <div
      className={classNames(
        'min-w-[220px] rounded-lg border bg-white px-4 py-3 shadow-sm transition-all'
      )}
      style={{
        borderColor,
        boxShadow: selected ? `0 0 0 2px ${ringColor}` : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...handleStyle, background: data.color || '#64748b' }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: data.color }}
          >
            {isRestart ? (
              <MdReplay size={20} />
            ) : (
              <WorkflowIcon name={String(data.icon)} size={20} />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-gray-900 truncate">
              {String(data.label)}
            </div>
            {data.subtitle && (
              <div className="text-xs text-gray-500 truncate">
                {String(data.subtitle)}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isRestart && (
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: '#DBEAFE', color: '#1D4ED8' }}
            >
              LOOP
            </span>
          )}
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{
              backgroundColor:
                data.status === 'invalid' ? '#EF4444' : '#10B981',
            }}
          />
        </div>
      </div>

      {/* Dashed loop-back arrow indicator */}
      {isRestart && (
        <div
          className="mt-2 flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium"
          style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}
        >
          <MdReplay size={12} />
          Restarts from first step
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...handleStyle, background: data.color || '#64748b' }}
      />
    </div>
  );
}
