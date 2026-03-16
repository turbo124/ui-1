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
    ],
    edges: [],
    runs_count: 0,
  };
}
