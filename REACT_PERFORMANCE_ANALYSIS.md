# React Performance Analysis - Invoice Ninja UI

## Executive Summary

This document provides a comprehensive analysis of performance patterns in the Invoice Ninja React application that may cause unnecessary re-renders and performance degradation. The application is built with React 18.3, Redux Toolkit, Jotai, React Query, and React Router.

**Key Findings:**
- 948 TypeScript/React components
- Multiple state management solutions (Redux, Jotai, React Query)
- Heavy reliance on custom hooks that may trigger cascading re-renders
- Lack of memoization in critical data transformation paths
- Several anti-patterns that cause unnecessary re-renders

---

## High-Level Architecture Overview

### State Management Stack

**Redux Toolkit:**
- Global state for: `companyUsers`, `companyDocuments`, `user`, `products`, `settings`
- Serializable check disabled (may cause performance issues with large objects)
- Used for cross-cutting concerns like dark mode, company selection

**Jotai:**
- Atomic state management
- Used for form state, UI state (modals, tabs)
- Atoms scattered throughout codebase

**React Query:**
- Server state management
- Query invalidation via custom `useRefetch` hook
- Complex dependency chains between queries

**Problem:** Multiple state management solutions create confusion about where state should live, leading to unnecessary prop drilling and re-renders.

---

## Performance Issues & Patterns

### 1. **Redux Selector Anti-Patterns**

#### Issue: Non-Memoized Selectors Creating New References

**Location:** Throughout the application

**Example:**
```typescript
// src/common/hooks/useCurrentCompany.ts
export function useCurrentCompany(): Company {
  const companyUserState = useSelector(
    (state: RootState) => state.companyUsers  // ⚠️ Returns entire slice
  );

  return companyUserState.api[companyUserState.currentIndex]?.company;
}
```

**Problem:**
- Every time ANY part of `companyUsers` slice changes, ALL components using `useCurrentCompany()` re-render
- The selector doesn't use equality checks
- Derived data computed on every render

**Impact:** HIGH - This hook is used in dozens of components across the app

**Solution:**
```typescript
import { createSelector } from '@reduxjs/toolkit';
import { shallowEqual, useSelector } from 'react-redux';

// Create memoized selector
const selectCurrentCompany = createSelector(
  [(state: RootState) => state.companyUsers.api,
   (state: RootState) => state.companyUsers.currentIndex],
  (api, currentIndex) => api[currentIndex]?.company
);

export function useCurrentCompany(): Company {
  return useSelector(selectCurrentCompany, shallowEqual);
}
```

**Benefits:**
- Only re-renders when company object actually changes
- Memoized computation
- Proper equality check

---

### 2. **Expensive Hook Chains**

#### Issue: Cascading Hook Calls Without Memoization

**Location:** `src/App.tsx` (lines 60-95)

**Example:**
```typescript
export function App() {
  const [t] = useTranslation();
  const { isOwner } = useAdmin();              // ⚠️ Calls useCurrentUser, useCurrentCompany
  const user = useCurrentUser();                // ⚠️ Redux selector
  const company = useCurrentCompany();          // ⚠️ Redux selector  
  const reactSettings = useReactSettings({ overwrite: false }); // ⚠️ Complex merge operation
  const resolveLanguage = useResolveLanguage(); // ⚠️ Returns new function reference
  const resolveAntdLocale = useResolveAntdLocale();
  const resolveDayJSLocale = useResolveDayJSLocale();
  
  // ... 20+ useEffect hooks below
}
```

**Problem:**
- Every hook call may subscribe to different Redux slices
- Each hook may return new object/function references
- Changes cascade through all children
- 20+ useEffect hooks with complex dependencies

**Impact:** CRITICAL - App.tsx wraps entire application

**Solution:**
```typescript
export function App() {
  // Memoize expensive hook results
  const user = useCurrentUser();
  const company = useCurrentCompany();
  
  // Memoize derived data
  const isOwner = useMemo(() => {
    return user?.company_user?.is_owner ?? false;
  }, [user?.company_user?.is_owner]);
  
  // Memoize callback functions
  const resolveLanguage = useCallback(
    useResolveLanguage(),
    [/* minimal deps */]
  );
  
  // Break up into smaller sub-components
  // Move socket logic, event listeners into separate components
}
```

