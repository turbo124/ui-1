import { Guard } from '$app/common/guards/Guard';
import { admin, owner } from '$app/common/guards/guards/admin';
import { or } from '$app/common/guards/guards/or';
import { Route } from 'react-router-dom';
import { lazy } from 'react';

const WorkflowList = lazy(
  () => import('$app/pages/settings/workflows/pages/WorkflowList')
);
const WorkflowTemplates = lazy(
  () => import('$app/pages/settings/workflows/pages/WorkflowTemplates')
);
const WorkflowBuilder = lazy(
  () => import('$app/pages/settings/workflows/pages/WorkflowBuilder')
);
const WorkflowDetail = lazy(
  () => import('$app/pages/settings/workflows/pages/WorkflowDetail')
);
const WorkflowRunList = lazy(
  () => import('$app/pages/settings/workflows/pages/WorkflowRunList')
);
const WorkflowRunDetail = lazy(
  () => import('$app/pages/settings/workflows/pages/WorkflowRunDetail')
);

export const workflowRoutes = (
  <>
    <Route path="/workflows">
      <Route
        path=""
        element={
          <Guard
            guards={[or(admin(), owner())]}
            component={<WorkflowList />}
          />
        }
      />
      <Route
        path="templates"
        element={
          <Guard
            guards={[or(admin(), owner())]}
            component={<WorkflowTemplates />}
          />
        }
      />
      <Route
        path="create"
        element={
          <Guard
            guards={[or(admin(), owner())]}
            component={<WorkflowBuilder />}
          />
        }
      />
      <Route
        path=":id"
        element={
          <Guard
            guards={[or(admin(), owner())]}
            component={<WorkflowDetail />}
          />
        }
      />
      <Route
        path=":id/edit"
        element={
          <Guard
            guards={[or(admin(), owner())]}
            component={<WorkflowBuilder />}
          />
        }
      />
    </Route>
    <Route path="/workflow_runs">
      <Route
        path=""
        element={
          <Guard
            guards={[or(admin(), owner())]}
            component={<WorkflowRunList />}
          />
        }
      />
      <Route
        path=":id"
        element={
          <Guard
            guards={[or(admin(), owner())]}
            component={<WorkflowRunDetail />}
          />
        }
      />
    </Route>
  </>
);
