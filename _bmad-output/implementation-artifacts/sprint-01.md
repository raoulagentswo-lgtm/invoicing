# Sprint 1 Planning - Application de Facturation PME

**Document Version:** 1.0  
**Date:** 16 février 2026  
**Statut:** Planning Sprint 1 (MVP)  
**Sprint Duration:** 2 weeks (Weeks 1-2, Feb 16 - Mar 2, 2026)  
**Audience:** Engineering Team, Product Lead, QA

---

## Sprint Overview

### Sprint Goal
**"Deliver core user authentication and basic billing infrastructure to enable first-time users to create and manage invoices independently."**

**Business Goal:** Enable 3-5 internal beta testers to complete end-to-end invoice workflow (sign-up → create invoice → generate PDF) by end of Sprint 1.

**Success Criteria:**
- ✅ All P0 stories completed (16 points accepted)
- ✅ User can sign-up, login, and create first invoice < 5 minutes
- ✅ Invoice creation, PDF generation < 3s per invoice
- ✅ Zero P0 bugs in acceptance testing
- ✅ Code coverage backend: > 70% (unit tests)

---

## Sprint Capacity & Velocity

### Team Composition
- **Frontend Developer (FE Lead):** 1.0 FTE (40h/week)
- **Backend Developer (BE Lead):** 1.0 FTE (40h/week)
- **DevOps/QA (Shared):** 0.5 FTE shared (20h/week)
- **Total Team Capacity:** ~100 story points/sprint (assumption 2-week sprint, learning curve applied)

### Velocity Estimate
- **Sprint 1 Target:** 40-50 story points (conservative, first sprint, team ramp-up)
- **Actual Capacity:** 100 points (2 devs × 50 points/dev) - **reduced by 50% for learning curve** = 50 points safe
- **Risk Buffer:** 10% (5 points) reserved for impediments

### Velocity Confidence
- ⚠️ **Medium (70%)** - Team new to codebase, infrastructure setup overhead
- Recommend conservative approach first sprint; velocity likely increases Sprint 2+

---

## Sprint Stories (Selected 9 Stories)

### Story 1: EPIC-5-001 - User Registration

**Title:** Create new user account  
**Points:** 8  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Backend Lead  

**Sprint Tasks:**
- [ ] Design DB schema: users table (id, email, hashedPassword, firstName, lastName, createdAt)
- [ ] API endpoint: POST /api/auth/register (validation, bcrypt hash, rate limit)
- [ ] Unit tests: password validation, email uniqueness, bcrypt hashing (> 70% coverage)
- [ ] Integration tests: happy path, error cases (email exists, weak password)
- [ ] SendGrid integration: welcome email template + send on signup
- [ ] Frontend form component: email, password, confirm, validation errors inline
- [ ] Frontend integration tests: form submission, error handling, redirect

**Definition of Done:**
- [ ] Code committed + PR reviewed
- [ ] Tests passing locally (unit + integration)
- [ ] Meets AC in stories.md
- [ ] 0 security warnings (OWASP top 10)
- [ ] Response time < 500ms verified

**Dependencies:** None (foundation story)  
**Blocked By:** None  

---

### Story 2: EPIC-5-002 - User Login

**Title:** Login with email and password  
**Points:** 5  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Backend Lead  

**Sprint Tasks:**
- [ ] JWT token generation (HS256, 30-day exp, userId claim)
- [ ] API endpoint: POST /api/auth/login (credentials validation, bcrypt compare)
- [ ] Rate limiting: 5 attempts/15 min per IP (Redis-backed)
- [ ] Unit tests: password comparison, token generation
- [ ] Integration tests: valid/invalid credentials, rate limit trigger
- [ ] Frontend form: email, password, "Forgot password?" link
- [ ] Frontend: JWT storage (localStorage v1), dashboard redirect on success
- [ ] Frontend: session persistence (check token validity on page load)

**Definition of Done:**
- [ ] All AC met from stories.md
- [ ] Tests passing
- [ ] Rate limit working (test with curl loop)
- [ ] Token validated on protected routes

**Dependencies:** EPIC-5-001  
**Blocked By:** None  

---

### Story 3: EPIC-5-004 & EPIC-5-005 - User Profile View & Update (Combined)

**Title:** User profile view and edit  
**Points:** 5 (combined 3+3)  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Full-Stack (FE + BE)  

**Sprint Tasks:**

