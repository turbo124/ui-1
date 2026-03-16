import {
  addEdge,
  Connection,
  Edge,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buildWaitDelaySubtitle, normalizeEdges, stepToNodes } from '../helpers/stepToNode';
import { validateWorkflow } from '../helpers/validateWorkflow';
import {
  BuilderNode,
  WorkflowActionMetadata,
  WorkflowDateField,
  WorkflowDefinition,
  WorkflowStep,
} from '../types/workflow';

export function useWorkflowBuilder(
  initialWorkflow: WorkflowDefinition,
  actions: WorkflowActionMetadata[],
  dateFields?: WorkflowDateField[]
) {
  const [nodes, setNodes] = useState<BuilderNode[]>(() =>
    stepToNodes(initialWorkflow, actions)
  );
  const [edges, setEdges] = useState<Edge[]>(() =>
    normalizeEdges(initialWorkflow.edges)
  );
  const [steps, setSteps] = useState<WorkflowStep[]>(initialWorkflow.steps ?? []);
  const [trigger, setTrigger] = useState(initialWorkflow.trigger);
  const [name, setName] = useState(initialWorkflow.name);
  const [description, setDescription] = useState(
    initialWorkflow.description ?? ''
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    (initialWorkflow.steps ?? []).find((s) => s.kind === 'trigger')?.id || 'trigger'
  );

  // Track the workflow id we've synced so we can re-init when API data arrives
  const syncedIdRef = useRef(initialWorkflow.id);

  useEffect(() => {
    if (initialWorkflow.id !== syncedIdRef.current) {
      syncedIdRef.current = initialWorkflow.id;
      setNodes(stepToNodes(initialWorkflow, actions));
      setEdges(normalizeEdges(initialWorkflow.edges));
      setSteps(initialWorkflow.steps ?? []);
      setTrigger(initialWorkflow.trigger);
      setName(initialWorkflow.name);
      setDescription(initialWorkflow.description ?? '');
      setSelectedNodeId(
        (initialWorkflow.steps ?? []).find((s) => s.kind === 'trigger')?.id ||
          'trigger'
      );
    }
  }, [initialWorkflow]);

  // Build the current workflow definition from the unified state
  const workflow = useMemo<WorkflowDefinition>(
    () => ({
      id: initialWorkflow.id,
      status: initialWorkflow.status,
      archived_at: initialWorkflow.archived_at,
      is_deleted: initialWorkflow.is_deleted,
      runs_count: initialWorkflow.runs_count,
      last_run_at: initialWorkflow.last_run_at,
      name,
      description,
      trigger,
      steps,
      edges,
    }),
    [initialWorkflow, name, description, trigger, steps, edges]
  );

  const issues = useMemo(
    () => validateWorkflow(workflow, nodes, actions),
    [actions, workflow, nodes]
  );

  const invalidNodeIds = useMemo(
    () =>
      new Set(
        issues
          .filter((issue) => issue.nodeId)
          .map((issue) => issue.nodeId as string)
      ),
    [issues]
  );

  const presentNodes = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: invalidNodeIds.has(node.id)
            ? ('invalid' as const)
            : ('valid' as const),
        },
      })),
    [invalidNodeIds, nodes]
  );

  const updateStep = useCallback((updated: WorkflowStep) => {
    setSteps((current) =>
      current.map((s) => (s.id === updated.id ? updated : s))
    );

    // Sync all visual node data so canvas reflects any config changes
    setNodes((current) =>
      current.map((n) => {
        if (n.id !== updated.id) return n;

        const subtitle =
          updated.kind === 'wait_delay'
            ? buildWaitDelaySubtitle(updated.config ?? {}, dateFields)
            : n.data.subtitle;

        return {
          ...n,
          data: {
            ...n.data,
            label: updated.name,
            subtitle,
          },
        };
      })
    );
  }, [dateFields]);

  const addStep = useCallback(
    (
      action: WorkflowActionMetadata,
      position: { x: number; y: number },
      options?: { parentId?: string }
    ) => {
      const newId = `${action.id}-${Date.now()}`;

      const newNode: BuilderNode = {
        id: newId,
        type: action.type,
        position,
        data: {
          label: action.name,
          subtitle: action.description,
          kind: action.type,
          color:
            action.type === 'action'
              ? '#10B981'
              : action.type === 'branch'
                ? '#8B5CF6'
                : action.type === 'end'
                  ? '#6B7280'
                  : '#F59E0B',
          icon: action.icon,
          status: 'valid',
        },
      };

      setNodes((current) => [...current, newNode]);

      if (options?.parentId) {
        // If parent is a branch node, use the "true" handle for the linear chain
        const parentStep = steps.find((s) => s.id === options.parentId);
        const sourceHandle = parentStep?.kind === 'branch' ? 'true' : undefined;

        const newEdge: Edge = {
          id: `${options.parentId}-${newId}-${Date.now()}`,
          source: options.parentId,
          sourceHandle,
          target: newId,
          type: 'workflow',
        };
        setEdges((current) => [...current, newEdge]);
      }

      const newStep: WorkflowStep = {
        id: newId,
        kind: action.type,
        action_id: action.id,
        name: action.name,
        config: {},
      };

      setSteps((current) => [...current, newStep]);
      setSelectedNodeId(newId);

      return newId;
    },
    []
  );

  const insertStepOnEdge = useCallback(
    (
      edgeId: string,
      action: WorkflowActionMetadata
    ) => {
      const edge = edges.find((e) => e.id === edgeId);
      if (!edge) return;

      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (!sourceNode || !targetNode) return;

      const newId = `${action.id}-${Date.now()}`;
      const position = {
        x: (sourceNode.position.x + targetNode.position.x) / 2,
        y: (sourceNode.position.y + targetNode.position.y) / 2,
      };

      const newNode: BuilderNode = {
        id: newId,
        type: action.type,
        position,
        data: {
          label: action.name,
          subtitle: action.description,
          kind: action.type,
          color:
            action.type === 'action'
              ? '#10B981'
              : action.type === 'branch'
                ? '#8B5CF6'
                : action.type === 'end'
                  ? '#6B7280'
                  : '#F59E0B',
          icon: action.icon,
          status: 'valid',
        },
      };

      setNodes((current) => [...current, newNode]);

      setEdges((current) => [
        ...current.filter((e) => e.id !== edgeId),
        {
          id: `${edge.source}-${newId}-${Date.now()}`,
          source: edge.source,
          sourceHandle: edge.sourceHandle,
          target: newId,
          type: 'workflow',
        },
        {
          id: `${newId}-${edge.target}-${Date.now()}`,
          source: newId,
          target: edge.target,
          type: 'workflow',
        },
      ]);

      const newStep: WorkflowStep = {
        id: newId,
        kind: action.type,
        action_id: action.id,
        name: action.name,
        config: {},
      };

      setSteps((current) => [...current, newStep]);
      setSelectedNodeId(newId);
    },
    [edges, nodes]
  );

  const removeStep = useCallback(
    (stepId: string) => {
      const step = steps.find((s) => s.id === stepId);
      if (!step || step.kind === 'trigger') return;

      // Find parent and children so we can reconnect them
      const incomingEdges = edges.filter((e) => e.target === stepId);
      const outgoingEdges = edges.filter((e) => e.source === stepId);

      setNodes((current) => current.filter((n) => n.id !== stepId));

      setEdges((current) => {
        // Remove all edges connected to this step
        const remaining = current.filter(
          (e) => e.source !== stepId && e.target !== stepId
        );

        // Reconnect: for each parent→step edge, create parent→child edges
        // Skip GOTO (false handle) edges — don't reconnect those
        const reconnected: Edge[] = [];
        const linearIncoming = incomingEdges.filter((e) => e.sourceHandle !== 'false');
        const linearOutgoing = outgoingEdges.filter((e) => e.sourceHandle !== 'false');
        for (const incoming of linearIncoming) {
          for (const outgoing of linearOutgoing) {
            reconnected.push({
              id: `${incoming.source}-${outgoing.target}-${Date.now()}`,
              source: incoming.source,
              sourceHandle: incoming.sourceHandle,
              target: outgoing.target,
              type: 'workflow',
            });
          }
        }

        return [...remaining, ...reconnected];
      });

      setSteps((current) =>
        current
          .filter((s) => s.id !== stepId)
          // Clear goto_step from any branch that pointed to the removed step
          .map((s) =>
            s.kind === 'branch' && s.config?.goto_step === stepId
              ? { ...s, config: { ...s.config, goto_step: '' } }
              : s
          )
      );
      setSelectedNodeId('trigger');
    },
    [steps, edges]
  );

  const moveStep = useCallback(
    (stepId: string, direction: 'up' | 'down') => {
      // Only consider linear (non-GOTO) edges for movement
      const linearEdges = edges.filter((e) => e.sourceHandle !== 'false');

      const incomingEdge = linearEdges.find((e) => e.target === stepId);
      const outgoingEdge = linearEdges.find((e) => e.source === stepId);

      if (direction === 'up' && incomingEdge) {
        const parentId = incomingEdge.source;
        const parentStep = steps.find((s) => s.id === parentId);
        if (!parentStep || parentStep.kind === 'trigger') return;

        const parentIncoming = linearEdges.find((e) => e.target === parentId);
        if (!parentIncoming) return;

        // Swap positions on canvas
        setNodes((current) => {
          const stepNode = current.find((n) => n.id === stepId);
          const parentNode = current.find((n) => n.id === parentId);
          if (!stepNode || !parentNode) return current;

          return current.map((n) => {
            if (n.id === stepId) return { ...n, position: parentNode.position };
            if (n.id === parentId) return { ...n, position: stepNode.position };
            return n;
          });
        });

        // Rewire linear edges: grandparent→parent→step→child becomes grandparent→step→parent→child
        // Preserve sourceHandle for branch true handles
        setEdges((current) =>
          current.map((e) => {
            // Skip GOTO edges — leave them untouched
            if (e.sourceHandle === 'false') return e;

            if (e.target === parentId && e.source === parentIncoming.source) {
              return { ...e, sourceHandle: parentIncoming.sourceHandle, target: stepId };
            }
            if (e.source === parentId && e.target === stepId) {
              // The step that was the parent now becomes the child
              // The step being moved up becomes the new source
              const stepKind = steps.find((s) => s.id === stepId)?.kind;
              return { ...e, source: stepId, sourceHandle: stepKind === 'branch' ? 'true' : undefined, target: parentId };
            }
            if (e.source === stepId && e.target !== parentId) {
              const parentKind = parentStep.kind;
              return { ...e, source: parentId, sourceHandle: parentKind === 'branch' ? 'true' : undefined };
            }
            return e;
          })
        );

        // Also swap order in the steps array so buildEdgesFromSteps works on reload
        setSteps((current) => {
          const arr = [...current];
          const pi = arr.findIndex((s) => s.id === parentId);
          const si = arr.findIndex((s) => s.id === stepId);
          if (pi >= 0 && si >= 0) {
            [arr[pi], arr[si]] = [arr[si], arr[pi]];
          }
          return arr;
        });
      }

      if (direction === 'down' && outgoingEdge) {
        const childId = outgoingEdge.target;
        const childStep = steps.find((s) => s.id === childId);
        if (!childStep || childStep.kind === 'end') return;

        const childOutgoing = linearEdges.find((e) => e.source === childId);

        // Swap positions on canvas
        setNodes((current) => {
          const stepNode = current.find((n) => n.id === stepId);
          const childNode = current.find((n) => n.id === childId);
          if (!stepNode || !childNode) return current;

          return current.map((n) => {
            if (n.id === stepId) return { ...n, position: childNode.position };
            if (n.id === childId) return { ...n, position: stepNode.position };
            return n;
          });
        });

        // Rewire linear edges: parent→step→child→grandchild becomes parent→child→step→grandchild
        setEdges((current) =>
          current.map((e) => {
            if (e.sourceHandle === 'false') return e;

            if (e.target === stepId && e.source !== childId) {
              return { ...e, target: childId };
            }
            if (e.source === stepId && e.target === childId) {
              const childKind = childStep.kind;
              return { ...e, source: childId, sourceHandle: childKind === 'branch' ? 'true' : undefined, target: stepId };
            }
            if (e.source === childId && childOutgoing && e.id === childOutgoing.id) {
              const stepKind = steps.find((s) => s.id === stepId)?.kind;
              return { ...e, source: stepId, sourceHandle: stepKind === 'branch' ? 'true' : undefined };
            }
            return e;
          })
        );

        // Also swap order in the steps array
        setSteps((current) => {
          const arr = [...current];
          const si = arr.findIndex((s) => s.id === stepId);
          const ci = arr.findIndex((s) => s.id === childId);
          if (si >= 0 && ci >= 0) {
            [arr[si], arr[ci]] = [arr[ci], arr[si]];
          }
          return arr;
        });
      }
    },
    [edges, steps]
  );

  return {
    nodes: presentNodes,
    edges,
    steps,
    selectedNodeId,
    selectedStep: steps.find((s) => s.id === selectedNodeId),
    issues,
    workflow,
    name,
    description,
    trigger,

    setSelectedNodeId,
    setNodes,
    setEdges,
    setName,
    setDescription,
    setTrigger: (updated: WorkflowDefinition['trigger']) => {
      setTrigger(updated);

      // Build a label from entity + event
      const label =
        updated.entity && updated.event
          ? `${updated.entity} ${updated.event.replace(/_/g, ' ')}`
          : updated.entity || 'Trigger';

      // Update the trigger node label on the canvas
      const triggerStep = steps.find((s) => s.kind === 'trigger');
      if (triggerStep) {
        setNodes((current) =>
          current.map((n) =>
            n.id === triggerStep.id
              ? {
                  ...n,
                  data: { ...n.data, label, subtitle: updated.description || 'Trigger' },
                }
              : n
          )
        );
        setSteps((current) =>
          current.map((s) =>
            s.id === triggerStep.id ? { ...s, name: label } : s
          )
        );
      }
    },
    updateStep,
    addStep,
    insertStepOnEdge,
    removeStep,
    moveStep,

    onNodesChange: (changes: NodeChange[]) =>
      setNodes((current) =>
        applyNodeChanges(changes as any, current as any) as BuilderNode[]
      ),
    onEdgesChange: (changes: EdgeChange[]) => {
      // Before applying, check if any false/GOTO edges are being removed
      const removals = changes.filter((c) => c.type === 'remove');
      if (removals.length > 0) {
        setEdges((current) => {
          for (const removal of removals) {
            const edge = current.find((e) => e.id === (removal as any).id);
            if (edge?.sourceHandle === 'false') {
              setSteps((prev) =>
                prev.map((s) =>
                  s.id === edge.source
                    ? { ...s, config: { ...s.config, goto_step: '' } }
                    : s
                )
              );
            }
          }
          return applyEdgeChanges(changes, current);
        });
      } else {
        setEdges((current) => applyEdgeChanges(changes, current));
      }
    },
    onConnect: (connection: Connection) => {
      setEdges((current) =>
        addEdge({ ...connection, type: 'workflow' }, current)
      );

      // When connecting from a branch "false" handle, persist the GOTO target
      if (connection.sourceHandle === 'false' && connection.source && connection.target) {
        const targetId = connection.target;
        setSteps((current) =>
          current.map((s) =>
            s.id === connection.source
              ? { ...s, config: { ...s.config, goto_step: targetId } }
              : s
          )
        );
      }
    },
  };
}