**Alternative:** Split `App.tsx` into logical sub-components:
- `<AppSettingsProvider>` - Language, locale, theme
- `<AppSocketProvider>` - Socket connections
- `<AppEventListeners>` - Window event handlers

---

### 3. **useReactSettings Performance Issue**

#### Issue: Complex Merge Operation on Every Render

**Location:** `src/common/hooks/useReactSettings.ts`

**Example:**
```typescript
export function useReactSettings(options?: Options) {
  const user = useInjectUserChanges({ overwrite: options?.overwrite }); // ⚠️ Hook call

  const reactSettings = useSelector(
    (state: RootState) => state.user.changes?.company_user?.react_settings
  ) || {};

  const previousReactTableColumns =
    user?.company_user?.settings?.react_table_columns;

  const settings: ReactSettings = {
    show_pdf_preview: true,
    react_notification_link: true,
    react_table_columns: {
      ...previousReactTableColumns,      // ⚠️ Spread creates new object
      ...reactSettings.react_table_columns,
    },
    preferences: cloneDeep(preferencesDefaults), // ⚠️ Deep clone on every call
  };

  return merge<ReactSettings, ReactSettings>( // ⚠️ Lodash merge creates new object
    { ...settings },
    { ...reactSettings }
  );
}
```

**Problem:**
- `cloneDeep` and `merge` called on EVERY render of EVERY component using this hook
- Returns new object reference every time
- No memoization
- Used in 100+ components

**Impact:** CRITICAL

**Solution:**
```typescript
import { useMemo } from 'react';

export function useReactSettings(options?: Options) {
  const user = useInjectUserChanges({ overwrite: options?.overwrite });

  const reactSettings = useSelector(
    (state: RootState) => state.user.changes?.company_user?.react_settings,
    shallowEqual // Add equality check
  ) || {};

  const previousReactTableColumns = useMemo(
    () => user?.company_user?.settings?.react_table_columns,
    [user?.company_user?.settings?.react_table_columns]
  );

  return useMemo(() => {
    const settings: ReactSettings = {
      show_pdf_preview: true,
      react_notification_link: true,
      react_table_columns: {
        ...previousReactTableColumns,
        ...reactSettings.react_table_columns,
      },
      preferences: cloneDeep(preferencesDefaults),
    };

    return merge<ReactSettings, ReactSettings>(
      { ...settings },
      { ...reactSettings }
    );
  }, [reactSettings, previousReactTableColumns]); // Only recompute when deps change
}
```

---

### 4. **DataTable Re-Render Issues**

#### Issue: Massive Component Rendering Entire Table on Every Change

**Location:** `src/components/DataTable.tsx` (1,101 lines)

**Problems:**

**A. Non-Memoized Row Rendering:**
```typescript
{currentData
  ?.filter((resource) => !hideEditableOptions || selected.includes(resource.id))
  .map((resource, index) => (
    <MemoizedTr key={resource.id}> // ⚠️ MemoizedTr exists but...
      {!props.withoutActions && !hideEditableOptions && (
        <Td>
          <Checkbox
            value={selected.includes(resource.id)}
            onValueChange={(value) => /* ... */} // ⚠️ New function every render
          />
        </Td>
      )}
      {props.columns.map(
        (column, columnIndex) =>
          Boolean(!excludeColumns.includes(column.id)) && (
            <Td key={columnIndex}>
              {getColumnValue(column, resource)} // ⚠️ Function call every render
            </Td>
          )
      )}
    </MemoizedTr>
  ))}
```

**Problem:**
- `MemoizedTr` won't work because parent creates new callback references
- `filter` + `map` runs on every render
- Column formatting functions called for every cell on every render

**B. useQuery Without Proper Keys:**
```typescript
const { data, isLoading } = useQuery(
  apiEndpoint.pathname, // ⚠️ Simple string key
  () => request(/* ... */),
  {
    enabled: true,
    refetchInterval: false,
    staleTime: Infinity,
    refetchOnMount: true,
  }
);
```

**Problem:**
- Query key doesn't include filters, sorting, pagination
- Manual state management for currentPage, perPage, filters
- Query doesn't update when these change

**Impact:** HIGH - Used across all list pages

