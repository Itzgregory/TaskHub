# User Personas: TaskHub

**Date:** February 19, 2026  
**Total Personas:** 3  

---

## Persona 1: Sarah Chen - Team Lead

**Demographics:**
- Age: 32
- Role: Engineering Team Lead
- Tech Savvy: High
- Location: San Francisco, CA

**Goals:**
- Track team sprint tasks efficiently
- Monitor team progress and blockers
- Ensure accountability through audit trails
- Export reports for stakeholders

**Pain Points:**
- Current tools lack proper RBAC
- Can't see who changed what and when
- Data export is cumbersome
- Lost updates when team edits concurrently

**How TaskHub Helps:**
- OrgAdmin role gives her full control
- Audit log shows all team activity
- One-click export to JSON/CSV
- Version conflicts prevented automatically

**User Stories:** US-005, US-006, US-007, US-008, US-025, US-026

---

## Persona 2: Marcus Johnson - Individual Contributor

**Demographics:**
- Age: 28
- Role: Software Engineer
- Tech Savvy: High
- Location: Remote (Austin, TX)

**Goals:**
- Manage personal and work tasks in one place
- Quick task creation and updates
- Filter by priority and due dates
- Restore accidentally deleted items

**Pain Points:**
- Needs simple, fast interface
- Doesn't want admin overhead
- Occasionally deletes wrong item
- Wants to work offline sometimes

**How TaskHub Helps:**
- Clean API for personal dashboard
- Soft delete allows recovery
- Filters and sorting built-in
- Can export for offline access

**User Stories:** US-010, US-011, US-012, US-013, US-014, US-016, US-017

---

## Persona 3: Priya Sharma - Compliance Officer

**Demographics:**
- Age: 45
- Role: Compliance & Security Lead
- Tech Savvy: Medium
- Location: London, UK

**Goals:**
- Ensure audit trail for regulatory compliance
- Verify proper access controls
- Review security incidents
- Generate compliance reports

**Pain Points:**
- Many tools don't log user actions
- Can't prove who did what when
- Audit logs are often tamperable
- Export capabilities missing

**How TaskHub Helps:**
- Comprehensive immutable audit log
- RBAC with clear permission boundaries
- OrgAdmin-only audit log access
- Export audit trails for regulators

**User Stories:** US-025, US-026, US-032, US-033

---

## Anti-Persona: Casual Consumer User

**Why NOT our target:**
- TaskHub is designed for teams and compliance-focused orgs
- Too much overhead (audit logs, RBAC) for personal use
- Better alternatives exist (Todoist, Any.do)
- File storage not ideal for mobile-first users

**Recommendation:** Use a consumer-focused todo app instead
