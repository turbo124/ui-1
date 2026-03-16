import { endpoint } from '$app/common/helpers';
import { request } from '$app/common/helpers/request';
import { useQuery } from 'react-query';
import { WorkflowRun } from '../types/workflow';

const fallbackRuns: WorkflowRun[] = [];

interface WorkflowRunsParams {
  activeOnly?: boolean;
  entityType?: string;
  entityId?: string;
  workflowId?: string;
  status?: string;
}

export function useWorkflowRuns(params?: WorkflowRunsParams) {
  const queryParams = new URLSearchParams();

  if (params?.entityType) {
    queryParams.set('entity_type', params.entityType);
  }

  if (params?.entityId) {
    queryParams.set('entity_id', params.entityId);
  }

  if (params?.workflowId) {
    queryParams.set('workflow_id', params.workflowId);
  }

  if (params?.status && params.status !== 'all') {
    queryParams.set('status', params.status);
  }

  const qs = queryParams.toString();
  const url = `/api/v1/workflow_runs${qs ? `?${qs}` : ''}`;

  return useQuery<WorkflowRun[]>(
    ['/api/v1/workflow_runs', params],
    () =>
      request('GET', endpoint(url), undefined, {
        skipIntercept: true,
      })
        .then((response: { data?: { data?: WorkflowRun[] } }) =>
          Array.isArray(response.data?.data)
            ? response.data!.data!
            : fallbackRuns
        )
        .catch(() => fallbackRuns),
    {
      refetchInterval:
        params?.activeOnly ||
        params?.status === 'active' ||
        params?.status === 'waiting'
          ? 10_000
          : false,
      staleTime: 5_000,
    }
  );
}
