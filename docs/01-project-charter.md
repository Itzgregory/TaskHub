# Project Charter: TaskHub

**Version:** 2.0
**Date:** February 23, 2026

---

## What Is This?

TaskHub is a task management web app built as a take-home exercise. It's designed to show how a well-structured, secure, multi-tenant system can be built from the ground up — where multiple organisations can each manage their own tasks completely independently of one another.

---

## Goals

The project sets out to demonstrate five things done properly: organisations kept fully isolated from each other's data, meaningful security with role-based permissions and a full audit trail, data consistency when multiple things happen at once, the ability to import and export data, and code that's clean and well-documented throughout.

---

## What's Included

The app covers user login and session management, organisation management, two permission levels (regular member and org admin), full task management including soft delete and archiving, an audit log, import/export in both JSON and CSV formats, file-based data storage with migration support, a background job for auto-archiving old tasks, and basic health monitoring.

Deliberately left out of scope: real-time features, mobile apps, third-party integrations, analytics, traditional databases, and cloud infrastructure.

---

## Who's Involved

Since this is a solo take-home project, the roles are straightforward. The reviewer acts as the product owner and assessor. The candidate (me) handled everything else — architecture, implementation, testing, and documentation.

---

## Timeline

The project is scoped at roughly 50 hours of work across one week, broken down as follows: planning and requirements (8 hours), architecture (6 hours), implementation (16 hours), security (4 hours), testing (6 hours), DevOps (3 hours), maintenance (3 hours), and documentation (4 hours).

---

## Resources & Cost

One developer, a local development machine running .NET 10 and Node.js 24, and file-based storage instead of a traditional database. Total infrastructure cost: nothing.

---

## Key Risks

The three main risks going in were the complexity of combining clean architecture with file-based storage and migrations, the tight 50-hour timeline, and implementing OWASP security standards for the first time. Each was mitigated through clear prioritisation, thorough documentation of decisions, and upfront threat modelling.

---

**Approved:** February 19, 2026