# User Personas, Requirements & Failure Paths: TaskHub

**Date:** February 23, 2026

---

## Who This Was Built For

Three types of users were considered when designing TaskHub.

**The Team Lead** is someone technically confident who needs visibility over what their team is doing — who changed what, when, and why. They want to export data for reporting, and they need proper permission controls rather than a free-for-all. TaskHub gives them admin-level control, a full audit trail, and one-click export.

**The Individual Contributor** just wants to get things done without friction. They need fast task creation, good filtering, and a safety net when they accidentally delete something. They don't want to think about admin settings. TaskHub's soft delete and restore feature covers the accidental deletion case, and the filtering and sorting make it easy to find what they need.

**The Compliance Officer** needs to be able to prove what happened and when. They want an audit log that can't be tampered with and clear access boundaries between roles. TaskHub's immutable audit log and role-based permissions are built with this person in mind.

TaskHub is deliberately **not** aimed at casual personal use — the audit logging and multi-organisation structure add overhead that doesn't make sense for someone just tracking a personal to-do list. Consumer apps like Todoist are a better fit for that.

---

## What the System Must Do

### Users
- Register with a unique username and a securely hashed password
- Log in and get a session; receive a consistent error message whether the username doesn't exist or the password is wrong
- Get locked out for 15 minutes after 5 failed login attempts
- Log out cleanly, with the session fully cleared

### Organisations
- Any logged-in user can create an organisation and automatically becomes its admin
- Admins can add and remove members and change their roles
- The last admin of an organisation cannot be removed — there must always be at least one

### Tasks
- Members can create, view, update, and delete tasks within their organisation
- Tasks support a title, description, priority, tags, and an optional due date
- Deleting is soft by default — tasks can be recovered; only admins can permanently delete
- Tasks can be toggled between open and done
- When two people edit the same task at the same time, the second person gets an error rather than silently overwriting the first person's changes
- Old completed tasks can be archived automatically or manually; archived tasks are hidden by default but retrievable when needed

### Filtering, Sorting & Pagination
- Tasks can be filtered by status, priority, tag, or whether they're overdue
- Sortable by date created, date updated, due date, or priority
- Results are paginated with sensible defaults

### Import & Export
- Tasks can be exported to JSON or CSV
- Tasks can be imported from the same formats; invalid rows are reported back clearly rather than silently skipped

### Audit Log
- Every significant action is recorded: logins, task changes, membership changes, imports and exports
- Only organisation admins can view the audit log
- Entries cannot be edited or deleted

---

## What the System Must Be

- **Secure:** Passwords hashed properly, sessions expire after 24 hours, no sensitive data in error messages
- **Consistent:** Failed requests never leave data in a broken half-updated state
- **Maintainable:** Clean structure, well documented, 80%+ test coverage
- **Honest about its limits:** File-based storage works up to around 50 concurrent users and 10,000 tasks per organisation; beyond that, a proper database would be needed

---

## How Failures Are Handled

Ten specific failure scenarios were mapped out, each with a defined behaviour and recovery path.

**Two people editing the same task simultaneously** — the second person gets a clear error telling them the task was changed and they need to reload before trying again. The first person's changes are preserved.

**Too many wrong password attempts** — the account locks for 15 minutes automatically. All attempts during that window are rejected, including from the real user. The lock clears on its own.

**Power failure during a file write** — because writes go to a temporary file first and only replace the real file once complete, the original data is never corrupted. Recovery is automatic.

**Admin tries to remove themselves when they're the last admin** — blocked with a clear message. They'd need to promote someone else first.

**Importing a file with bad rows** — valid rows are imported, invalid ones are returned in a report with the row number and what was wrong. Nothing is imported silently.

**Session expires while working** — the next request returns a 401 and the user is prompted to log back in.

**Trying to access another organisation's data** — every request checks membership. A 403 is returned and nothing from the other organisation is leaked.

**Storage directory goes missing** — recreated automatically. Any previously stored data would be lost without a backup in place.

**Two people registering the same username at the same moment** — the first one through succeeds, the second gets a clear error.

**Trying to edit an archived task** — blocked at the domain level. The task must be un-archived first.