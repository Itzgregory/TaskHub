# Bug Fix Summary: Todo Checkbox Flickering Issue

## What Was the Problem?

When a user clicked a todo item's checkbox very quickly multiple times, the app would show the wrong status — for example, showing a task as "done" when it was actually still open (or vice versa). Sometimes an error message would flash on screen, but the checkbox wouldn't correct itself. The only way to see the true status was to refresh the page.

## Why Did It Happen?

Three separate issues were working against each other:

**Outdated tracking number.** Every task has an internal version number the server uses to confirm it's receiving the latest update. The app was sending "version 1" every single time, regardless of how many times the task had already been updated. After the first click, the server had already moved to version 2 — so every click after that was rejected.

**No queue or delay on clicks.** Each click fired off a separate request to the server immediately, all at the same time. With no coordination between them, the requests would collide and conflict with each other on the server side.

**No recovery when something went wrong.** When the server rejected a request, the app showed a brief error message but left the checkbox in the wrong position. It never corrected itself to match what the server actually had on record.

## What Was Fixed?

The app now properly reads and tracks each task's version number from the server, so every update request is always in sync. A simple guard was also added so that if a click is already being processed, any additional rapid clicks are ignored until the first one finishes. Finally, when a request fails for any reason, the app now automatically refreshes the task data from the server so the checkbox always reflects the true status.

## How Was It Tested?

Tests were added to confirm that rapid clicks only trigger a single update, that the checkbox correctly resets itself after a failed request, and that the server properly rejects requests that are out of date.

**Overall risk: Low** — the changes only affect the toggle behaviour and nothing else in the app.