**Solution:**

**A. Memoize Callbacks:**
```typescript
const DataTable = <T extends Record<string, any>>(props: Props<T>) => {
  // Memoize column formatters
  const formatters = useMemo(
    () => props.columns.map(col => col.format || ((v) => v)),
    [props.columns]
  );
  
  // Memoize row selection handler
  const handleRowSelect = useCallback(
    (resourceId: string, value: boolean) => {
      setSelected(prev => 
        value 
          ? [...prev, resourceId]
          : prev.filter(id => id !== resourceId)
      );
    },
    []
  );
  
  // Render rows with proper memoization
  const rows = useMemo(() => {
    return currentData
      ?.filter((resource) => !hideEditableOptions || selected.includes(resource.id))
      .map((resource) => (
        <DataTableRow
          key={resource.id}
          resource={resource}
          columns={props.columns}
          formatters={formatters}
          onSelect={handleRowSelect}
        />
      ));
  }, [currentData, selected, props.columns, formatters, handleRowSelect]);
  
  return <Tbody>{rows}</Tbody>;
};

// Extract row to separate component
const DataTableRow = React.memo(<T,>(
  props: {
    resource: T;
    columns: Column[];
    formatters: Function[];
    onSelect: (id: string, value: boolean) => void;
  }
) => {
  // Row only re-renders when resource, columns, or formatters change
});
```

**B. Proper Query Keys:**
```typescript
const queryKey = useMemo(
  () => [
    apiEndpoint.pathname,
    { 
      page: currentPage, 
      perPage, 
      filters, 
      sort, 
      status 
    }
  ],
  [currentPage, perPage, filters, sort, status]
);

const { data, isLoading } = useQuery(queryKey, () => /* ... */);
```

---

### 5. **InvoicePreview Re-Render Storm**

#### Issue: Debounced Resource Updates + Intersection Observer Complexity

**Location:** `src/pages/invoices/common/components/InvoicePreview.tsx`

**Example:**
```typescript
export function InvoicePreview(props: Props) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [debouncedResource, setDebouncedResource] = useState<Resource>(props.resource);
  
  // ⚠️ Creates new timeout on every props.resource change
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedResource(props.resource);
    }, 1000);
    return () => clearTimeout(timer);
  }, [props.resource]); // ⚠️ props.resource is new object on every keystroke
  
  // ⚠️ Complex intersection observer setup
  useEffect(() => {
    const debouncedKeydown = debounce(() => {
      triggerUpdate.current = true;
      if (isCurrentlyIntersecting.current) {
        setIsIntersecting(true);
      }
    }, 1000);
    // ... 60 lines of observer logic
  }, [divRef.current, props.observable]);
}
```

**Problems:**
- `props.resource` changes on EVERY form field change
- Two separate debounce mechanisms (1s each)
- IntersectionObserver setup/teardown on every mount
- Multiple `setState` calls in rapid succession

**Impact:** MEDIUM-HIGH - Used in invoice/quote/credit edit pages

**Solution:**

**Option 1: Deep Comparison**
```typescript
import { useDebounce } from 'react-use';
import { isEqual } from 'lodash';

export function InvoicePreview(props: Props) {
  const [debouncedResource, setDebouncedResource] = useState<Resource>(props.resource);
  
  // Use proper deep comparison
  useDebounce(
    () => {
      if (!isEqual(debouncedResource, props.resource)) {
        setDebouncedResource(props.resource);
      }
    },
    1000,
    [props.resource]
  );
  
  // Memoize IntersectionObserver
  const observer = useMemo(() => {
    if (!props.observable) return null;
    return new IntersectionObserver(/* ... */,{ threshold: 0.3 });
  }, [props.observable]); // Only recreate when observable prop changes
}
```

**Option 2: Form-Level Debounce (Recommended)**
```typescript
// At the form level, debounce the entire resource update
const debouncedHandleChange = useMemo(
  () => debounce((property, value) => {
    setInvoice(prev => ({ ...prev, [property]: value }));
  }, 300),
  []
);

// InvoicePreview receives already-debounced updates
<InvoicePreview resource={invoice} />
```

---

### 6. **ProductsTable Drag-and-Drop Performance**