**Backend:**
- [ ] API endpoint: GET /api/user/profile (return user data)
- [ ] API endpoint: PATCH /api/user/profile (update firstName, lastName, phone, address)
- [ ] Validation: phone E.164, address max 255 chars
- [ ] Audit log: profile change (user_id, field, old_value, new_value)
- [ ] Unit + integration tests

**Frontend:**
- [ ] Page /profile route + profile component
- [ ] Display fields: email (read-only), name, phone, address, company
- [ ] Edit button → toggle edit mode
- [ ] Form validation + submit
- [ ] Success/error toasts
- [ ] Mobile responsive

**Definition of Done:**
- [ ] AC met
- [ ] Tests > 70%
- [ ] Audit trail verified (database)
- [ ] Performance < 300ms

**Dependencies:** EPIC-5-001  
**Blocked By:** None  

---

### Story 4: EPIC-1-001 - Create Invoice Draft

**Title:** Create new invoice in draft status  
**Points:** 13  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Backend Lead + Frontend Lead (pair)  

**Sprint Tasks:**

**Backend:**
- [ ] DB schema: invoices table (id, userId, clientId, status, items JSON, subtotal, tax, total, createdAt, issuedAt, paidAt)
- [ ] DB schema: invoice_line_items table (invoiceId, description, quantity, unitPrice, taxRate, amount)
- [ ] API endpoint: POST /api/invoices (create draft, return id)
- [ ] Auto-save mechanism: debounce 10s, PUT /api/invoices/{id}
- [ ] Validation: client required, min 1 item on issue
- [ ] Unit tests: invoice creation, validation
- [ ] Integration tests: draft creation, auto-save

**Frontend:**
- [ ] Page /invoices/create route + form component
- [ ] Form: client dropdown (populate from clients list), items table (empty initially)
- [ ] Client selector: autocomplete search (EPIC-2-007)
- [ ] Items table: description, quantity, unitPrice, taxRate dropdowns, delete buttons
- [ ] "Add item" button
- [ ] Auto-save UI: "Saving..." spinner + "Saved at HH:MM"
- [ ] Discard/Save buttons
- [ ] Mobile responsive

**Definition of Done:**
- [ ] User can create invoice + add items without errors
- [ ] Auto-save working (verify DB updates)
- [ ] AC met 100%
- [ ] Tests > 70%
- [ ] No N+1 queries

**Dependencies:** EPIC-5-001, EPIC-2-001 (client exists)  
**Blocked By:** EPIC-2-001  

---

### Story 5: EPIC-1-002 & EPIC-1-003 - Add Invoice Line Items & Auto-calculate Totals (Combined)

**Title:** Invoice line items and calculations  
**Points:** 8 (combined 8+5, simplified for sprint)  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Frontend Lead (FE), Backend Lead (BE validation)  

**Sprint Tasks:**

**Frontend:**
- [ ] Items form rows: description, quantity, unitPrice, taxRate (dropdown)
- [ ] Real-time calculation: amount = qty × unitPrice, lineTax = amount × (taxRate/100)
- [ ] Row delete button
- [ ] "Add row" button
- [ ] Totals display: subtotal, tax by rate, total (EUR format)
- [ ] Validation inline: required, positive numbers
- [ ] Min 1, max 50 items

**Backend:**
- [ ] Calculation validation on server (double-check math)
- [ ] API accepts items array, validates each
- [ ] Stores items in JSON or normalized table
- [ ] Unit tests: amount calculation, tax rate handling
- [ ] Integration test: POST invoice with items, verify totals

**Definition of Done:**
- [ ] All calculations correct
- [ ] AC met
- [ ] Tests passing
- [ ] UI/UX smooth (no lag on calc)

**Dependencies:** EPIC-1-001  
**Blocked By:** None  

---

### Story 6: EPIC-1-005 - Invoice Status Workflow

**Title:** Manage invoice state transitions  
**Points:** 8  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Backend Lead  

**Sprint Tasks:**
- [ ] DB enum: status (DRAFT, ISSUED, PAID, CANCELLED)
- [ ] API endpoint: PATCH /api/invoices/{id}/status { status: "ISSUED" }
- [ ] Validation logic: allowed transitions (DRAFT→ISSUED, ISSUED→PAID, ISSUED→CANCELLED)
- [ ] issuedAt timestamp on DRAFT→ISSUED
- [ ] Audit log: every transition + user
- [ ] Unit tests: transition validation, timestamp assignment
- [ ] Integration tests: valid/invalid transitions
- [ ] Error messages: "Cannot cancel paid invoice" etc.

