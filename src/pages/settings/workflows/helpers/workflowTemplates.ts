import { Edge } from '@xyflow/react';
import {
  WorkflowActionMetadata,
  WorkflowDefinition,
  WorkflowTemplate,
  WorkflowTriggerMetadata,
} from '../types/workflow';

export function createBlankWorkflow(): WorkflowDefinition {
  return {
    id: 'workflow-new',
    name: 'Untitled Workflow',
    description: '',
    status: 'draft',
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

// ---------------------------------------------------------------------------
// Trigger metadata – entity + event pairs
// The `label` is the full human sentence (used in summaries / trigger descriptions)
// The `event` is the short name shown in the Event dropdown
// ---------------------------------------------------------------------------

export const defaultTriggerMetadata: WorkflowTriggerMetadata[] = [
  // Manual
  {
    id: 'manual',
    entity: 'Manual',
    event: 'assigned',
    label: 'Manually Assigned to Entity',
    description:
      'Fires when a user manually assigns this workflow to an entity.',
    condition_fields: [],
  },
  // Client
  {
    id: 'client.created',
    entity: 'Client',
    event: 'created',
    label: 'When a Client is Created',
    description: 'Fires when a new client record is saved.',
    condition_fields: [
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'country_id', label: 'Country', type: 'string' },
      { key: 'balance', label: 'Balance', type: 'number' },
    ],
  },
  {
    id: 'client.updated',
    entity: 'Client',
    event: 'updated',
    label: 'When a Client is Updated',
    description: 'Fires when any client field is changed.',
    condition_fields: [
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'country_id', label: 'Country', type: 'string' },
      { key: 'balance', label: 'Balance', type: 'number' },
    ],
  },
  // Invoice
  {
    id: 'invoice.created',
    entity: 'Invoice',
    event: 'created',
    label: 'When an Invoice is Created',
    description: 'Fires when a new invoice is created.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
      { key: 'status_id', label: 'Status', type: 'string' },
      { key: 'due_date', label: 'Due date', type: 'date' },
    ],
  },
  {
    id: 'invoice.sent',
    entity: 'Invoice',
    event: 'sent',
    label: 'When an Invoice is Sent',
    description: 'Fires when an invoice is marked as sent to the client.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
      { key: 'status_id', label: 'Status', type: 'string' },
      { key: 'due_date', label: 'Due date', type: 'date' },

    ],
  },
  {
    id: 'invoice.paid',
    entity: 'Invoice',
    event: 'paid',
    label: 'When an Invoice is Paid',
    description: 'Fires when an invoice payment is completed.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
      { key: 'status_id', label: 'Status', type: 'string' },
      { key: 'balance', label: 'Balance', type: 'number' },
    ],
  },
  {
    id: 'invoice.late',
    entity: 'Invoice',
    event: 'late',
    label: 'When an Invoice is Overdue',
    description: 'Fires when an invoice passes its due date without payment.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
      { key: 'due_date', label: 'Due date', type: 'date' },
    ],
  },
  // Quote
  {
    id: 'quote.created',
    entity: 'Quote',
    event: 'created',
    label: 'When a Quote is Created',
    description: 'Fires when a new quote is created.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
      { key: 'valid_until', label: 'Valid until', type: 'date' },
    ],
  },
  {
    id: 'quote.approved',
    entity: 'Quote',
    event: 'approved',
    label: 'When a Quote is Approved',
    description: 'Fires when the client approves a quote.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
    ],
  },
  // Payment
  {
    id: 'payment.created',
    entity: 'Payment',
    event: 'created',
    label: 'When a Payment is Created',
    description: 'Fires when a payment is recorded.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
      { key: 'type_id', label: 'Payment type', type: 'string' },
    ],
  },
  {
    id: 'payment.failed',
    entity: 'Payment',
    event: 'failed',
    label: 'When a Payment Fails',
    description: 'Fires when a payment attempt is declined or fails.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
      { key: 'type_id', label: 'Payment type', type: 'string' },
    ],
  },
  // Expense
  {
    id: 'expense.created',
    entity: 'Expense',
    event: 'created',
    label: 'When an Expense is Created',
    description: 'Fires when a new expense is recorded.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'vendor_id', label: 'Vendor', type: 'string' },
      { key: 'category_id', label: 'Category', type: 'string' },
    ],
  },
  // Task
  {
    id: 'task.created',
    entity: 'Task',
    event: 'created',
    label: 'When a Task is Created',
    description: 'Fires when a new task is created.',
    condition_fields: [
      { key: 'description', label: 'Description', type: 'string' },
      { key: 'project_id', label: 'Project', type: 'string' },
      { key: 'status_id', label: 'Status', type: 'string' },
    ],
  },
  // Product
  {
    id: 'product.created',
    entity: 'Product',
    event: 'created',
    label: 'When a Product is Created',
    description: 'Fires when a new product is added.',
    condition_fields: [
      { key: 'product_key', label: 'Product key', type: 'string' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'quantity', label: 'Quantity', type: 'number' },
    ],
  },
  // Vendor
  {
    id: 'vendor.created',
    entity: 'Vendor',
    event: 'created',
    label: 'When a Vendor is Created',
    description: 'Fires when a new vendor record is saved.',
    condition_fields: [
      { key: 'name', label: 'Name', type: 'string' },
      { key: 'country_id', label: 'Country', type: 'string' },
    ],
  },
  // Purchase Order
  {
    id: 'purchase_order.created',
    entity: 'Purchase Order',
    event: 'created',
    label: 'When a Purchase Order is Created',
    description: 'Fires when a new purchase order is created.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'vendor_id', label: 'Vendor', type: 'string' },
    ],
  },
  // Credit
  {
    id: 'credit.created',
    entity: 'Credit',
    event: 'created',
    label: 'When a Credit is Created',
    description: 'Fires when a new credit note is created.',
    condition_fields: [
      { key: 'amount', label: 'Amount', type: 'number' },
      { key: 'client_id', label: 'Client', type: 'string' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Action metadata – available step types
// ---------------------------------------------------------------------------

export const defaultActionMetadata: WorkflowActionMetadata[] = [
  {
    id: 'send_email',
    name: 'Send Email',
    category: 'Actions',
    type: 'action',
    description: 'Send a templated email.',
    icon: 'mail',
    params_schema: [
      {
        key: 'to',
        label: 'Recipient',
        type: 'select',
        required: true,
        options: [
          { label: 'Client contact', value: 'client_contact' },
          { label: 'Assigned user', value: 'assigned_user' },
          { label: 'Company owner', value: 'company_owner' },
        ],
      },
      { key: 'subject', label: 'Subject', type: 'text', required: true },
      {
        key: 'template',
        label: 'Template',
        type: 'select',
        required: true,
        options: [
          { label: 'Payment received', value: 'payment_received' },
          { label: 'Invoice reminder', value: 'invoice_reminder' },
          { label: 'Quote follow-up', value: 'quote_follow_up' },
          { label: 'Custom', value: 'custom' },
        ],
      },
      {
        key: 'body',
        label: 'Custom body',
        type: 'textarea',
        placeholder: 'Leave empty to use template default',
      },
    ],
  },
  {
    id: 'convert_to_invoice',
    name: 'Convert to Invoice',
    category: 'Actions',
    type: 'action',
    description: 'Create an invoice from a quote or recurring invoice.',
    icon: 'receipt_long',
    produces_entity: {
      variable: '$invoice',
      entity: 'Invoice',
      label: 'Invoice',
    },
    params_schema: [
      {
        key: 'source',
        label: 'Source entity',
        type: 'entity_ref',
        required: true,
      },
      {
        key: 'auto_send',
        label: 'Auto-send',
        type: 'select',
        options: [
          { label: 'Yes', value: 'true' },
          { label: 'No', value: 'false' },
        ],
      },
    ],
  },
  {
    id: 'convert_to_quote',
    name: 'Convert to Quote',
    category: 'Actions',
    type: 'action',
    description: 'Create a quote from a lead or existing entity.',
    icon: 'description',
    produces_entity: {
      variable: '$quote',
      entity: 'Quote',
      label: 'Quote',
    },
    params_schema: [
      {
        key: 'source',
        label: 'Source entity',
        type: 'entity_ref',
        required: true,
      },
      {
        key: 'valid_until_days',
        label: 'Valid for (days)',
        type: 'number',
        placeholder: '30',
      },
    ],
  },
  {
    id: 'assign_user',
    name: 'Assign User',
    category: 'Actions',
    type: 'action',
    description: 'Assign the entity to an internal user.',
    icon: 'person',
    params_schema: [
      {
        key: 'user_id',
        label: 'User',
        type: 'entity_ref',
        required: true,
      },
    ],
  },
  {
    id: 'update_field',
    name: 'Update Field',
    category: 'Actions',
    type: 'action',
    description: 'Change a field value on the triggering entity.',
    icon: 'edit_note',
    params_schema: [
      { key: 'field', label: 'Field name', type: 'text', required: true },
      { key: 'value', label: 'New value', type: 'text', required: true },
    ],
  },
  {
    id: 'create_task',
    name: 'Create Task',
    category: 'Actions',
    type: 'action',
    description: 'Create a follow-up task.',
    icon: 'task',
    params_schema: [
      {
        key: 'description',
        label: 'Task description',
        type: 'text',
        required: true,
      },
      {
        key: 'assignee',
        label: 'Assign to',
        type: 'entity_ref',
      },
      {
        key: 'due_days',
        label: 'Due in (days)',
        type: 'number',
        placeholder: '7',
      },
    ],
  },
  {
    id: 'auto_bill',
    name: 'Auto-Bill',
    category: 'Actions',
    type: 'action',
    description: 'Charge a saved payment method.',
    icon: 'credit_card',
    params_schema: [
      {
        key: 'invoice',
        label: 'Invoice',
        type: 'entity_ref',
        required: true,
      },
    ],
  },
  {
    id: 'notify',
    name: 'Notify',
    category: 'Actions',
    type: 'action',
    description: 'Send an internal notification.',
    icon: 'notifications',
    params_schema: [
      {
        key: 'channel',
        label: 'Channel',
        type: 'select',
        required: true,
        options: [
          { label: 'In-app', value: 'in_app' },
          { label: 'Slack', value: 'slack' },
          { label: 'Email', value: 'email' },
        ],
      },
      {
        key: 'message',
        label: 'Message',
        type: 'textarea',
        required: true,
      },
    ],
  },
  {
    id: 'webhook',
    name: 'Webhook',
    category: 'Actions',
    type: 'action',
    description: 'Call an external HTTP endpoint.',
    icon: 'webhook',
    params_schema: [
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        required: true,
        placeholder: 'https://example.com/webhook',
      },
      {
        key: 'method',
        label: 'HTTP method',
        type: 'select',
        options: [
          { label: 'POST', value: 'POST' },
          { label: 'PUT', value: 'PUT' },
          { label: 'GET', value: 'GET' },
        ],
      },
    ],
  },
  {
    id: 'archive_entity',
    name: 'Archive Entity',
    category: 'Actions',
    type: 'action',
    description: 'Archive the triggering entity.',
    icon: 'archive',
    params_schema: [],
  },
  // Waits
  {
    id: 'wait_for_event',
    name: 'Wait for Event',
    category: 'Waits',
    type: 'wait_event',
    description: 'Pause until a specific event occurs.',
    icon: 'hourglass_top',
    params_schema: [
      {
        key: 'entity',
        label: 'Entity type',
        type: 'select',
        required: true,
        options: [
          { label: 'Invoice', value: 'Invoice' },
          { label: 'Quote', value: 'Quote' },
          { label: 'Payment', value: 'Payment' },
        ],
      },
      {
        key: 'event',
        label: 'Event',
        type: 'select',
        required: true,
        options: [
          { label: 'Paid', value: 'paid' },
          { label: 'Approved', value: 'approved' },
          { label: 'Sent', value: 'sent' },
          { label: 'Created', value: 'created' },
        ],
      },
      {
        key: 'timeout_days',
        label: 'Timeout (days)',
        type: 'number',
        placeholder: '30',
      },
    ],
  },
  {
    id: 'wait_delay',
    name: 'Wait / Delay',
    category: 'Waits',
    type: 'wait_delay',
    description: 'Wait until a date relative to an entity property.',
    icon: 'schedule',
    params_schema: [
      {
        key: 'date_field',
        label: 'Date Field',
        type: 'date_field',
        required: true,
      },
      {
        key: 'offset_operator',
        label: 'When',
        type: 'select',
        required: true,
        options: [
          { label: 'On', value: 'on' },
          { label: 'Before', value: 'before' },
          { label: 'After', value: 'after' },
        ],
      },
      {
        key: 'offset_days',
        label: 'Offset (days)',
        type: 'number',
        placeholder: '0',
      },
    ],
  },
  // Flow control
  {
    id: 'branch',
    name: 'True / False',
    category: 'Flow',
    type: 'branch',
    description: 'Evaluate a condition and continue or stop.',
    icon: 'call_split',
    params_schema: [
      {
        key: 'field',
        label: 'Field',
        type: 'entity_field',
        required: true,
      },
      {
        key: 'operator',
        label: 'Operator',
        type: 'operator',
        required: true,
      },
      {
        key: 'value',
        label: 'Value',
        type: 'text',
        placeholder: 'Comparison value',
      },
    ],
  },
  {
    id: 'end',
    name: 'End Workflow',
    category: 'Flow',
    type: 'end',
    description: 'Terminate a workflow path.',
    icon: 'flag',
    params_schema: [
      {
        key: 'result',
        label: 'Outcome',
        type: 'select',
        required: true,
        options: [
          { label: 'Completed', value: 'completed' },
          { label: 'Lost / Cancelled', value: 'lost' },
        ],
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper – build edges from source/target pairs
// ---------------------------------------------------------------------------

function edges(values: Array<[string, string]>): Edge[] {
  return values.map(([source, target], index) => ({
    id: `edge-${index + 1}`,
    source,
    target,
    type: 'workflow',
  }));
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const defaultWorkflowTemplates: WorkflowTemplate[] = [
  {
    id: 'quote-to-payment',
    name: 'Quote to Payment',
    icon: 'sell',
    category: 'Sales',
    summary: 'Quote Approved -> Invoice -> Wait for Payment -> Done',
    trigger_description: 'When a Quote is Approved',
    step_count: 5,
    workflow: {
      id: 'template-quote-to-payment',
      name: 'Quote to Payment',
      status: 'draft',
      trigger: {
        entity: 'Quote',
        event: 'approved',
        description: 'When a Quote is Approved',
        conditions: [],
        match: 'and',
      },
      steps: [
        {
          id: 'trigger',
          kind: 'trigger',
          name: 'Quote Approved',
          config: {},
        },
        {
          id: 'create-invoice',
          kind: 'action',
          action_id: 'convert_to_invoice',
          name: 'Create Invoice',
          config: { source: '$trigger' },
        },
        {
          id: 'notify-client',
          kind: 'action',
          action_id: 'send_email',
          name: 'Send Invoice Email',
          config: {
            to: 'client_contact',
            subject: 'Your invoice is ready',
            template: 'invoice_reminder',
          },
        },
        {
          id: 'wait-payment',
          kind: 'wait_event',
          action_id: 'wait_for_event',
          name: 'Wait for Payment',
          config: {
            entity: 'Invoice',
            event: 'paid',
            timeout_days: '30',
          },
        },
        {
          id: 'done',
          kind: 'end',
          action_id: 'end',
          name: 'Completed',
          config: { result: 'completed' },
        },
      ],
      edges: edges([
        ['trigger', 'create-invoice'],
        ['create-invoice', 'notify-client'],
        ['notify-client', 'wait-payment'],
        ['wait-payment', 'done'],
      ]),
      runs_count: 0,
    },
  },
  {
    id: 'auto-collect-invoice',
    name: 'Auto-Collect Invoice',
    icon: 'payments',
    category: 'Billing',
    summary: 'Invoice Created -> Wait 3 Days -> Auto-Bill -> Notify',
    trigger_description: 'When an Invoice is Created',
    step_count: 5,
    workflow: {
      id: 'template-auto-collect-invoice',
      name: 'Auto-Collect Invoice',
      status: 'draft',
      trigger: {
        entity: 'Invoice',
        event: 'created',
        description: 'When an Invoice is Created',
        conditions: [],
        match: 'and',
      },
      steps: [
        {
          id: 'trigger',
          kind: 'trigger',
          name: 'Invoice Created',
          config: {},
        },
        {
          id: 'delay',
          kind: 'wait_delay',
          action_id: 'wait_delay',
          name: 'Wait 3 Days',
          config: { date_field: '$trigger.created_at', offset_operator: 'after', offset_days: '3' },
        },
        {
          id: 'bill',
          kind: 'action',
          action_id: 'auto_bill',
          name: 'Charge Card',
          config: { invoice: '$trigger' },
        },
        {
          id: 'notify-owner',
          kind: 'action',
          action_id: 'notify',
          name: 'Notify Owner',
          config: { channel: 'in_app', message: 'Auto-billing completed.' },
        },
        {
          id: 'end',
          kind: 'end',
          action_id: 'end',
          name: 'Completed',
          config: { result: 'completed' },
        },
      ],
      edges: edges([
        ['trigger', 'delay'],
        ['delay', 'bill'],
        ['bill', 'notify-owner'],
        ['notify-owner', 'end'],
      ]),
      runs_count: 0,
    },
  },
  {
    id: 'new-client-onboarding',
    name: 'New Client Onboarding',
    icon: 'group_add',
    category: 'Onboarding',
    summary: 'Client Created -> Welcome Email -> Create Task -> Done',
    trigger_description: 'When a Client is Created',
    step_count: 4,
    workflow: {
      id: 'template-new-client-onboarding',
      name: 'New Client Onboarding',
      status: 'draft',
      trigger: {
        entity: 'Client',
        event: 'created',
        description: 'When a Client is Created',
        conditions: [],
        match: 'and',
      },
      steps: [
        {
          id: 'trigger',
          kind: 'trigger',
          name: 'Client Created',
          config: {},
        },
        {
          id: 'welcome-email',
          kind: 'action',
          action_id: 'send_email',
          name: 'Send Welcome Email',
          config: {
            to: 'client_contact',
            subject: 'Welcome!',
            template: 'custom',
            body: 'Welcome to our service. We look forward to working with you.',
          },
        },
        {
          id: 'onboard-task',
          kind: 'action',
          action_id: 'create_task',
          name: 'Create Onboarding Task',
          config: {
            description: 'Complete onboarding for new client',
            due_days: '7',
          },
        },
        {
          id: 'done',
          kind: 'end',
          action_id: 'end',
          name: 'Completed',
          config: { result: 'completed' },
        },
      ],
      edges: edges([
        ['trigger', 'welcome-email'],
        ['welcome-email', 'onboard-task'],
        ['onboard-task', 'done'],
      ]),
      runs_count: 0,
    },
  },
  {
    id: 'overdue-invoice-followup',
    name: 'Overdue Invoice Follow-up',
    icon: 'warning',
    category: 'Operations',
    summary: 'Invoice Overdue -> Notify Owner -> Wait -> Archive',
    trigger_description: 'When an Invoice is Overdue',
    step_count: 5,
    workflow: {
      id: 'template-overdue-invoice-followup',
      name: 'Overdue Invoice Follow-up',
      status: 'draft',
      trigger: {
        entity: 'Invoice',
        event: 'late',
        description: 'When an Invoice is Overdue',
        conditions: [],
        match: 'and',
      },
      steps: [
        {
          id: 'trigger',
          kind: 'trigger',
          name: 'Invoice Overdue',
          config: {},
        },
        {
          id: 'reminder',
          kind: 'action',
          action_id: 'send_email',
          name: 'Send Reminder',
          config: {
            to: 'client_contact',
            subject: 'Payment reminder',
            template: 'invoice_reminder',
          },
        },
        {
          id: 'notify-team',
          kind: 'action',
          action_id: 'notify',
          name: 'Notify Account Owner',
          config: {
            channel: 'email',
            message: 'Invoice is overdue — follow up required.',
          },
        },
        {
          id: 'wait-7d',
          kind: 'wait_delay',
          action_id: 'wait_delay',
          name: 'Wait 7 Days',
          config: { date_field: '$trigger.due_date', offset_operator: 'after', offset_days: '7' },
        },
        {
          id: 'done',
          kind: 'end',
          action_id: 'end',
          name: 'Completed',
          config: { result: 'completed' },
        },
      ],
      edges: edges([
        ['trigger', 'reminder'],
        ['reminder', 'notify-team'],
        ['notify-team', 'wait-7d'],
        ['wait-7d', 'done'],
      ]),
      runs_count: 0,
    },
  },
];

export const defaultWorkflows: WorkflowDefinition[] =
  defaultWorkflowTemplates.map((template, index) => ({
    ...template.workflow,
    id: `workflow-${index + 1}`,
    status: index === 0 ? 'active' : 'draft',
    runs_count: index === 0 ? 42 : 17,
  }));