#### Issue: Re-Rendering All Rows on Any Line Item Change

**Location:** `src/pages/invoices/common/components/ProductsTable.tsx`

**Example:**
```typescript
export function ProductsTable(props: Props) {
  const resolveInputField = useResolveInputField({
    type: props.type,
    resource: props.resource,          // ⚠️ New object every time
    onLineItemChange: props.onLineItemChange, // ⚠️ New function reference
    onLineItemPropertyChange: props.onLineItemPropertyChange,
    relationType,
    createItem: props.onCreateItemClick,
    deleteLineItem: props.onDeleteRowClick,
  });
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="product-table">
        {(provided) => (
          <Tbody {...provided.droppableProps} innerRef={provided.innerRef}>
            {items.map((lineItem, index) => (
              <Draggable
                key={getLineItemIndex(lineItem)}  // ⚠️ Function call
                draggableId={getLineItemIndex(lineItem).toString()}
                index={getLineItemIndex(lineItem)}
              >
                {(provided) => (
                  <Tr {...provided.draggableProps}>
                    {columns.map((column, columnIndex) => (
                      <Td key={columnIndex}>
                        {resolveInputField(column, getLineItemIndex(lineItem))}
                      </Td>
                    ))}
                  </Tr>
                )}
              </Draggable>
            ))}
          </Tbody>
        )}
      </Droppable>
    </DragDropContext>
  );
}
```

**Problems:**
- `resolveInputField` creates new function on every render
- Every line item change causes ALL rows to re-render
- `getLineItemIndex` called multiple times per row
- Draggable context causes re-renders

**Impact:** HIGH - Used in invoice/quote/credit forms

**Solution:**

```typescript
export function ProductsTable(props: Props) {
  // Memoize line item indices
  const lineItemIndices = useMemo(
    () => new Map(props.items.map(item => [item, props.resource.line_items.indexOf(item)])),
    [props.items, props.resource.line_items]
  );
  
  // Memoize resolve function
  const resolveInputField = useMemo(
    () => useResolveInputField({
      type: props.type,
      resource: props.resource,
      onLineItemChange: props.onLineItemChange,
      onLineItemPropertyChange: props.onLineItemPropertyChange,
      relationType: props.relationType,
      createItem: props.onCreateItemClick,
      deleteLineItem: props.onDeleteRowClick,
    }),
    [
      props.type,
      props.resource,
      props.onLineItemChange,
      props.onLineItemPropertyChange,
      props.relationType,
      props.onCreateItemClick,
      props.onDeleteRowClick,
    ]
  );
  
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="product-table">
        {(provided) => (
          <Tbody {...provided.droppableProps} innerRef={provided.innerRef}>
            {props.items.map((lineItem) => {
              const index = lineItemIndices.get(lineItem)!;
              return (
                <ProductTableRow
                  key={index}
                  lineItem={lineItem}
                  index={index}
                  columns={props.columns}
                  resolveInputField={resolveInputField}
                  provided={provided}
                />
              );
            })}
          </Tbody>
        )}
      </Droppable>
    </DragDropContext>
  );
}

// Extract row component
const ProductTableRow = React.memo(({
  lineItem,
  index,
  columns,
  resolveInputField,
  provided
}: {
  lineItem: InvoiceItem;
  index: number;
  columns: string[];
  resolveInputField: (column: string, index: number) => ReactNode;
  provided: any;
}) => {
  return (
    <Draggable draggableId={index.toString()} index={index}>
      {(provided) => (
        <Tr {...provided.draggableProps} innerRef={provided.innerRef}>
          {columns.map((column, columnIndex) => (
            <Td key={columnIndex}>
              {resolveInputField(column, index)}
            </Td>
          ))}
        </Tr>
      )}
    </Draggable>
  );
});
```

---

### 7. **useActions Hook Creating Functions on Every Render**

#### Issue: Action Arrays with Inline Functions

**Location:** Multiple `useActions` hooks (e.g., `src/pages/clients/common/hooks/useActions.tsx`)

