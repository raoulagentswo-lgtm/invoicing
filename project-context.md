# Project Context - Facturation

## Overview
Application de facturation pour freelances et PME permettant de créer des clients, des factures, générer des PDF, et suivre les paiements.

## Phases
- [x] Analysis (Phase 1) - ✅ Complétée (08:58-09:00 UTC)
  - Product brief créé (01_product-brief.md)
- [x] Planning (Phase 2) - ✅ Complétée (09:28-09:41 UTC)
  - [x] PRD créé (02_prd.md) - 42 sections
  - [x] UX Specification créée (03_ux-specification.md) - 10 sections
- [x] Solutioning (Phase 3) - ✅ Complétée (09:41-09:52 UTC)
  - [x] Architecture Technique + ADRs (ARCHITECTURE.md + 7 ADRs)
  - [x] Epics créées (04_epics.md)
  - [x] User Stories détaillées (27 stories)
  - [x] Sprint 1 Planning (9 stories, 70 pts)
- [ ] Implementation (Phase 4) - En cours...

## Key Dates
- Created: 2026-02-16
- Analysis Completed: 2026-02-16 09:00 UTC
- Planning Started: 2026-02-16 09:28 UTC
- PRD Completed: 2026-02-16 09:33 UTC
- UX Spec In Progress: 2026-02-16 09:33 UTC

## Planning Artifacts
1. Product Brief ✅ - Market analysis, personas, roadmap
2. PRD ✅ - 42 sections, 6 modules, complete architecture
3. UX Specification 🔄 - Design system, wireframes, flows

## Logging Convention

### Frontend (React)
```javascript
console.log('[COMPONENT_NAME] Event:', { data })
console.error('[COMPONENT_NAME] Error:', { error })
```

Example:
```javascript
console.log('[REGISTER] Form data received:', {
  email: data.email,
  password: `[${data.password ? data.password.length : 0} chars]`,
  passwordMatch: data.password === data.confirmPassword,
})

console.error('[REGISTER] Error:', {
  status: err.response?.status,
  code: err.response?.data?.code,
  message: err.response?.data?.message,
})
```

### Backend (Express)
```javascript
console.log('[ROUTE_NAME] Request:', { params })
console.error('[ROUTE_NAME] Error:', { error })
```

Example:
```javascript
console.log('[REGISTER] Request received:', {
  email,
  password: password ? `[${password.length} chars]` : null,
  passwordMatch: password === passwordConfirmation,
})

console.error('[REGISTER] Password mismatch detected:', {
  passwordMatch: password === passwordConfirmation,
  passwordTrimMatch: password?.trim?.() === passwordConfirmation?.trim?.(),
})
```

### Always log:
- ✅ Input data (scrubbed - never full passwords)
- ✅ Calculated values (lengths, matches, etc.)
- ✅ Decision points (validation checks)
- ✅ Errors with full context (status, code, message)

### Security Notes:
- NEVER log full password values
- Always use `[${length} chars]` format for sensitive data
- Include enough context to debug without leaking secrets

## Notes
Phase 2 progresse bien. Sally travaille sur la spec UX pour finaliser le planning.

## Implementation - Logging Setup
- 2026-02-16: Added comprehensive logging to RegisterPage.jsx and auth.js register endpoint
- Purpose: Debug PASSWORD_MISMATCH error and track form submission flow
- Logs include form data validation, password matching, and API response handling
