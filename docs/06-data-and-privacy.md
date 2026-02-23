# Data Classification & Privacy: TaskHub

**Date:** February 23, 2026

---

## What Gets Stored and Why It Matters

Not all data carries the same sensitivity, so it's worth being clear about what's stored and how carefully each piece needs to be handled.

**User accounts** hold an email address and a hashed password — both sensitive. The email directly identifies a person; the password hash, while not the password itself, still needs to be protected.

**Tasks** are trickier. The structured fields (status, priority, due date) are harmless on their own, but the free-text fields — title, description, and tags — can contain anything a user chooses to type, including personal information. This is treated as potentially sensitive.

**Audit log entries** don't store personal details directly, but they reference user IDs, which link back to real people. Sensitive by association.

**Sessions** are security-critical. A valid session token is effectively a key to someone's account.

**Organisations and memberships** are internal operational data with no direct personal information.

---

## How Long Data Is Kept

Active tasks stay for as long as the organisation exists — their lifecycle is user-managed. Archived tasks are available for permanent deletion after 90 days. Soft-deleted tasks stay recoverable until an admin permanently removes them. Audit logs are kept for 90 days by default. Sessions are cleared on logout or expiry. User accounts remain until explicitly deleted.

GDPR right-to-erasure (account deletion) and right-to-portability (personal data export) are not yet implemented but are noted as future requirements.

---

## What Is Deliberately Not Stored

A few things were consciously left out:

Passwords are never stored in plain text — only the BCrypt hash. Session tokens are never written to logs in full, only the first 8 characters for tracing purposes. Login and registration request bodies are excluded from request logging entirely. IP addresses are used temporarily for rate limiting but never persisted. No browser fingerprinting, no analytics SDKs, no third-party tracking of any kind. Stack traces never appear in API responses — they're logged server-side only.

---

## How Data Moves Through the System

A request comes in over HTTPS with a secure, same-site cookie. The API attaches a correlation ID and passes the request through the application logic down to storage — either in-memory during development or JSON files in production. Every significant action along the way is written to the append-only audit log, scoped to the relevant organisation. No data leaves the server unless a user explicitly triggers an export.