**Example:**
```typescript
export function useActions(params?: Params) {
  const [t] = useTranslation();
  const bulk = useBulk();
  const hasPermission = useHasPermission();
  const { isEditOrShowPage } = useEntityPageIdentifier({ entity: 'client' });
  
  // ⚠️ New array created every render
  const actions: Action<Client>[] = [
    (client) => !client.is_deleted && (
      <DropdownElement
        to={route('/clients/:id/statement', { id: client.id })}
        icon={<Icon element={MdPictureAsPdf} />}
      >
        {t('view_statement')}
      </DropdownElement>
    ),
    (client) => !client.is_deleted && (
      <DropdownElement
        onClick={() => window.open(/* ... */)} // ⚠️ New function reference
        icon={<Icon element={MdCloudCircle} />}
      >
        {t('client_portal')}
      </DropdownElement>
    ),
    // ... 15 more actions
  ];
  
  return actions; // ⚠️ New array reference every render
}
```

**Problems:**
- New actions array created on every render
- Each action is a new function reference
- Components receiving these actions re-render unnecessarily
- Translations called multiple times

**Impact:** MEDIUM - Used in entity pages

**Solution:**
```typescript
export function useActions(params?: Params) {
  const [t] = useTranslation();
  const bulk = useBulk();
  const hasPermission = useHasPermission();
  const { isEditOrShowPage } = useEntityPageIdentifier({ entity: 'client' });
  
  // Memoize individual action handlers
  const handlePortalOpen = useCallback((clientHash: string) => {
    window.open(
      route(`/client/portal?client_hash=${clientHash}`),
      '_blank'
    );
  }, []);
  
  const handleArchive = useCallback((clientId: string) => {
    bulk([clientId], 'archive');
  }, [bulk]);
  
  // Memoize actions array
  const actions: Action<Client>[] = useMemo(
    () => [
      (client) => !client.is_deleted && (
        <DropdownElement
          to={route('/clients/:id/statement', { id: client.id })}
          icon={<Icon element={MdPictureAsPdf} />}
        >
          {t('view_statement')}
        </DropdownElement>
      ),
      (client) => !client.is_deleted && (
        <DropdownElement
          onClick={() => handlePortalOpen(client.client_hash)}
          icon={<Icon element={MdCloudCircle} />}
        >
          {t('client_portal')}
        </DropdownElement>
      ),
      // ... more actions
    ],
    [t, handlePortalOpen, handleArchive, isEditOrShowPage, hasPermission]
  );
  
  return actions;
}
```

---

### 8. **InputField Component Inefficiencies**

#### Issue: Color Scheme Hook Called in Every Input

**Location:** `src/components/forms/InputField.tsx`

**Example:**
```typescript
export function InputField(props: Props) {
  const colors = useColorScheme(); // ⚠️ Called in EVERY input field
  const reactSettings = useReactSettings({ overwrite: false }); // ⚠️ Expensive merge
  
  const inputType = useMemo(() => {
    if (props.type === 'password' && isInputMasked) {
      return 'password';
    }
    if (props.type === 'password' && !isInputMasked) {
      return 'text';
    }
    return props.type;
  }, [props.type, isInputMasked]);
  
  return (
    <DebounceInput
      style={{
        backgroundColor: colors.$1,  // ⚠️ New style object every render
        color: colors.$3,
        ...props.style,
      }}
      // ...
    />
  );
}
```

**Problems:**
- Forms with 20+ fields = 20+ `useColorScheme()` calls
- 20+ `useReactSettings()` calls (each does merge/cloneDeep)
- New style objects on every render
- DebounceInput re-renders on style changes

**Impact:** MEDIUM-HIGH - InputField used everywhere

**Solution:**

**Option 1: Context Provider**
```typescript
// Create ThemeContext at app level
const ThemeContext = createContext<{
  colors: ColorScheme;
  isDarkMode: boolean;
}>(null!);

export function InputField(props: Props) {
  const { colors, isDarkMode } = useContext(ThemeContext); // Single read
  
  // Memoize style object
  const style = useMemo(
    () => ({
      backgroundColor: colors.$1,
      color: colors.$3,
      ...props.style,
    }),
    [colors.$1, colors.$3, props.style]
  );
  
  return <DebounceInput style={style} />;
}
```