**Frontend:**
- [ ] Invoice detail view: status badge, available actions
- [ ] Button "Issue" (DRAFT only)
- [ ] Button "Mark Paid" (ISSUED only)
- [ ] Button "Cancel" (DRAFT or ISSUED)
- [ ] Confirmation modal before dangerous actions
- [ ] Update detail view after action

**Definition of Done:**
- [ ] All transitions working
- [ ] Audit log entries created
- [ ] AC met 100%
- [ ] Tests > 70%

**Dependencies:** EPIC-1-001  
**Blocked By:** None  

---

### Story 7: EPIC-2-001 - Create Client

**Title:** Add new client to directory  
**Points:** 5  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Full-Stack  

**Sprint Tasks:**

**Backend:**
- [ ] DB schema: clients table (id, userId, firstName, lastName, email, phone, address, city, zipcode, companyName, SIRET, createdAt)
- [ ] API endpoint: POST /api/clients (validation, unique email per user)
- [ ] Validation: email format, firstName/lastName required, SIRET regex if provided
- [ ] Unit tests
- [ ] Integration tests

**Frontend:**
- [ ] Page /clients/create or modal
- [ ] Form: firstName, lastName, email, phone, address, city, zipcode, companyName, SIRET
- [ ] Validation inline
- [ ] Submit button
- [ ] Success toast + redirect detail or list

**Definition of Done:**
- [ ] AC met
- [ ] Tests > 70%
- [ ] Email uniqueness constraint enforced

**Dependencies:** EPIC-5-001  
**Blocked By:** None  

---

### Story 8: EPIC-2-005 - List Clients View

**Title:** Display all clients in table  
**Points:** 5  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Full-Stack  

**Sprint Tasks:**

**Backend:**
- [ ] API endpoint: GET /api/clients (pagination, sorting)
- [ ] Pagination: limit 50, offset-based or cursor
- [ ] Sorting: name (asc/desc), createdAt
- [ ] Query optimization: index on userId, createdAt

**Frontend:**
- [ ] Page /clients route
- [ ] Table: firstName + lastName, email, companyName, createdAt, actions
- [ ] Row click → detail page
- [ ] Pagination controls
- [ ] Sorting headers
- [ ] Empty state

**Definition of Done:**
- [ ] AC met
- [ ] Pagination working
- [ ] Performance < 300ms for 100 clients

**Dependencies:** EPIC-2-001  
**Blocked By:** None  

---

### Story 9: EPIC-4-001 - Generate Invoice PDF

**Title:** Generate professional invoice PDF  
**Points:** 13  
**Priority:** P0  
**Status:** Todo  
**Assignee:** Backend Lead (Puppeteer) + Frontend Lead (template HTML)  

**Sprint Tasks:**

**Frontend:**
- [ ] HTML template component (Next.js page or template component)
- [ ] Layout: header (company info, logo), client section, items table, totals, signature
- [ ] Tailwind CSS styling, A4 format
- [ ] Test template rendering with sample data

**Backend:**
- [ ] Puppeteer setup: headless Chrome, PDF generation
- [ ] API endpoint: POST /api/invoices/{id}/pdf
- [ ] Fetch invoice + client + items data
- [ ] Render HTML template with data
- [ ] Puppeteer PDF generation < 3s
- [ ] File naming: FAC-{number}.pdf
- [ ] Error handling: clear error messages
- [ ] Unit tests: template rendering
- [ ] Integration tests: PDF generation, file output

**DevOps/QA:**
- [ ] Puppeteer Docker setup (if containerized)
- [ ] Performance testing: PDF generation time < 3s benchmark

**Definition of Done:**
- [ ] PDF generated < 3s
- [ ] All data correct (client, items, totals)
- [ ] Logo/signature affiche si available
- [ ] AC met 100%
- [ ] Tests passing

**Dependencies:** EPIC-1-001, EPIC-5-005, EPIC-2-001  
**Blocked By:** None  

---

## Sprint Timeline & Milestones

### Week 1 (Feb 16-22, 2026)

**Mon Feb 16:**
- Team kickoff (30 min)
- Sprint planning finalization
- Divide work: FE setup (Next.js boilerplate), BE setup (Node/Prisma)
- Database schema design (users, invoices, clients, audit tables)

