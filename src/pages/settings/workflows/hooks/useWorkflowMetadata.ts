import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import {
  WorkflowActionMetadata,
  WorkflowTriggerMetadata,
} from '../types/workflow';
import {
  defaultActionMetadata,
  defaultTriggerMetadata,
} from '../helpers/workflowTemplates';

export function useWorkflowMetadata() {
  const triggers = useQuery<WorkflowTriggerMetadata[]>(
    ['/api/v1/workflows/metadata/triggers'],
    () =>
      request(
        'GET',
        endpoint('/api/v1/workflows/metadata/triggers'),
        undefined,
        { skipIntercept: true }
      )
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;

          if (Array.isArray(data) && data.length > 0) {
            return data as WorkflowTriggerMetadata[];
          }

          return defaultTriggerMetadata;
        })
        .catch(() => defaultTriggerMetadata),
    {
      staleTime: 5 * 60 * 1000,
      placeholderData: defaultTriggerMetadata,
    }
  );

  const actions = useQuery<WorkflowActionMetadata[]>(
    ['/api/v1/workflows/metadata/actions'],
    () =>
      request(
        'GET',
        endpoint('/api/v1/workflows/metadata/actions'),
        undefined,
        { skipIntercept: true }
      )
        .then((response: { data?: { data?: unknown } }) => {
          const data = response.data?.data;

          if (Array.isArray(data) && data.length > 0) {
            return (data as WorkflowActionMetadata[]).map((action) => ({
              ...action,
              params_schema: Array.isArray(action.params_schema)
                ? action.params_schema
                : [],
            }));
          }

          return defaultActionMetadata;
        })
        .catch(() => defaultActionMetadata),
    {
      staleTime: 5 * 60 * 1000,
      placeholderData: defaultActionMetadata,
    }
  );

  return {
    triggers: triggers.data ?? defaultTriggerMetadata,
    actions: actions.data ?? defaultActionMetadata,
    isLoading: false,
  };
}
