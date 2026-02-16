# Epic Breakdown - Application de Facturation PME

**Document Version:** 1.0  
**Date:** 16 février 2026  
**Statut:** Phase Planning - FINALISÉ  
**Audience:** Équipe produit, Engineering, Stakeholders

---

## Table des Matières

1. [Epic 1 - Core Billing](#epic-1---core-billing)
2. [Epic 2 - Client Management](#epic-2---client-management)
3. [Epic 3 - Payment Tracking & Analytics](#epic-3---payment-tracking--analytics)
4. [Epic 4 - PDF Generation & Communication](#epic-4---pdf-generation--communication)
5. [Epic 5 - User Management & Onboarding](#epic-5---user-management--onboarding)
6. [Epic 6 - Admin, DevOps & Infrastructure](#epic-6---admin-devops--infrastructure)
7. [Epic Dependency Matrix](#epic-dependency-matrix)
8. [Release Timeline](#release-timeline)

---

## Epic 1 - Core Billing

### Epic ID
**EPIC-1** | **Core Billing & Invoice Management**

### Description
Système complet de gestion de factures permettant aux utilisateurs de créer, modifier, émettre, et annuler des factures avec calculs automatiques TVA, numérotation atomique, et workflow d'état (DRAFT → ISSUED → PAID/CANCELLED).

### Business Objectives
- ✅ Réduire temps facturation de **80%** (vs Excel/Word)
- ✅ Garantir **conformité TVA France** (templates validés)
- ✅ Workflow fluide **2-3 minutes** par facture
- ✅ Zéro erreur calcul TVA/totaux (automatisé)

### Scope & Features

| Feature | Description | Priority | Story Points |
|---------|-------------|----------|---------------|
| **Create Invoice (Draft)** | Création facture brouillon avec auto-save | P0 | 13 |
| **Invoice Line Items** | Ajouter/modifier/supprimer lignes articles | P0 | 8 |
| **Auto-calculated TVA** | Calcul auto TVA (0%, 5.5%, 20%), totaux | P0 | 5 |
| **Invoice Numbering** | Numérotation atomique, format configurable | P0 | 8 |
| **Invoice Status Workflow** | Transitions DRAFT→ISSUED→PAID/CANCELLED | P0 | 8 |
| **Read-Only Post-Issue** | Facture émise non modifiable | P0 | 3 |
| **Invoice History** | Audit trail complet (qui, quand, quoi) | P0 | 8 |
| **Duplicate Invoice** | Quick-copy facture existante | P1 | 5 |
| **Invoice Details View** | Affichage détails facture (panel/page) | P0 | 5 |
| **Soft Delete Invoice** | Suppression logique, archivage | P1 | 3 |
| **Terms & Conditions** | Block CGV personnalisable per facture | P1 | 3 |
| **Payment Terms Config** | Net 30/60, Immédiat, Custom | P1 | 3 |

### Success Criteria

- ✅ Utilisateur crée facture < 3 minutes avec 5 lignes
- ✅ Numérotation atomique sans doublons sur 1000 factures
- ✅ TVA calculée correctement pour tous taux (0%, 5.5%, 20%)
- ✅ Facture émise marquée read-only, horodatée
- ✅ Historique affiche ≥10 modifications avec détails
- ✅ Performance CRUD < 200ms p95
- ✅ Factures brouillon auto-sauvegardées toutes les 10s

### Technical Considerations

- Transactions Prisma pour numérotation atomique
- Calculated fields TVA en temps réel (frontend + backend)
- Audit table pour historique (entity_id, action, changes JSON)
- Redis cache queries 1h (getInvoice, listInvoices)
- Pagination limit 100 factures/page
- Soft-delete via isDeleted boolean + index

### KPIs & Metrics

- Invoice creation time (target: < 3min)
- Invoices created/month (target: 8+/utilisateur)
- Error rate (target: < 0.1%)
- API response time p95 (target: < 200ms)
- Database query p95 (target: < 100ms)

### Dependencies

- **Depends on:** EPIC-5 (User Management pour userId)
- **Depends on:** EPIC-2 (Client Management pour clientId)
- **Enables:** EPIC-3 (Payment Tracking), EPIC-4 (PDF), EPIC-6 (Analytics)

---

## Epic 2 - Client Management

### Epic ID
**EPIC-2** | **Client Management & Directory**

### Description
Système complet de gestion clients permettant création, recherche, modification, archivage, et import/export CSV de base de clients avec recherche full-text et organización favorite/archive.

### Business Objectives
- ✅ Créer client en **< 20 secondes**
- ✅ Recherche instant full-text (nom, email, SIRET)
- ✅ Support **1000+ clients** sans dégradation
- ✅ Import/export CSV pour intégration 3e partis

### Scope & Features

| Feature | Description | Priority | Story Points |
|---------|-------------|----------|---------------|
| **Create Client** | Formulaire création client (nom, email, adresse) | P0 | 5 |
| **Client Details View** | Profil client + historique factures | P0 | 5 |
| **Update Client** | Édition infos client | P0 | 3 |
| **Delete/Archive Client** | Soft-delete, archivage sans perte data | P0 | 3 |
| **List Clients** | Vue liste/table clients triables | P0 | 5 |
| **Client Search** | Recherche full-text (nom, email, SIRET) | P0 | 8 |
| **Client Auto-complete** | Live search dropdown en création facture | P0 | 5 |
| **Favorite Clients** | Marquer favoris, tri rapide | P1 | 3 |
| **Import CSV** | Upload CSV, validation, rapport erreurs | P1 | 8 |
| **Export CSV** | Téléchargement tous clients format CSV | P1 | 3 |
| **SIRET Validation** | Regex validation SIRET/SIREN | P1 | 2 |
| **Client Invoice History** | Afficher factures liées client | P1 | 3 |

### Success Criteria

- ✅ Créer client validé < 20 secondes
- ✅ Recherche instant < 100ms pour 1000 clients
- ✅ Import CSV 100 clients, rapport erreurs clair
- ✅ Archiver client sans supprimer factures passées
- ✅ Autocomplete dropdown < 500ms
- ✅ SIRET validé par regex stricte
- ✅ Export CSV complet, ouvert Excel sans corruption

### Technical Considerations

- PostgreSQL full-text search (FTS) sur name, email
- Pagination clients list (limit 50 défaut)
- Soft-delete via isArchived flag + index
- Email unique constraint per user (user_id, email)
- Client-side debounce search 300ms
- Multer pour CSV upload (max 10MB)
- Papa Parse pour CSV parse/stringify
- UUID primary keys

### KPIs & Metrics

- Clients created/month (target: 5-10/utilisateur)
- Search latency p95 (target: < 100ms)
- Import success rate (target: > 95%)
- Client count active (target: < 1000 v1)

### Dependencies

- **Depends on:** EPIC-5 (User Management pour userId)
- **Enables:** EPIC-1 (Core Billing), EPIC-3 (Analytics)

---

## Epic 3 - Payment Tracking & Analytics

### Epic ID
**EPIC-3** | **Payment Tracking & Financial Dashboard**

### Description
Dashboard et vue de suivi paiements avec KPIs temps réel (Total facturé, Payé, Impayé, Retard), widget paiements par client, et métriques avancées (DSO, taux collection).

### Business Objectives
- ✅ Visibilité financière **en temps réel**
- ✅ Identifier rapidement **factures impayées/retard**
- ✅ Benchmark performance (collection rate, DSO)
- ✅ Trigger actions (relance, suivi)

### Scope & Features

| Feature | Description | Priority | Story Points |
|---------|-------------|----------|---------------|
| **Mark Invoice Paid** | Marquer facture payée + date/montant | P0 | 5 |
| **Dashboard KPI Cards** | Total facturé, Payé, Impayé, Retard | P0 | 8 |
| **Outstanding Invoices View** | Factures impayées triées, filtrables | P0 | 8 |
| **Overdue Invoices View** | Factures en retard avec alert visuelle | P1 | 5 |
| **Payment Methods Tracking** | Virement, Chèque, Carte (log) | P1 | 5 |
| **Collection Rate Metric** | % payé/facturé, displayed sur dashboard | P1 | 3 |
| **Days Sales Outstanding (DSO)** | Moyenne jours paiement, formulé | P2 | 5 |
| **Dashboard Filters** | Period filter (month/quarter/year), client | P1 | 5 |
| **Receivables by Client** | Vue montants impayés par client | P1 | 5 |
| **Payment Timeline Chart** | Graphique simple payements/jour | P2 | 8 |
| **Dispute Flag** | Marquer factures impayées/contentieuses | P2 | 3 |
| **Reminder History** | Log rappels envoyés (pour v2) | P2 | 3 |

### Success Criteria

- ✅ Dashboard charge < 2s pour 100+ factures
- ✅ KPI totals corrects après marquer payée
- ✅ Outstanding affiche factures ISSUED non-payées
- ✅ Overdue flag factures past due date
- ✅ Filter par period, client, status working
- ✅ Collection rate calculé (paid/invoiced * 100)
- ✅ DSO moyenne précise sur factures payées

### Technical Considerations

- Aggregate queries Redis-cached (5min TTL)
- Query optimization: GROUP BY status, SUM totals
- Date filters flexible (month, quarter, year, custom)
- Responsive dashboard (mobile-friendly)
- Real-time KPI updates (TanStack Query refetch 30s)
- Charts: Recharts simple (no heavy libs)
- Performance target: aggregate < 100ms

### KPIs & Metrics

- Dashboard load time (target: < 2s)
- Outstanding invoice accuracy (target: 100%)
- Collection rate % (target: 85%+)
- DSO days (target: < 30)

### Dependencies

- **Depends on:** EPIC-1 (Core Billing pour invoices data)
- **Enables:** Future analytics features, payment reminders

---

## Epic 4 - PDF Generation & Communication

### Epic ID
**EPIC-4** | **PDF Generation & Email Communication**

### Description
Génération factures PDF professionnels (< 3s), avec logo/signature, templates légaux France, et intégration SendGrid pour envois email avec PDF joints.

### Business Objectives
- ✅ PDF professionnel **< 3 secondes**
- ✅ Envoyer facture **1 clic** au client
- ✅ Conformité TVA France **template validé**
- ✅ Email delivery **99.9% (SendGrid)**

### Scope & Features

| Feature | Description | Priority | Story Points |
|---------|-------------|----------|---------------|
| **Generate PDF Invoice** | Conversion facture HTML→PDF Puppeteer | P0 | 13 |
| **Download PDF** | Bouton téléchargement PDF navigateur | P0 | 3 |
| **PDF Preview Modal** | Affichage PDF avant téléchargement | P1 | 5 |
| **Logo in PDF** | Upload logo, affichage en-tête PDF | P1 | 5 |
| **Signature in PDF** | Upload signature, affichage pied PDF | P1 | 5 |
| **Legal Compliance** | Template TVA France (SIRET, mentions) | P0 | 5 |
| **PDF Template Design** | HTML template facture (Tailwind CSS) | P0 | 8 |
| **Send Invoice Email** | Bouton "Envoyer par email" → SendGrid | P0 | 8 |
| **Email Template** | Template HTML email avec facture jointe | P1 | 5 |
| **Email Confirmation** | Log envoi email, confirmation utilisateur | P1 | 3 |
| **PDF Caching** | Cache PDF S3 si pas modifications | P2 | 5 |
| **Send Reminder Email** | Email rappel paiement (future v2) | P2 | 8 |

### Success Criteria

- ✅ PDF généré < 3 secondes
- ✅ PDF contient tous champs requis (client, lignes, total, SIRET)
- ✅ Logo/signature affichés correctement ratio préservé
- ✅ PDF téléchargé avec nom cohérent (FAC-2026-001.pdf)
- ✅ Email livré (not bounced) > 99% taux
- ✅ Template conforme TVA France validé expert
- ✅ PDF preview modal fluid, rapide

### Technical Considerations

- Puppeteer headless Chrome PDF generation
- HTML template Next.js page renderable
- Image compression avant PDF (max 2MB)
- S3 storage optional, filename = invoiceId-timestamp
- SendGrid transactional email API
- Bull/BullMQ async queue pour mails
- Retry logic exponential backoff (5s, 25s, 125s)
- Handlebars templates email
- Rate limit SendGrid 100 req/s
- CDN CloudFront pour assets PDF (optionnel v2)

### KPIs & Metrics

- PDF generation time (target: < 3s)
- Email delivery success rate (target: > 99%)
- Download/send click rate (target: > 80%)
- Email bounce rate (target: < 2%)

### Dependencies

- **Depends on:** EPIC-1 (Core Billing pour invoices)
- **Depends on:** EPIC-5 (User Management pour logo/signature)
- **Enables:** Payment communication, follow-up emails

---

## Epic 5 - User Management & Onboarding

### Epic ID
**EPIC-5** | **User Management, Auth & Onboarding**

### Description
Authentification JWT, gestion profil utilisateur, paramètres facturation (numérotation, devise, CGV), upload logo/signature, et onboarding guidé MVP.

### Business Objectives
- ✅ **Zéro friction** inscription (< 2 min)
- ✅ Onboarding guidé (profil → client → facture → finish)
- ✅ Configuration rapide **< 5 min** avant 1ère facture
- ✅ RGPD compliance (export, delete)

### Scope & Features

| Feature | Description | Priority | Story Points |
|---------|-------------|----------|---------------|
| **User Registration** | Sign-up email + password avec validation | P0 | 8 |
| **User Login** | Email + password login, JWT token | P0 | 5 |
| **Password Reset** | Email reset link (valide 1h) | P0 | 8 |
| **Session Management** | Logout, session 30j, multi-device | P1 | 5 |
| **User Profile View** | Affichage profil utilisateur (panel/page) | P0 | 3 |
| **Update User Profile** | Éditer nom, email, téléphone, adresse | P0 | 3 |
| **SIRET/Company Info** | Entrée SIRET, régime fiscal, Code APE | P0 | 3 |
| **Logo Upload** | Upload image logo, usage en PDF | P1 | 5 |
| **Signature Upload** | Upload image signature, usage en PDF | P1 | 5 |
| **Default Payment Terms** | Param conditions paiement défaut | P1 | 2 |
| **Invoice Number Format** | Customisation format numérotation | P0 | 5 |
| **Currency Preference** | EUR/USD/GBP default, reflète factures | P1 | 2 |
| **Terms & Conditions Template** | Bloc CGV customisable | P1 | 3 |
| **Onboarding Tour** | Guided 4-5 étapes (profil, client, facture) | P1 | 13 |
| **Language/Timezone** | Param langue (FR/EN), timezone | P2 | 3 |
| **GDPR Data Export** | Télécharger JSON toutes données utilisateur | P2 | 5 |
| **Account Deletion** | Supprimer compte + data (RGPD) | P2 | 5 |
| **Email Verification** | Confirmation email avant full access | P2 | 5 |

### Success Criteria

- ✅ Sign-up < 2 minutes, accès immédiat
- ✅ Onboarding crée profil + 1er client + 1ère facture
- ✅ Logo/signature uploadés < 2MB, apparaissent PDF
- ✅ Password reset link valide 1h seulement
- ✅ Logout invalide session complètement
- ✅ Profil modifié reflète factures futures
- ✅ Export JSON contient all data utilisateur
- ✅ Deletion irréversible après 30j delay

### Technical Considerations

- JWT HS256 signed, exp 30 days
- Password bcrypt (cost 10)
- Rate limit sign-up (5/IP/jour)
- Rate limit login (5 tentatives/15min)
- Email verification optional v1 (enable v2)
- Image upload Multer, compression sharp
- Zod schema validation sign-up/profile
- TanStack Query auth context
- localStorage token (NOT secure for XSS, MVP acceptable)
- Future: Secure httpOnly cookie + CSRF token
- GDPR export: JSON dump user+invoices+clients tables

### KPIs & Metrics

- Sign-up conversion rate (target: > 5%)
- Activation rate (target: > 60% créent 3+ factures)
- Onboarding completion (target: > 80%)
- Average time to first invoice (target: < 5min)
- Churn rate (target: < 15%/month)

### Dependencies

- **Foundation:** No dependencies
- **Enables:** All other epics (EPIC-1,2,3,4,6)

---

## Epic 6 - Admin, DevOps & Infrastructure

### Epic ID
**EPIC-6** | **Admin, DevOps & Infrastructure Operations**

### Description
Infrastructure cloud (AWS/DigitalOcean), CI/CD (GitHub Actions), monitoring (CloudWatch), logging, sauvegardes automatiques, et features admin (suivi utilisateurs, KPIs).

### Business Objectives
- ✅ **99.5% SLA uptime**
- ✅ Zero-downtime deploys
- ✅ Rapid incident response (< 1h RTO)
- ✅ Cost-efficient infrastructure (< $500/month v1)

### Scope & Features

| Feature | Description | Priority | Story Points |
|---------|-------------|----------|---------------|
| **Containerization** | Docker image, docker-compose local dev | P1 | 13 |
| **GitHub Actions CI/CD** | Build → Test → Deploy pipeline | P0 | 13 |
| **Database Migrations** | Prisma migrations, version control | P0 | 3 |
| **Environment Config** | .env management, secrets vault | P0 | 3 |
| **Health Check Endpoint** | /api/health, Kubernetes-ready | P0 | 2 |
| **Structured Logging** | Winston JSON logs, CloudWatch integration | P1 | 8 |
| **Error Tracking** | Sentry/Datadog error capture, alerts | P2 | 8 |
| **Performance Monitoring** | APM metrics (latency, throughput) | P2 | 8 |
| **Database Backup** | Automated daily snapshots + PITR | P0 | 5 |
| **Disaster Recovery Plan** | RTO < 1h, documented procedure | P1 | 3 |
| **Admin Dashboard** | Utilisateurs, usage stats, system health | P2 | 13 |
| **Rate Limiting Endpoint** | Redis-backed, 100 req/min per user | P1 | 5 |
| **CORS & Security Headers** | CSP, X-Frame-Options, HSTS | P0 | 3 |
| **SSL/TLS Certificate** | Let's Encrypt auto-renewal | P0 | 2 |
| **CDN Setup** | CloudFront for static assets | P1 | 5 |
| **Load Testing** | k6/JMeter 1000 concurrent users | P2 | 8 |

### Success Criteria

- ✅ Uptime tracked ≥ 99.5% monthly
- ✅ Deploy duration < 10 min zero-downtime
- ✅ Incident response < 1h alerting
- ✅ Database backup automated, tested restore
- ✅ Logs searchable CloudWatch, filterable
- ✅ Health check endpoint responds < 100ms
- ✅ Infrastructure cost < $500/month (v1)
- ✅ Load test handles 1000 concurrent users

### Technical Considerations

- Docker Node 18 alpine base image
- Compose: app, postgres, redis services
- GitHub Actions: push→build→test→deploy
- Prisma migrate deploy pre-start
- Environment: dev, staging, prod separate
- Secrets: GitHub Secrets → deployment envs
- Logging: stdout → CloudWatch Logs
- Health: simple GET /api/health → { status: 'ok' }
- Rate limiter: redis-rate-limit package
- CDN: CloudFront distribution S3/API origin
- SSL: AWS Certificate Manager (auto-renew)
- Monitoring: CloudWatch dashboards, custom metrics
- Backups: RDS automated snapshots, cross-region copy

### KPIs & Metrics

- Uptime % (target: ≥ 99.5%)
- Deploy frequency (target: daily)
- Mean Time to Recovery (MTTR, target: < 1h)
- Error rate (target: < 0.1%)
- Infrastructure cost (target: < $500/month)
- Log search latency (target: < 5s)

### Dependencies

- **Foundation:** Infrastructure prerequisite
- **Enables:** All other epics deployment & monitoring

---

## Epic Dependency Matrix

```
EPIC-5 (User Management)
  ↓
  ├─→ EPIC-1 (Core Billing)
  │    ├─→ EPIC-3 (Payment Tracking)
  │    ├─→ EPIC-4 (PDF & Communication)
  │    └─→ EPIC-6 (Infrastructure)
  │
  ├─→ EPIC-2 (Client Management)
  │    ├─→ EPIC-1 (Core Billing)
  │    └─→ EPIC-3 (Payment Tracking)
  │
  └─→ EPIC-6 (Infrastructure)
       └─→ All other epics deployment
```

### Dependency Summary

| Epic | Depends On | Blocks |
|------|-----------|--------|
| **EPIC-5** | None | All others |
| **EPIC-1** | EPIC-5 | EPIC-3, EPIC-4, EPIC-6 |
| **EPIC-2** | EPIC-5 | EPIC-1, EPIC-3 |
| **EPIC-3** | EPIC-1 | None (Analytics) |
| **EPIC-4** | EPIC-1, EPIC-5 | None (Communication) |
| **EPIC-6** | None | All (Deployment) |

---

## Release Timeline

### Phase 1 - MVP (Q1 2026, Feb-Mar)

**Target Release Date: March 15, 2026**

**Epics in Scope:**
1. ✅ EPIC-5 (User Management) - Weeks 1-2
2. ✅ EPIC-1 (Core Billing) - Weeks 2-5
3. ✅ EPIC-2 (Client Management) - Weeks 3-4
4. ✅ EPIC-4 (PDF & Email, basic) - Week 5
5. ✅ EPIC-6 (Infrastructure, MVP) - Weeks 1-6 parallel

**Epics Deferred to Phase 2:**
- ⏳ EPIC-3 (Payment Tracking) - Partial (KPI cards only, no advanced metrics)

**MVP Features:**
- Registration/Login
- Create/Edit/Emit Invoices (DRAFT→ISSUED→PAID)
- Manage Clients
- Generate PDF (< 3s)
- Send email invoice
- Dashboard KPI basic (Total, Paid, Outstanding)
- Settings (SIRET, logo, signature, number format)

**Team Allocation:**
- Frontend Lead: 1 dev (React/TypeScript/UI)
- Backend Lead: 1 dev (Node/Prisma/Database)
- DevOps/Infrastructure: 0.5 dev shared
- QA: 0.5 tester

---

### Phase 2 (Q2 2026, Apr-May)

**Target Release Date: May 15, 2026**

**Epics in Scope:**
- ✅ EPIC-3 (Payment Tracking, advanced)
- ✅ EPIC-2 (Import/Export CSV)
- ✅ EPIC-1 (Invoice duplication)
- ✅ EPIC-4 (PDF templates, reminders)
- ✅ EPIC-6 (Monitoring, admin dashboard)

**New Features:**
- Advanced payment tracking (overdue, DSO, collection %)
- CSV import/export clients
- Invoice duplication
- Onboarding tour guided
- Admin dashboard (user activity, system health)
- Monitoring & alerting (Sentry, APM)

---

### Phase 3+ (Q3-Q4 2026+)

**Epics in Scope:**
- Devis/Quotes management
- Accounting software integration (XML export)
- Team collaboration & multi-user
- Advanced analytics & reports
- Mobile native app
- Payment gateway (Stripe integration)

---

## Success Metrics by Epic

### EPIC-1: Core Billing
- ✅ 500+ MAU creating invoices
- ✅ 8+ avg invoices/user/month
- ✅ < 0.1% error rate
- ✅ < 200ms API response p95

### EPIC-2: Client Management
- ✅ 500+ users with 1000+ clients
- ✅ 80%+ search adoption
- ✅ < 100ms search latency p95
- ✅ > 90% import success rate

### EPIC-3: Payment Tracking
- ✅ 60%+ dashboard adoption
- ✅ Avg collection rate 85%+
- ✅ Avg DSO < 30 days
- ✅ Dashboard load < 2s

### EPIC-4: PDF & Communication
- ✅ 70%+ users download PDF
- ✅ PDF generation < 3s 100%
- ✅ 99.5%+ email delivery
- ✅ 1-2% bounce rate

### EPIC-5: User Management
- ✅ 500+ signed-up users
- ✅ 60%+ activation rate
- ✅ 75%+ onboarding completion
- ✅ 40%+ D30 retention

### EPIC-6: Infrastructure
- ✅ 99.5% uptime SLA
- ✅ < 10 min deploy time
- ✅ < 1h MTTR incident
- ✅ < $500/month cost

---

## Appendix - Epic Effort Estimates

### Total Effort by Epic (Story Points)

| Epic | Phase | Frontend | Backend | Total | Weeks |
|------|-------|----------|---------|-------|-------|
| EPIC-5 | Phase 1 | 30 | 25 | 55 | 2 |
| EPIC-1 | Phase 1 | 25 | 50 | 75 | 3 |
| EPIC-2 | Phase 1 | 20 | 20 | 40 | 2 |
| EPIC-4 | Phase 1 | 10 | 35 | 45 | 2 |
| EPIC-6 | Phase 1 | 5 | 40 | 45 | 3 |
| **Phase 1 MVP** | | **90** | **170** | **260** | **6 weeks** |
| EPIC-3 | Phase 2 | 20 | 20 | 40 | 2 |
| EPIC-1 (ext) | Phase 2 | 5 | 10 | 15 | 1 |
| EPIC-2 (ext) | Phase 2 | 10 | 10 | 20 | 1 |
| EPIC-4 (ext) | Phase 2 | 5 | 15 | 20 | 1 |
| EPIC-6 (ext) | Phase 2 | 0 | 20 | 20 | 1 |
| **Phase 2** | | **40** | **75** | **115** | **4 weeks** |

### Velocity Estimate
- **Team size:** 2-3 engineers
- **Sprint capacity:** 40-50 story points/sprint (2 weeks)
- **Phase 1 (6 weeks = 3 sprints):** 260 pts / 3 sprints = 87 pts/sprint **AGGRESSIVE**
  - Recommande: 2 pt buffer per sprint
- **Phase 2 (4 weeks = 2 sprints):** 115 pts / 2 sprints = 57 pts/sprint **NOMINAL**

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Document Version** | 1.0 |
| **Last Updated** | 2026-02-16 |
| **Status** | ✏️ DRAFT - Planning |
| **Next Review** | 2026-02-23 (Pre-Sprint Planning) |
| **Audience** | Product, Engineering, Stakeholders |
| **Owner** | Product Manager + Tech Lead |

---

**End of Epic Breakdown Document**