**Tue-Wed Feb 17-18:**
- EPIC-5-001 (registration) in progress
  - BE: API + DB migration
  - FE: Sign-up form component
- EPIC-2-001 (create client) started
  - BE: Client DB schema + API

**Thu-Fri Feb 20-21:**
- EPIC-5-001 code review + testing
- EPIC-5-002 (login) in progress
- EPIC-5-004/005 (profile) started

**Fri end-of-day:**
- Sprint check-in: EPIC-5-001 done, EPIC-5-002 > 50% done
- Blockers review

---

### Week 2 (Feb 23-Mar 2, 2026)

**Mon-Tue Feb 23-24:**
- EPIC-5-002 code review + testing
- EPIC-5-004/005 code review
- EPIC-1-001 (create invoice) started (HIGH PRIORITY)
  - BE: invoices + items schema
  - FE: form layout + client selector

**Wed-Thu Feb 25-26:**
- EPIC-1-001 continued + pair programming session (FE + BE)
- EPIC-1-002/003 (line items + calculations) in progress
- EPIC-2-001 code review

**Thu-Fri Feb 27-28:**
- EPIC-1-005 (workflow) in progress
- EPIC-1-002/003 code review
- EPIC-2-005 (clients list) started

**Fri-Sat Mar 1-2:**
- EPIC-4-001 (PDF) started or in progress
- Final testing: registration flow, login, profile
- Integration testing: client creation → invoice creation
- Code freeze Friday evening

---

### Dependency Chain
```
Week 1:   [EPIC-5-001] → [EPIC-5-002]
            ↓
          [EPIC-5-004/005]

Week 2:   [EPIC-5-001] + [EPIC-2-001] → [EPIC-1-001]
            ↓
          [EPIC-1-002/003] → [EPIC-1-005]
          
          [EPIC-2-001] → [EPIC-2-005]
          
          [EPIC-1-001] → [EPIC-4-001] (parallel end of week 2)
```

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| **Puppeteer PDF generation slow** | Blocks EPIC-4-001, user experience | Medium (30%) | Early spike (day 1), have fallback (HTML print) ready |
| **Database n+1 queries** | Performance degradation | Medium (30%) | Code review checklist, query optimization from start |
| **JWT token security** | Security vulnerability | Low (10%) | Use established jwt library (jsonwebtoken), security review |
| **Auto-save race conditions** | Data loss risk | Medium (30%) | Optimistic locking, conflict resolution strategy |
| **File upload (logo/sig) not in Sprint 1** | Deferred to P1 | - | Strip from EPIC-5-007/008, add to Sprint 2 |

### Team Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Learning curve (new codebase)** | Velocity 50% slower | Pair programming sessions, code reviews, documentation |
| **Scope creep** | Over-commitment | Strict story scope, defer P1/P2 to Sprint 2 |
| **Infrastructure not ready** | Blocked deployment | DevOps starts day 1 (Docker, .env setup) |

### Mitigation Actions
- ✅ **Daily standup:** 15 min (10 AM UTC)
- ✅ **Code review SLA:** < 24h, blocking issues escalate
- ✅ **Spike sessions:** Puppeteer, auto-save logic (reserved 4h)
- ✅ **Pair programming:** Auth (2h), PDF (2h), Invoice form (3h)

---

## Stories NOT in Sprint 1 (Deferred to Sprint 2+)

### EPIC-5 (User Management)
- ❌ EPIC-5-003: Password Reset (P0, defer to Sprint 1-1 if time)
- ❌ EPIC-5-006: SIRET Company Setup (P0, but can defer — simplified to username only in v1)
- ❌ EPIC-5-007: Logo Upload (P1, defer Sprint 2)
- ❌ EPIC-5-008: Signature Upload (P1, defer Sprint 2)
- ❌ EPIC-5-009: Invoice Number Format (P0, use default "FAC-YYYY-SEQ" only)
- ❌ EPIC-5-010: Default Payment Terms (P1, use "Net 30" hardcoded in v1)

### EPIC-1 (Core Billing)
- ❌ EPIC-1-006: Read-Only Post-Issue (P0 but implicit in workflow, can implement minimal)
- ❌ EPIC-1-007: Audit Trail UI (P0, backend log only, UI deferred to Sprint 2)
- ❌ EPIC-1-008: Invoice Details View (P0, simplified to inline detail panel)
- ❌ EPIC-1-009: Auto-Save Invoices (P1, manual save for Sprint 1, add auto-save later)
- ❌ EPIC-1-010: Duplicate Invoice (P1, defer Sprint 2)

