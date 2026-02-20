# Project Charter: TaskHub

**Document Version:** 1.0  
**Date:** February 19, 2026  
**Project Manager:** Development Team  
**Sponsor:** Anthropic (Take-Home Exercise)  

---

## Executive Summary

TaskHub is a multi-tenant todo management platform designed to demonstrate enterprise-grade software development practices. The system enables organizations to manage tasks with role-based access control, comprehensive audit logging, and robust concurrency handling.

---

## Project Objectives

### Primary Objectives
1. **Multi-tenancy**: Support multiple organizations with complete data isolation
2. **Security**: Implement RBAC, OWASP compliance, and comprehensive audit trails
3. **Reliability**: Ensure data consistency through optimistic concurrency control
4. **Portability**: Enable data import/export with validation reporting
5. **Maintainability**: Demonstrate clean architecture and extensive documentation

### Success Criteria
- All user stories completed with acceptance criteria met
- Zero critical security vulnerabilities
- 80%+ test coverage across unit, integration, and e2e tests
- Complete SDLC documentation delivered
- System runs successfully with both InMemory and File storage

---

## Scope

### In Scope
- User authentication and session management
- Multi-tenant organization management
- RBAC with Member and OrgAdmin roles
- Todo CRUD with soft delete, restore, and archive
- Optimistic concurrency with ETags
- Audit logging for compliance
- Import/export (JSON and CSV)
- File-based storage with schema migrations
- Background jobs for automatic archiving
- Health monitoring endpoints

### Out of Scope
- Real-time collaboration features
- Mobile native applications
- Third-party integrations (Slack, email notifications)
- Advanced analytics and reporting
- Database storage (PostgreSQL, MongoDB)
- Container orchestration (Kubernetes)

---

## Stakeholders

| Role | Name | Responsibilities |
|------|------|------------------|
| Product Owner | Take-Home Reviewer | Define acceptance criteria, review deliverables |
| Lead Developer | Candidate | Architecture, implementation, documentation |
| Security Reviewer | Assessor | Threat model review, security compliance |
| QA Lead | Assessor | Test strategy review, quality gates |

---

## Timeline & Milestones

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| **Planning** | 4 hours | Charter, Backlog, Risk Register |
| **Requirements** | 4 hours | Spec, Personas, Failure Paths |
| **Architecture** | 6 hours | C4 diagrams, ADRs, Design decisions |
| **Implementation** | 16 hours | Domain, Application, Infrastructure, API layers |
| **Security** | 4 hours | Threat model, STRIDE analysis |
| **Testing** | 6 hours | Unit tests, Integration tests, Test strategy |
| **DevOps** | 3 hours | CI pipeline, Build automation |
| **Maintenance** | 3 hours | Bugfix, Change request, Security hardening |
| **Documentation** | 4 hours | README, API docs, Deployment guide |

**Total Estimated Effort:** 50 hours  
**Target Completion:** 1 week from start

---

## Budget & Resources

### Development Resources
- 1 Full-stack Developer
- Development environment: macOS with .NET 10, Node.js 24
- Tools: VS Code, Git, Postman/Swagger

### Infrastructure
- Local development only (no cloud costs)
- File-based storage (no database licensing)

**Total Budget:** $0 (developer time only)

---

## Risks & Assumptions

### Key Assumptions
1. File-based storage is acceptable for MVP (no traditional database)
2. Session-based auth meets security requirements
3. InMemory storage acceptable for development/testing
4. No requirement for horizontal scaling

### High-Level Risks
1. **Technical Complexity**: Clean Architecture + File storage + Migrations → Mitigated by skill documentation
2. **Time Constraints**: 50-hour scope in 1-week timeline → Mitigated by clear prioritization
3. **Security Gaps**: First-time OWASP ASVS implementation → Mitigated by threat modeling

See [RISK-REGISTER.md](./RISK-REGISTER.md) for detailed risk analysis.

---

## Governance

### Decision Authority
- **Architecture Decisions**: Lead Developer (documented in ADRs)
- **Scope Changes**: Product Owner approval required
- **Technical Trade-offs**: Lead Developer with justification

### Communication Plan
- **Status Updates**: Via Git commits and documentation
- **Issues**: Tracked in code comments and ADRs
- **Deliverables**: Submitted via organized repository structure

---

## Approval

This charter authorizes the project team to proceed with requirements gathering, architecture design, and implementation as outlined above.

**Approved By:**  
_[Candidate Name]_  
Date: February 19, 2026

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-19 | Development Team | Initial charter |
