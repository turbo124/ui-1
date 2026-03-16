import { Edge, Node } from '@xyflow/react';

export type WorkflowStepKind =
  | 'trigger'
  | 'action'
  | 'wait_event'
  | 'wait_delay'
  | 'branch'
  | 'end';

export type WorkflowStatus = 'active' | 'draft' | 'archived';

export type WorkflowRunStatus =
  | 'active'
  | 'waiting'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'timed_out';

export interface WorkflowCondition {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface WorkflowTriggerMetadata {
  id: string;
  entity: string;
  event: string;
  label: string;
  description: string;
  condition_fields: string[];
}

export interface WorkflowActionMetadata {
  id: string;
  name: string;
  category: 'Actions' | 'Waits' | 'Flow';
  type: WorkflowStepKind;
  description: string;
  icon: string;
  produces_entity?: {
    variable: string;
    entity: string;
    label: string;
  };
  params_schema: WorkflowActionField[];
}

export interface WorkflowActionField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'entity_ref';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface WorkflowStep {
  id: string;
  kind: WorkflowStepKind;
  action_id?: string;
  name: string;
  config: Record<string, string>;
  meta?: Record<string, string>;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  status: WorkflowStatus;
  archived_at?: number;
  trigger: {
    entity: string;
    event: string;
    description: string;
    conditions: WorkflowCondition[];
    match: 'and' | 'or';
  };
  steps: WorkflowStep[];
  edges: Edge[];
  runs_count: number;
  last_run_at?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  icon: string;
  category: 'Sales' | 'Billing' | 'Onboarding' | 'Operations';
  summary: string;
  trigger_description: string;
  step_count: number;
  workflow: WorkflowDefinition;
}

export interface WorkflowRunStep {
  id: string;
  name: string;
  kind: WorkflowStepKind;
  status:
    | 'completed'
    | 'waiting'
    | 'active'
    | 'failed'
    | 'skipped'
    | 'pending'
    | 'end';
  started_at?: string;
  ended_at?: string;
  error?: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  workflow_name: string;
  entity_type: string;
  entity_id: string;
  entity_label: string;
  status: WorkflowRunStatus;
  current_step?: string;
  waiting_since?: string;
  started_at: string;
  steps: WorkflowRunStep[];
  context_refs: Array<{
    variable: string;
    label: string;
    entity: string;
  }>;
}

export interface BuilderNodeData extends Record<string, unknown> {
  label: string;
  subtitle?: string;
  kind: WorkflowStepKind;
  color: string;
  icon: string;
  status?: 'invalid' | 'valid';
  leftLabel?: string;
  rightLabel?: string;
}

export type BuilderNode = Node<BuilderNodeData>;

export interface WorkflowValidationIssue {
  id: string;
  nodeId?: string;
  message: string;
}