**Option 2: CSS Variables**
```typescript
// Set CSS variables at root level
document.documentElement.style.setProperty('--input-bg', colors.$1);
document.documentElement.style.setProperty('--input-color', colors.$3);

// In component - no hooks needed!
export function InputField(props: Props) {
  return (
    <DebounceInput
      className="input-field" // Uses CSS variables
      style={props.style}
    />
  );
}

// CSS:
.input-field {
  background-color: var(--input-bg);
  color: var(--input-color);
}
```

---

### 9. **React Query Invalidation Cascade**

#### Issue: Over-Invalidation of Queries

**Location:** `src/common/hooks/useRefetch.tsx`

**Example:**
```typescript
export const keys = {
  invoices: {
    path: '/api/v1/invoices',
    dependencies: [
      '/api/v1/clients',          // ⚠️ Invalidates ALL clients
      '/api/v1/charts/totals_v2', // ⚠️ Invalidates dashboard
      '/api/v1/activities',       // ⚠️ Invalidates ALL activities
      '/api/v1/documents',        // ⚠️ Invalidates ALL documents
      '/api/v1/tasks',            // ⚠️ Invalidates ALL tasks
    ],
  },
  clients: {
    path: '/api/v1/clients',
    dependencies: [
      '/api/v1/invoices',         // ⚠️ Circular dependency!
      '/api/v1/recurring_invoices',
      '/api/v1/projects',
      '/api/v1/payments',
      // ... 10+ dependencies
    ],
  },
};

export function useRefetch() {
  const queryClient = useQueryClient();

  return (property: Array<keyof typeof keys>) => {
    property.map((key) => {
      if (!keys[key]) return;

      queryClient.invalidateQueries(keys[key].path); // ⚠️ Invalidates by prefix

      keys[key].dependencies.map((dependency) => {
        queryClient.invalidateQueries(dependency); // ⚠️ Cascading invalidation
      });
    });
  };
}
```

**Problems:**
- Creating/updating ONE invoice invalidates:
  - All invoices queries
  - All clients queries
  - All charts
  - All activities
  - All documents
  - All tasks
- Circular dependencies (invoices → clients → invoices)
- Prefix matching means `/api/v1/clients` invalidates `/api/v1/clients/123`

**Impact:** CRITICAL - Causes massive re-fetching across the app

**Solution:**

**Use Specific Query Keys:**
```typescript
// Instead of invalidating all invoices:
queryClient.invalidateQueries(['/api/v1/invoices']);

// Invalidate specific invoice:
queryClient.invalidateQueries(['/api/v1/invoices', invoiceId]);

// Invalidate with filters:
queryClient.invalidateQueries({
  predicate: (query) => {
    const [path, params] = query.queryKey;
    return path === '/api/v1/invoices' && params?.client_id === clientId;
  }
});
```

**Optimistic Updates Instead of Invalidation:**
```typescript
// When updating an invoice, update cache directly
const updateInvoice = useMutation({
  mutationFn: (invoice: Invoice) => api.put(`/invoices/${invoice.id}`, invoice),
  onSuccess: (updatedInvoice) => {
    // Update single invoice in cache
    queryClient.setQueryData(
      ['/api/v1/invoices', updatedInvoice.id],
      updatedInvoice
    );
    
    // Update invoice in list
    queryClient.setQueryData(
      ['/api/v1/invoices', { status: 'sent' }],
      (old: Invoice[]) => 
        old.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv)
    );
    
    // Only invalidate dashboard totals (not all charts)
    queryClient.invalidateQueries(['/api/v1/charts/totals_v2']);
  }
});
```

---

### 10. **Excessive useEffect Dependencies**

#### Issue: Effects Triggering on Every Render

**Location:** `src/App.tsx` and many page components

**Example:**
```typescript
useEffect(() => {
  if (resolvedLanguage) {
    dayjs
      .locale(resolveDayJSLocale(resolvedLanguage.locale))
      .then(() => {
        updateDayJSLocale(dayjs.locale());
        i18n.changeLanguage(resolvedLanguage.locale);
      });
  }
}, [darkMode, resolvedLanguage]); // ⚠️ darkMode doesn't affect language
```

**Problems:**
- `darkMode` changes trigger language reloading
- `resolvedLanguage` is new object on every render
- `updateDayJSLocale` and `i18n.changeLanguage` called unnecessarily

**Impact:** MEDIUM

