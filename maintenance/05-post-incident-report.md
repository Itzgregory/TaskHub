# Incident Report: Audit Log Gap

**Incident ID:** INC-2026-001
**Date:** 2026-02-26
**Duration:** 2 hours 45 minutes (06:00 – 08:45 UTC)
**Severity:** High
**Impact:** Audit trail incomplete for the affected window; no service disruption



## What Happened

During a routine morning review, I noticed the audit log had no entries between 06:00 and 08:45 UTC. The app was running fine the whole time, but around 170 actions taken during that window weren't recorded. The gap was caught the same day and resolved within an hour of being noticed.



## Root Cause

The audit log is written to a file, protected by a lock to prevent overlapping writes. During a busier-than-usual period, the background archive job and several incoming requests competed for that lock at the same time. When the lock timed out, the code caught the error quietly and moved on as if nothing had happened — so writes were silently failing for nearly three hours with no visible sign anything was wrong.



## Timeline

**06:00** – Audit writes begin silently failing
**08:45** – Logging resumes on its own
**09:00** – I notice the gap during routine review
**09:30** – Root cause identified
**10:00** – Fix deployed and confirmed working
**10:30** – Incident closed; data recovery begins



## Impact

- ~170 audit entries lost
- No task or organisation data was affected
- No indication of any malicious activity during the gap — this was purely a software defect



## What Was Fixed

The audit write code was patched to stop hiding failures — errors now surface properly instead of being swallowed. If an audit write fails, the request fails too, because a broken audit trail isn't acceptable to silently ignore. A startup check was also added to confirm the audit log is writable when the app launches, and an hourly comparison between request count and audit entry count now alerts if the numbers drift too far apart.

Data recovery was done by cross-referencing the separate request logs to reconstruct the most important missing entries — primarily logins and admin actions.



## Planned Improvements

- Replace the file-locking approach with an append-only write strategy to eliminate the contention problem at its root
- Add a real-time alert if no audit entries are recorded while the app is known to be active



## Lessons Learned

The core problem was that a critical write path was allowed to fail silently. That's a straightforward mistake that shouldn't have made it through — audit failures need to be loud. On the positive side, having separate request logs as a backup made partial recovery possible, and daily log review meant the gap was caught quickly rather than days later.