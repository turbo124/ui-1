import { Handle, NodeProps, Position } from '@xyflow/react';
import classNames from 'classnames';
import { WorkflowIcon } from '../../shared/WorkflowIcon';

export function GenericNode({ data, selected }: NodeProps<any>) {
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
      <Handle type="target" position={Position.Top} />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white"
            style={{ backgroundColor: data.color }}
          >
            <WorkflowIcon name={String(data.icon)} size={20} />
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

        <div
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            backgroundColor:
              data.status === 'invalid' ? '#EF4444' : '#10B981',
          }}
        />
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
