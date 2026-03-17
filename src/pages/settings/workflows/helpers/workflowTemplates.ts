import { WorkflowDefinition } from '../types/workflow';

export function createBlankWorkflow(): WorkflowDefinition {
  return {
    id: 'workflow-new',
    name: 'Untitled Workflow',
    description: '',
    status: 'active',
    archived_at: 0,
    is_deleted: false,
    trigger: {
      entity: '',
      event: '',
      description: '',
      conditions: [],
      match: 'and',
    },
    steps: [
      {
        id: 'trigger',
        kind: 'trigger',
        name: 'Trigger',
        config: {},
      },
      {
        id: 'end',
        kind: 'end',
        action_id: 'end',
        name: 'End Workflow',
        config: { end_status: 'completed' },
      },
    ],
    edges: [
      {
        id: 'edge-trigger-end',
        source: 'trigger',
        target: 'end',
        type: 'workflow',
      },
    ],
    runs_count: 0,
  };
}