### EPIC-2 (Client Management)
- ❌ EPIC-2-003: Update Client (P0, defer to Sprint 1-1)
- ❌ EPIC-2-004: Archive Client (P0, defer Sprint 2)
- ❌ EPIC-2-006: Client Search FTS (P0, defer Sprint 2 — implement basic LIKE filter only)
- ❌ EPIC-2-007: Client Autocomplete (P0, simplify to basic dropdown)
- ❌ EPIC-2-008: Favorite Clients (P1, defer Sprint 2)
- ❌ EPIC-2-009: Import CSV (P1, defer Sprint 2)
- ❌ EPIC-2-010: Export CSV (P1, defer Sprint 2)

### EPIC-4 (PDF & Communication)
- ❌ EPIC-4-002: Download PDF (P0, include in EPIC-4-001)
- ❌ EPIC-4-003: PDF Preview Modal (P1, defer Sprint 2)
- ❌ EPIC-4-004: Send Invoice Email (P0, defer Sprint 2 — manual email only)
- ❌ EPIC-4-005: Email Template Design (P1, defer Sprint 2)
- ❌ EPIC-4-006: Email Confirmation (P1, defer Sprint 2)

### EPIC-3 (Payment Tracking)
- ❌ All EPIC-3 stories (P0/P1, defer to Sprint 2)

### EPIC-6 (Infrastructure)
- ❌ All EPIC-6 stories (parallel track, outside sprint)

---

## Definition of Done

### Code Requirements
- [ ] Code peer-reviewed (2 approvals for critical paths)
- [ ] Unit test coverage ≥ 70%
- [ ] Integration tests for happy path + error cases
- [ ] No critical/high vulnerabilities (OWASP top 10)
- [ ] TypeScript strict mode enabled, 0 `any` types (except justified)
- [ ] No console.log() in production code
- [ ] Database migrations tested (rollback included)

### Performance Requirements
- [ ] API response time < 500ms p95 (EPIC-5 auth), < 300ms (EPIC-1/2 CRUD), < 3s (EPIC-4 PDF)
- [ ] Frontend bundle size < 500KB (gzipped)
- [ ] Database query time < 100ms p95
- [ ] No N+1 queries verified in code review

### Testing Requirements
- [ ] Unit tests: Jest/Vitest
- [ ] Integration tests: Supertest (API) + React Testing Library (FE)
- [ ] Manual QA pass: happy path + edge cases
- [ ] Load test: 10 concurrent users (basic)

### Documentation Requirements
- [ ] API documentation: Swagger/OpenAPI for all endpoints
- [ ] README updated: setup instructions
- [ ] Commit messages: conventional commits (feat:, fix:, docs:)
- [ ] Code comments: complex logic only (assume self-documenting code)

### Security Requirements
- [ ] Password hashing: bcrypt cost ≥ 10
- [ ] JWT validation: on every protected route
- [ ] Input validation: Zod schema server-side
- [ ] CORS configured (allow localhost:3000 in dev)
- [ ] Rate limiting: 5 failed logins / 15 min per IP
- [ ] HTTPS enforced in production (TLS 1.3)

---

## Daily Standup Template

**Time:** 10:00 AM UTC (daily, 15 min)

**Questions:**
1. What did you complete yesterday?
2. What are you working on today?
3. Any blockers or help needed?

**Escalation:** Blockers → discuss in standup, assign owner, target resolve same day

---

## Sprint Review & Demo (Friday Mar 2, 4 PM UTC)

**Attendees:** Entire team + Product Lead + Key stakeholder

**Agenda (30 min):**
1. **Sprint overview** (2 min)
   - Goals recap
   - Velocity: planned vs. actual

2. **Demo** (15 min)
   - Live: user sign-up → login → create client → create invoice → generate PDF
   - Show errors/edge cases handled
   - UI/UX feedback

3. **Metrics** (3 min)
   - Code coverage %
   - Test pass rate
   - Performance metrics (API latency, PDF gen time)

4. **Feedback & closing** (10 min)
   - What went well
   - What to improve Sprint 2
   - Next sprint preview

---

## Sprint Retrospective (Friday Mar 2, 5 PM UTC)

**Time:** 30 min (team only)

**Format: "Went Well / To Improve / Action Items"**

**Questions:**
- What went well this sprint?
- What could we improve?
- What's 1 action item for next sprint?

---