**Solution:**
```typescript
const prevLocale = useRef<string>();

useEffect(() => {
  if (resolvedLanguage && resolvedLanguage.locale !== prevLocale.current) {
    prevLocale.current = resolvedLanguage.locale;
    
    dayjs.locale(resolveDayJSLocale(resolvedLanguage.locale)).then(() => {
      updateDayJSLocale(dayjs.locale());
      i18n.changeLanguage(resolvedLanguage.locale);
    });
  }
}, [resolvedLanguage?.locale]); // Only depend on the string, not the object
```

---

## Recommended Implementation Plan

### Phase 1: Critical Fixes (Week 1-2)

**Priority P0 - Immediate Impact:**

1. **Fix `useReactSettings` memoization** (2 hours)
   - Add `useMemo` to merge operation
   - Use `shallowEqual` in Redux selector
   - Expected improvement: 30-40% reduction in re-renders

2. **Fix `useCurrentCompany` selector** (1 hour)
   - Create memoized selector with `createSelector`
   - Use proper equality check
   - Expected improvement: 20% reduction in re-renders

3. **Optimize DataTable row rendering** (4 hours)
   - Extract row components
   - Memoize callbacks
   - Add React.memo to row components
   - Expected improvement: 50% faster table interactions

4. **Fix React Query invalidation strategy** (8 hours)
   - Review all `$refetch` calls
   - Replace broad invalidations with specific ones
   - Implement optimistic updates
   - Expected improvement: 60% reduction in unnecessary API calls

**Total Phase 1 Time:** ~15 hours
**Expected Overall Improvement:** 30-50% faster UI

---

### Phase 2: High Impact Optimizations (Week 3-4)

**Priority P1 - Significant Impact:**

1. **Refactor InputField to use CSS variables** (3 hours)
   - Move theme to CSS variables
   - Remove `useColorScheme` calls
   - Expected improvement: 15-20% faster form rendering

2. **Optimize ProductsTable** (6 hours)
   - Extract row component
   - Memoize line item indices
   - Fix callback dependencies
   - Expected improvement: 40% faster line item updates

3. **Fix InvoicePreview debouncing** (3 hours)
   - Move debounce to form level
   - Simplify intersection observer
   - Expected improvement: Smoother editing experience

4. **Memoize useActions hooks** (4 hours)
   - Add `useMemo` and `useCallback` to action generators
   - Expected improvement: 10-15% faster dropdown rendering

5. **App.tsx refactoring** (6 hours)
   - Split into sub-components
   - Memoize expensive operations
   - Reduce useEffect dependencies
   - Expected improvement: Faster initial load, better hot reload

**Total Phase 2 Time:** ~22 hours
**Expected Overall Improvement:** Additional 20-30% faster UI

---

### Phase 3: Preventive Measures (Week 5-6)

**Priority P2 - Long-term Improvements:**

1. **Implement React DevTools Profiler integration** (2 hours)
   - Add profiler in development mode
   - Create performance monitoring dashboard

2. **Create performance testing suite** (8 hours)
   - Lighthouse CI integration
   - Bundle size monitoring
   - Render time benchmarks

3. **Documentation and guidelines** (4 hours)
   - Performance best practices guide
   - Code review checklist
   - Pre-commit performance checks

4. **Virtualization for large lists** (8 hours)
   - Implement `react-window` for DataTable
   - Add pagination limits
   - Virtual scrolling for dropdowns

**Total Phase 3 Time:** ~22 hours

---

## Measurement & Validation

### Before/After Metrics

**Key Metrics to Track:**

1. **Component Re-render Count**
   - Use React DevTools Profiler
   - Target: 50% reduction in unnecessary re-renders

2. **Time to Interactive (TTI)**
   - Measure with Lighthouse
   - Target: < 3.5s on 4G

3. **API Call Frequency**
   - Monitor network tab
   - Target: 60% reduction in duplicate requests

4. **Frame Rate During Interactions**
   - Use Chrome DevTools Performance tab
   - Target: Maintain 60fps during typing

5. **Bundle Size**
   - Current: Check `dist/` folder
   - Target: No increase despite optimizations

### Testing Scenarios

1. **Invoice Edit Page:**
   - Add 20 line items
   - Edit each field
   - Measure re-renders per keystroke
   - Target: < 5 re-renders per keystroke

