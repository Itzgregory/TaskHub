# Estimation Approach & Delivery Plan

**Project:** TaskHub
**Date:** February 23, 2026

---

## How Work Was Estimated

Each task was sized using a simple t-shirt sizing system rather than trying to estimate exact hours upfront. Sizes range from XS (a quick fix, roughly 1–2 hours) up to XL (a major piece of work, 2–4 days). This keeps planning focused on relative complexity rather than false precision.

---

## Delivery Plan

The project was completed solo in one week, with work organised into four broad phases.

**Days 1–2: Foundation.** Architecture scaffolding, authentication (register, login, logout, sessions), organisation management with full tenant isolation, and role-based access control.

**Days 3–4: Core Features.** Full task management including creation, editing, listing, status toggling, soft delete, restore, and hard delete for admins. Optimistic concurrency, filters, sorting, and pagination.

**Days 5–6: Security & Quality.** Audit logging, import/export with validation, file-based storage with atomic writes and schema migration, rate limiting, CSRF protection, and the unit and integration test suite.

**Day 7: Frontend, Polish & Handover.** Authentication screens, task list UI with filters and optimistic updates, error and loading states, accessibility basics, CI pipeline, documentation, and final submission.

---

## Planning Notes

Given the one-week constraint, the critical path was kept tight: authentication → multi-tenancy → task management → concurrency → file storage. Larger or lower-priority items were deprioritised if they risked blocking the core flow. Everything was built and tested by the same person, so there were no handoff delays — but also no slack for unexpected blockers.