## Success Metrics (End of Sprint 1)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Velocity (Story Points)** | 40-50 | TBD | |
| **Stories Completed (P0)** | 9/9 | TBD | |
| **Bug Count** | < 3 critical | TBD | |
| **Code Coverage (BE)** | > 70% | TBD | |
| **Test Pass Rate** | 100% | TBD | |
| **API Latency p95** | < 500ms | TBD | |
| **PDF Generation Time** | < 3s | TBD | |
| **Team Satisfaction** | > 7/10 | TBD | |

---

## Appendix: Story Point Estimates Rationale

| Story | Points | Justification |
|-------|--------|---|
| EPIC-5-001 (Registration) | 8 | Medium complexity: validation, bcrypt, email integration, tests |
| EPIC-5-002 (Login) | 5 | Medium: JWT, rate limiting, bcrypt compare, tests |
| EPIC-5-004/005 (Profile) | 5 | Simple: GET/PATCH endpoint, form component, validation |
| EPIC-1-001 (Create Invoice) | 13 | High: DB schema (invoices + items), form component, auto-save, validation, tests |
| EPIC-1-002/003 (Items + Calc) | 8 | Medium-high: form UI (table, add/remove), calculations, validation |
| EPIC-1-005 (Workflow) | 8 | Medium-high: state machine logic, transitions, timestamps, audit log, tests |
| EPIC-2-001 (Create Client) | 5 | Simple: DB schema, form, validation, tests |
| EPIC-2-005 (List Clients) | 5 | Simple: pagination, sorting, query optimization |
| EPIC-4-001 (Generate PDF) | 13 | High: Puppeteer setup, HTML template, data binding, file generation, tests, perf tuning |
| **Total** | **70** | Conservative for learning curve |

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Document Version** | 1.0 |
| **Last Updated** | 2026-02-16 |
| **Status** | ✏️ READY FOR EXECUTION |
| **Sprint Duration** | 2 weeks (Feb 16 - Mar 2, 2026) |
| **Stories Selected** | 9 (70 points) |
| **Planned Velocity** | 40-50 points (conservative) |
| **Next Step** | Sprint execution starts Mon Feb 16 |
| **Next Review** | Friday Mar 2 (Review + Retrospective) |

---

**End of Sprint 1 Planning Document**

---

## Quick Reference: Daily Checklist for Team

### Backend Lead
- [ ] Day 1: Setup Prisma, create DB schema (users, invoices, clients)
- [ ] EPIC-5-001: Registration API (POST /register, bcrypt, email send)
- [ ] EPIC-5-002: Login API (POST /login, JWT, rate limit)
- [ ] EPIC-5-004/005: Profile API (GET/PATCH user)
- [ ] EPIC-2-001: Client creation API + schema
- [ ] EPIC-1-001: Invoices + items API + DB schema
- [ ] EPIC-1-002/003: Item validation + calculations (server-side)
- [ ] EPIC-1-005: Status workflow logic + audit log
- [ ] EPIC-4-001: Puppeteer PDF generation + API endpoint
- [ ] Testing: Jest unit tests + Supertest integration tests
- [ ] Code review: pair with FE on critical paths
- [ ] Friday: Deploy to staging, final testing

### Frontend Lead
- [ ] Day 1: Next.js setup, routing, TailwindCSS, auth context
- [ ] EPIC-5-001: Sign-up form component
- [ ] EPIC-5-002: Login form, JWT storage, session persistence
- [ ] EPIC-5-004/005: Profile page + edit form
- [ ] EPIC-2-001: Create client form
- [ ] EPIC-2-005: Client list page + pagination
- [ ] EPIC-1-001: Invoice creation form + client selector
- [ ] EPIC-1-002/003: Items table (add/remove/edit), calculations UI
- [ ] EPIC-1-005: Invoice detail + status buttons
- [ ] EPIC-4-001: PDF template HTML + download button
- [ ] Testing: React Testing Library, E2E (manual)
- [ ] Friday: Deploy to staging, browser testing

### DevOps/QA (0.5 FTE)
- [ ] Setup: Docker compose (local dev), GitHub Actions CI/CD skeleton
- [ ] Database: Migration testing, rollback verification
- [ ] QA: Manual testing checklist (sign-up → invoice → PDF)
- [ ] Performance: Load testing (10 concurrent users)
- [ ] Security: Checklist (password, JWT, CORS, input validation)
- [ ] Friday: Deployment to staging environment