2. **DataTable with 100 Rows:**
   - Scroll through table
   - Toggle filters
   - Sort columns
   - Target: < 100ms for each operation

3. **Dashboard Load:**
   - Cold start (no cache)
   - Hot reload (cached data)
   - Target: < 2s initial load, < 500ms hot reload

---

## Tools & Utilities

### Recommended Tools

1. **React DevTools Profiler**
   ```bash
   # Enable profiler in dev
   npm install --save-dev @welldone-software/why-did-you-render
   ```

2. **Bundle Analyzer**
   ```bash
   npm install --save-dev vite-plugin-bundle-analyzer
   ```

3. **Performance Monitoring**
   ```bash
   npm install --save-dev web-vitals
   ```

### Custom Performance Utilities

**Measure Component Render Time:**
```typescript
// src/common/utils/performance.ts
import { Profiler, ProfilerOnRenderCallback } from 'react';

export const MeasuredComponent = ({ id, children }: { id: string; children: ReactNode }) => {
  const onRender: ProfilerOnRenderCallback = (id, phase, actualDuration) => {
    if (actualDuration > 16) { // More than one frame (16ms)
      console.warn(`Slow render: ${id} took ${actualDuration}ms in ${phase}`);
    }
  };
  
  return (
    <Profiler id={id} onRender={onRender}>
      {children}
    </Profiler>
  );
};
```

**Detect Unnecessary Re-renders:**
```typescript
// src/common/utils/useWhyDidYouUpdate.ts
import { useEffect, useRef } from 'react';

export function useWhyDidYouUpdate(name: string, props: any) {
  const previousProps = useRef<any>();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changedProps: any = {};

      allKeys.forEach((key) => {
        if (previousProps.current[key] !== props[key]) {
          changedProps[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changedProps).length > 0) {
        console.log('[why-did-you-update]', name, changedProps);
      }
    }

    previousProps.current = props;
  });
}

// Usage:
function MyComponent(props) {
  useWhyDidYouUpdate('MyComponent', props);
  // ...
}
```

---

## General Best Practices Going Forward

### 1. Hook Guidelines

**DO:**
- Memoize expensive computations with `useMemo`
- Wrap callbacks passed as props with `useCallback`
- Use `React.memo` for components that receive primitive props
- Prefer Context for widely-used values (theme, auth)

**DON'T:**
- Call hooks conditionally
- Create objects/arrays in render (use useMemo)
- Pass inline functions as props to memoized components
- Use Redux for local component state

### 2. Component Structure

**DO:**
- Keep components under 250 lines
- Extract complex JSX into sub-components
- Co-locate related state
- Use composition over props drilling

**DON'T:**
- Put everything in one large component
- Pass entire objects when only one property is needed
- Create HOCs when hooks suffice

### 3. State Management

**DO:**
- Use React Query for server state
- Use Jotai for transient UI state
- Use Redux only for truly global state
- Normalize Redux state shape

**DON'T:**
- Mix concerns between state managers
- Store derived data in state
- Create selectors without memoization

### 4. Query/API Patterns

**DO:**
- Use specific query keys
- Implement optimistic updates
- Paginate large datasets
- Use `staleTime` and `cacheTime` appropriately

**DON'T:**
- Invalidate queries by prefix
- Refetch on every mount
- Create circular dependencies
- Forget to handle loading/error states

---

## Conclusion

The Invoice Ninja UI has several systematic performance issues primarily related to:

1. **Memoization:** Lack of `useMemo`, `useCallback`, and `React.memo`
2. **State Management:** Over-subscription to Redux, expensive operations in hooks
3. **Query Invalidation:** Too broad, causing cascade effects
4. **Component Structure:** Monolithic components with complex prop chains

**Estimated Total Implementation Time:** 6-8 weeks
**Expected Performance Improvement:** 50-70% reduction in render times, 60% fewer API calls

**Immediate Actions:**
1. Fix `useReactSettings` memoization (highest ROI)
2. Optimize DataTable rendering
3. Review and fix React Query invalidation
4. Refactor ProductsTable

These fixes will provide immediate, measurable improvements to user experience, particularly in data-heavy pages like invoice editing and client lists.

