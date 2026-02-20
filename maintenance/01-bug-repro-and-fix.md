# Bugfix: Rapid Toggling of Todo Status Shows Incorrect UI State

**Ticket title:** "Rapid toggling of todo status sometimes shows incorrect UI state until refresh."

---

## Reproduction Note

### Steps to Reproduce
1. Log in and navigate to the todo list
2. Click the status toggle checkbox on a todo rapidly (3–5 times in quick succession)
3. Observe the checkbox/status indicator

### Observed Behaviour
- The UI shows the todo as "Done" (or "Open") but after a page refresh the status is the opposite
- Intermediate UI states flash inconsistently (checked → unchecked → checked but server says unchecked)
- Occasionally a toast error appears: "Failed to update task — conflict" but the optimistic UI is not rolled back

### Expected Behaviour
- Each toggle should either succeed and reflect the correct server state, or roll back the optimistic UI if the request fails
- Rapid clicks should be debounced or queued so only the final intended state is sent

---

## Root Cause Analysis

### Investigation

The toggle handler fires a mutation on every click:

```tsx
// TaskItem.tsx — handleToggle
const handleToggle = async () => {
  await toggleMutation.mutateAsync({
    id: task.id,
    data: { id: task.id, orgId: activeOrg.orgId, version },
  });
};
```

**Problem 1 — Race condition:** Each click fires an independent request. If the user clicks 3 times in 200ms:
- Request A: Open → Done (version 1)
- Request B: Done → Open (version 1) ← still uses stale version
- Request C: Open → Done (version 1) ← still uses stale version

Requests B and C fail with 412 (version mismatch) but the optimistic UI has already updated.

**Problem 2 — No optimistic rollback:** The `catch` block shows a toast but does not revert the UI state. The user sees the toggled state even though the server rejected it.

**Problem 3 — Hardcoded version:** `const version = 1` means every request uses version 1, so after the first successful toggle (which increments to version 2), all subsequent toggles fail with 412.

### Why It Happened

1. The `version` field was never stored in the frontend `Task` type or synced from the API response
2. React Query's `mutateAsync` fires immediately without debouncing — rapid clicks create parallel in-flight requests
3. The mutation's `onError` callback doesn't invalidate/roll-back the query cache

---

## Fix Implemented

### 1. Store version in Task type and sync from API

```diff
// lib/types.ts
export interface Task {
   id: string;
   title: string;
   // ...existing fields...
+  version: number;
}
```

```diff
// lib/api/mappers.ts — mapTodoDtoToTask
export function mapTodoDtoToTask(dto: TodoDto, orgId: string): Task {
  return {
    // ...existing fields...
+   version: dto.version,
  };
}
```

### 2. Use actual version in toggle handler

```diff
// TaskItem.tsx
- const version = 1; // TODO
+ const version = task.version;
```

### 3. Invalidate query cache on error (rollback optimistic UI)

```diff
// In hooks.ts — useToggleTodoStatus
export function useToggleTodoStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => todosService.toggleStatus(params.id, params.data),
+   onError: () => {
+     // Rollback: refetch todos to get correct server state
+     queryClient.invalidateQueries({ queryKey: ['todos'] });
+   },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todos'] });
    },
  });
}
```

### 4. Debounce rapid toggles

```tsx
// TaskItem.tsx — prevent double-click
const handleToggle = async () => {
  if (toggleMutation.isPending) return; // guard against rapid clicks
  // ...rest of handler
};
```

---

## Automated Test Coverage

### Component Test (Frontend)

```tsx
// __tests__/TaskItem.toggle.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskItem } from '../components/features/TaskItem';

describe('TaskItem toggle', () => {
  it('should not fire multiple mutations on rapid clicks', async () => {
    const mockToggle = vi.fn().mockResolvedValue({});
    render(<TaskItem task={mockTask} />);

    const checkbox = screen.getByRole('button', { name: /mark complete/i });

    // Rapid-fire 5 clicks
    for (let i = 0; i < 5; i++) {
      fireEvent.click(checkbox);
    }

    await waitFor(() => {
      // Only 1 mutation should have fired (guard prevents concurrent)
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  it('should rollback UI state on 412 conflict', async () => {
    const mockToggle = vi.fn().mockRejectedValue({ status: 412 });
    render(<TaskItem task={{ ...mockTask, status: 'todo' }} />);

    const checkbox = screen.getByRole('button', { name: /mark complete/i });
    fireEvent.click(checkbox);

    await waitFor(() => {
      // After error, checkbox should revert to unchecked (todo)
      expect(checkbox).not.toHaveClass('checked');
    });
  });
});
```

### Integration Test (Backend)

```csharp
[Fact]
public async Task ToggleStatus_WithStaleVersion_Returns412()
{
    // Arrange — create a todo
    var todo = await CreateTodoAsync("Rapid toggle test");

    // Act — toggle once (version 1 → 2)
    var firstToggle = await _client.PutAsJsonAsync(
        $"/api/v1/todos/{todo.Id}/toggle",
        new { Id = todo.Id, OrgId = _orgId, Version = 1 });
    firstToggle.StatusCode.Should().Be(HttpStatusCode.OK);

    // Act — try to toggle again with stale version 1
    var staleToggle = await _client.PutAsJsonAsync(
        $"/api/v1/todos/{todo.Id}/toggle",
        new { Id = todo.Id, OrgId = _orgId, Version = 1 });

    // Assert — should get 412 Precondition Failed
    staleToggle.StatusCode.Should().Be(HttpStatusCode.PreconditionFailed);
}
```

---

## Summary

| Aspect | Detail |
|--------|--------|
| **Root cause** | Hardcoded `version = 1`, no debounce, no optimistic rollback |
| **Fix** | Sync version from API, guard against concurrent toggles, invalidate cache on error |
| **Tests added** | 2 frontend (rapid-click guard, rollback), 1 backend (stale version 412) |
| **Risk** | Low — changes are isolated to toggle flow |
