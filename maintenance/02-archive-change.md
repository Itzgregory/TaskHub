# Change Request Summary: Auto-Archive Old Completed Tasks

## What Is This Change?

When a task is marked as done and sits untouched for a long time, it should automatically be moved to an archive — out of the way, but not permanently deleted. This change introduces a background process that handles that automatically on a daily basis.

---

## How It Works

**The archiving process** runs quietly in the background once a day (at 2:00 AM UTC by default). It looks for any completed tasks that have been done for 90 days or more and moves them to the archive. It doesn't interfere with normal app usage while it runs.

**Archived tasks** disappear from the standard task list but aren't gone forever. Anyone on the team can restore an archived task at any time. Permanent deletion is reserved for organisation admins only — the same way it works for tasks that have been soft-deleted.

**The process is safe to run multiple times.** If it runs twice by accident, it won't double-archive anything. It simply skips tasks that are already archived.

**Every archival action is logged.** Each time a task gets archived, a record is written to the audit log so there's a clear trail of what was moved and when.

---

## Configuration

Two settings can be adjusted without changing any code:

- **How old a completed task must be before it's archived** — defaults to 90 days
- **How often the job runs** — defaults to once every 24 hours

---

## Viewing Archived Tasks

The existing task list endpoint now accepts an optional `includeArchived=true` parameter. Without it, the list behaves exactly as before and archived tasks stay hidden.

---

## What Was Tested?

Tests confirm that tasks are correctly flagged as archived, that running the process twice has no unintended side effects, that restoring a task fully clears its archived status, and that only tasks old enough to qualify are actually archived — recent completed tasks are left alone.

---

## Summary

| Area | Detail |
|------|--------|
| **What it does** | Automatically archives completed tasks after a set number of days |
| **When it runs** | Daily at 2:00 AM UTC by default |
| **Configurable?** | Yes — both the age threshold and run frequency |
| **Data loss risk** | None — archiving is reversible; only admins can permanently delete |
| **Impact on existing behaviour** | None — the default task list is unchanged |