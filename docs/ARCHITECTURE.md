# Architecture Technique - Application de Facturation PME

**Document Version:** 1.0  
**Date:** 16 février 2026  
**Statut:** Phase Solutioning - FINALISÉ  
**Audience:** Équipe technique, Product, Stakeholders

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#1-vue-densemble)
2. [Stack Technique Recommandé](#2-stack-technique-recommandé)
3. [Architecture C4 - Diagrammes Textuels](#3-architecture-c4---diagrammes-textuels)
4. [Composants Majeurs](#4-composants-majeurs)
5. [Schéma Base de Données Détaillé](#5-schéma-base-de-données-détaillé)
6. [Flux de Données](#6-flux-de-données)
7. [Intégrations Externes](#7-intégrations-externes)
8. [Matrice d'Évaluation Technologique](#8-matrice-dévaluation-technologique)
9. [Performance & Scalabilité](#9-performance--scalabilité)
10. [Sécurité & Conformité](#10-sécurité--conformité)
11. [Déploiement & DevOps](#11-déploiement--devops)

---

## 1. Vue d'Ensemble

### 1.1 Principes Architecturaux

L'application de facturation est conçue selon les principes suivants :

- **Simplicité d'abord** : Stack minimal, zéro complexité non nécessaire
- **Monolithe moderne** : Backend Next.js API routes (Node.js) + frontend React, déployable sur une seule instance
- **Scalabilité horizontale prévue** : Stateless API, BD partitionnée par userId, ready pour multi-instance
- **Sécurité par défaut** : JWT + HTTPS obligatoire, RBAC row-level, audit trail complet
- **DX (Developer Experience) optimisée** : TypeScript strict, Prisma ORM, tests intégrés
- **Coût d'infrastructure faible** : < $500/mois v1 (cloud ou bare metal)

### 1.2 Décisions Archéologiques Clés

| Décision | Rationale | Impact |
|----------|-----------|--------|
| **Next.js 14 full-stack** | React UI + Node API routes, SSR optional, déploiement simple | Monolithe flexible, easy scaling |
| **PostgreSQL relationnelle** | Données structurées (invoices, clients), intégrité ACID, Prisma support | Garanties transactionnelles, query power |
| **JWT stateless auth** | Pas de session server-side, scalable, standard | Stateless API, sessions 30 jours |
| **Puppeteer PDF** | Génération HTML → PDF, haute fidélité design | Performance < 3s, haute qualité visuelle |
| **SendGrid email** | Service géré, délivérabilité garantie, pas de mail server | Fiabilité 99.9%, coûts prévisibles |
| **S3 storage** | Logos/signatures/PDFs, CDN CloudFront | Scalabilité infinie, coûts bas |

---

## 2. Stack Technique Recommandé

### 2.1 Couche Présentation (Frontend)

```
┌─────────────────────────────────────────────────────┐
│ FRONTEND LAYER                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Framework: Next.js 14 (App Router, SSR/SSG)        │
│ UI Library: React 18 (Hooks, Suspense)             │
│ Language: TypeScript 5+ (strict mode)              │
│ CSS: Tailwind CSS 3 + CSS-in-JS (optional)         │
│ Component Library: Shadcn/ui (Radix + Tailwind)   │
│ State Management: TanStack Query + Zustand         │
│ Form Library: React Hook Form + Zod validation     │
│ Icons: Lucide React (300+ icons)                   │
│ Charts: Recharts (lightweight, composable)         │
│ PDF Preview: React-pdf + Puppeteer                │
│ HTTP Client: Fetch API (modern, native)            │
│ Testing: Jest + React Testing Library              │
│                                                     │
│ Build Tool: Turbopack (Next.js built-in)           │
│ Package Manager: npm (ou pnpm)                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Justification du choix :**
- Next.js : SSR optional, API routes intégrées, déploiement simplifié
- React : Écosystème mature, large communauté, DX excellente
- Shadcn/ui : Composants unstyled + Tailwind, personnalisable, accessible
- TypeScript : Sécurité type, refactoring confident, documentation auto
- TanStack Query : Caching, sync états serveur, réduction boilerplate

### 2.2 Couche API & Logique Métier (Backend)

```
┌─────────────────────────────────────────────────────┐
│ BACKEND LAYER                                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Runtime: Node.js 18+ LTS (ES modules)              │
│ Framework: Next.js API Routes (ou Express optionnel)
│ Language: TypeScript 5+ (strict mode)              │
│ ORM: Prisma 5+ (type-safe, migrations auto)        │
│ Validation: Zod + Custom middleware                │
│ Auth: jsonwebtoken (JWT) + bcrypt (hash pwd)       │
│ Async Jobs: Bull/BullMQ (Redis-backed queues)      │
│ Email: SendGrid SDK (async via queues)             │
│ PDF Generation: Puppeteer + pdfkit (hybrid)        │
│ Logging: Winston + structured JSON logs            │
│ Monitoring: OpenTelemetry (optional, v2)           │
│ Testing: Jest + Supertest (API integration)        │
│                                                     │
│ Build Tool: SWC (transpilation rapide)             │
│ Package Manager: npm (ou pnpm)                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Justification du choix :**
- Node.js : Async-first, lightweight, écosystème npm mature
- Next.js API Routes : Zéro config, collocated avec frontend, facile à tester
- Prisma ORM : Type safety, migrations auto, query optimization, beautiful DX
- JWT : Stateless, scalable, standard industrie (OAuth2 compatible)
- Bull for async jobs : Redis-backed, retries, deadletter handling

### 2.3 Couche Données (Database)

```
┌─────────────────────────────────────────────────────┐
│ DATA LAYER                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Primary Database: PostgreSQL 15+ (ACID compliance) │
│ - Hosted: AWS RDS, DigitalOcean, Heroku, ou bare  │
│ - Backup: Automated daily snapshots + PITR        │
│ - Replication: Multi-AZ pour HA                    │
│                                                     │
│ Cache Layer: Redis 7+ (sessions, rate-limit)       │
│ - Hosted: AWS ElastiCache, Redis Cloud, ou bare   │
│ - TTL: Session 30d, cache queries 1h               │
│                                                     │
│ Search (future): Elasticsearch / Meilisearch       │
│ - Current: PostgreSQL full-text search (v1)        │
│                                                     │
│ File Storage: AWS S3 (ou DigitalOcean Spaces)      │
│ - CDN: CloudFront (ou DigitalOcean CDN)            │
│ - Logos, signatures, PDFs générés                  │
│                                                     │
│ Database Client: Prisma (via Next.js)              │
│ Connection Pooling: PgBouncer (PgPool in Prisma)   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Justification du choix :**
- PostgreSQL : ACID, intégrité de données, jsonb fields, full-text search natif
- Redis : Sessions, caching, rate-limiting, BullMQ job queues
- S3 : Scalable, cheap, CDN intégré, versioning + lifecycle policies

### 2.4 Infrastructure & DevOps

```
┌─────────────────────────────────────────────────────┐
│ INFRASTRUCTURE                                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Hosting Options (par préférence):                   │
│ 1. AWS (Elastic Container Service + RDS)           │
│ 2. Vercel (Deploy Next.js, serverless optional)    │
│ 3. DigitalOcean (VPS + Managed DB, cheaper)        │
│ 4. Heroku (Platform-as-a-Service, simplest)        │
│ 5. Render.com (Heroku alternative, free tier)      │
│                                                     │
│ Reverse Proxy: Nginx (ou AWS ALB)                  │
│ SSL/TLS: Let's Encrypt (ou AWS ACM)                │
│ CDN: CloudFront (ou DigitalOcean CDN)              │
│ DNS: Route53 (ou Cloudflare)                       │
│                                                     │
│ CI/CD: GitHub Actions (gratuit pour public)        │
│ - Build: npm install → next build                  │
│ - Test: jest --coverage                            │
│ - Deploy: git push → auto-deploy                   │
│                                                     │
│ Container: Docker (optional, pour self-hosted)     │
│ - Base: node:18-alpine (slim)                      │
│ - Compose: local dev + deployment                  │
│                                                     │
│ Monitoring: CloudWatch (AWS) ou Datadog (optional) │
│ Logging: Stdout (container logs) + optional ELK    │
│ APM: New Relic ou DataDog (v2)                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 3. Architecture C4 - Diagrammes Textuels

### 3.1 C4 Level 1 - System Context

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   [External Users]                                          │
│   (Freelances, PME)                                         │
│          │                                                  │
│          │ Uses (HTTPS)                                     │
│          │                                                  │
│          ▼                                                  │
│   ┌──────────────────────────┐                             │
│   │  Invoicing Application   │                             │
│   │  (Web + Mobile Responsive)│                             │
│   │  ┌────────────────────┐  │                             │
│   │  │ Create & manage    │  │                             │
│   │  │ invoices, clients, │  │                             │
│   │  │ track payments     │  │                             │
│   │  └────────────────────┘  │                             │
│   └────────┬──────────┬──────┘                             │
│            │          │                                    │
│      (sends emails)  (stores files)                        │
│            │          │                                    │
│            ▼          ▼                                    │
│   [Email Service]  [Cloud Storage]                        │
│   (SendGrid/SES)   (AWS S3)                               │
│                                                            │
│   [External: Payment Gateway] (future v2)                 │
│   (Stripe, Wise)                                          │
│                                                            │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 C4 Level 2 - Container Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    INVOICING APPLICATION SYSTEM                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────┐                                            │
│  │  User Device        │                                            │
│  │  ┌───────────────┐  │                                            │
│  │  │  Web Browser  │  │  (Chrome, Firefox, Safari, Edge)          │
│  │  │  Single Page  │  │  React 18 + Next.js Client Components    │
│  │  │  Application  │  │  (Responsive, PWA-ready)                  │
│  │  └───────────────┘  │                                            │
│  │         │           │                                            │
│  │  REST/JSON over     │                                            │
│  │    HTTPS            │                                            │
│  │         │           │                                            │
│  └─────────┼───────────┘                                            │
│            │                                                        │
│            ▼                                                        │
│  ┌───────────────────────────────────────────────────────────┐    │
│  │          API GATEWAY & LOAD BALANCER                      │    │
│  │  (AWS ALB / Nginx)                                        │    │
│  │  - HTTPS/TLS termination                                  │    │
│  │  - Rate limiting                                          │    │
│  │  - CORS headers                                           │    │
│  │  - Health checks                                          │    │
│  └───────┬─────────────────────────┬───────────┬─────────────┘    │
│          │                         │           │                  │
│  (Horizontal scaling)               │           │                  │
│          │                         │           │                  │
│  ┌───────▼────┐  ┌────────────┐  ┌─▼────────┐  │                  │
│  │  API       │  │    API     │  │   API    │  │                  │
│  │ Instance 1 │  │ Instance 2 │  │ Instance N  │  (Stateless)     │
│  │            │  │            │  │          │  │                  │
│  │ Node.js +  │  │ Node.js +  │  │ Node.js +   │                  │
│  │ Next.js    │  │ Next.js    │  │ Next.js    │                  │
│  │ + Prisma   │  │ + Prisma   │  │ + Prisma   │  (Auto-scaling)  │
│  │            │  │            │  │          │  │                  │
│  │ Routes:    │  │ Routes:    │  │ Routes:   │  │                  │
│  │ /api/*     │  │ /api/*     │  │ /api/*    │  │                  │
│  │            │  │            │  │          │  │                  │
│  └────┬───────┘  └────┬───────┘  └────┬─────┘  │                  │
│       │                │               │       │                  │
│       └────────────────┼───────────────┘       │                  │
│                        │                       │                  │
│  ┌─────────────────────┼───────────────────────┼──────────────┐  │
│  │                     │                       │              │  │
│  ├─────────────────────▼──────────────────────────────────────┤  │
│  │ DATA LAYER                                                 │  │
│  ├────────────┬────────────────┬────────────────┬─────────────┤  │
│  │            │                │                │             │  │
│  │ PostgreSQL │  Redis Cache   │  AWS S3        │ Audit Logs  │  │
│  │ (Master)   │  (Sessions +   │  (Logos, PDF,  │ (CloudWatch)│  │
│  │            │   rate-limit)  │   Signatures)  │             │  │
│  │ Tables:    │                │                │             │  │
│  │ users      │ TTL:           │ CDN: CloudFront│ JSON logs   │  │
│  │ invoices   │ Session: 30d   │                │ per action  │  │
│  │ clients    │ Queries: 1h    │ Versioning:    │             │  │
│  │ line_items │                │ enabled        │             │  │
│  │ audit_logs │                │                │             │  │
│  │            │                │                │             │  │
│  └────────────┴────────────────┴────────────────┴─────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ EXTERNAL INTEGRATIONS                                    │  │
│  ├──────────────────────┬──────────────────────────────────┤  │
│  │                      │                                  │  │
│  │ SendGrid Email       │  Stripe Payments (future v2)    │  │
│  │ (Async via Bull)     │  - Payment links                │  │
│  │ - Invoice emails     │  - Webhook callbacks            │  │
│  │ - Payment reminders  │  - Reconciliation               │  │
│  │ - Delivery tracking  │                                  │  │
│  │                      │  Services (future):              │  │
│  │                      │  - Accounting software           │  │
│  │                      │  - Bank connectors               │  │
│  │                      │  - Tax reporting                 │  │
│  │                      │                                  │  │
│  └──────────────────────┴──────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3 C4 Level 3 - Component Architecture (Backend)

```
┌──────────────────────────────────────────────────────────────────┐
│                 API BACKEND (Next.js App Router)                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ API ROUTES (pages/api/ or app/api/)                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ Auth Routes:                                            │   │
│  │  POST   /api/auth/register                             │   │
│  │  POST   /api/auth/login                                │   │
│  │  POST   /api/auth/logout                               │   │
│  │  POST   /api/auth/reset-password                       │   │
│  │  POST   /api/auth/refresh                              │   │
│  │                                                         │   │
│  │ Invoice Routes:                                         │   │
│  │  GET    /api/invoices                 (list + filter)  │   │
│  │  POST   /api/invoices                 (create draft)   │   │
│  │  GET    /api/invoices/:id             (detail)         │   │
│  │  PUT    /api/invoices/:id             (update draft)   │   │
│  │  DELETE /api/invoices/:id             (soft delete)    │   │
│  │  POST   /api/invoices/:id/emit        (DRAFT→ISSUED)   │   │
│  │  POST   /api/invoices/:id/pay         (mark paid)      │   │
│  │  GET    /api/invoices/:id/pdf         (gen PDF)        │   │
│  │  POST   /api/invoices/:id/send        (email)          │   │
│  │                                                         │   │
│  │ Client Routes:                                          │   │
│  │  GET    /api/clients                  (list + search)  │   │
│  │  POST   /api/clients                  (create)         │   │
│  │  GET    /api/clients/:id              (detail)         │   │
│  │  PUT    /api/clients/:id              (update)         │   │
│  │  DELETE /api/clients/:id              (archive)        │   │
│  │  POST   /api/clients/import           (CSV)            │   │
│  │                                                         │   │
│  │ Dashboard Routes:                                       │   │
│  │  GET    /api/dashboard/summary        (KPIs)           │   │
│  │  GET    /api/dashboard/outstanding    (impayées)       │   │
│  │  GET    /api/dashboard/overdue        (retard)         │   │
│  │                                                         │   │
│  │ User Routes:                                            │   │
│  │  GET    /api/me                       (profile)        │   │
│  │  PUT    /api/me                       (update)         │   │
│  │  POST   /api/me/upload-logo           (logo)           │   │
│  │  DELETE /api/me                       (delete account) │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MIDDLEWARE & UTILITIES                                  │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ Auth Middleware:                                        │   │
│  │  - verifyJWT (token validation)                        │   │
│  │  - requireAuth (throw 401 if no token)                │   │
│  │  - optionalAuth (attach user if token present)        │   │
│  │  - RBAC check (role-based access control)             │   │
│  │                                                         │   │
│  │ Validation:                                             │   │
│  │  - zodRequest (query/body schema validation)           │   │
│  │  - Custom validators (SIRET format, email, etc)        │   │
│  │                                                         │   │
│  │ Error Handling:                                         │   │
│  │  - ApiError (custom error class)                       │   │
│  │  - Global error boundary middleware                    │   │
│  │  - Structured error responses (code, message, details) │   │
│  │                                                         │   │
│  │ Rate Limiting:                                          │   │
│  │  - Redis-backed rate limiter                           │   │
│  │  - Per-IP, per-user limits                             │   │
│  │  - 429 Too Many Requests response                      │   │
│  │                                                         │   │
│  │ Logging:                                                │   │
│  │  - Winston logger (structured JSON)                    │   │
│  │  - Request/response logging                            │   │
│  │  - Error stack traces                                  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ BUSINESS LOGIC SERVICES                                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ InvoiceService:                                         │   │
│  │  - create(userId, data) → draft invoice               │   │
│  │  - update(userId, id, data) → update if draft         │   │
│  │  - emit(userId, id) → mark ISSUED (atomic)            │   │
│  │  - markPaid(userId, id, date, amount) → update status │   │
│  │  - getStats(userId) → aggregate metrics               │   │
│  │                                                         │   │
│  │ ClientService:                                          │   │
│  │  - create(userId, data) → new client                  │   │
│  │  - search(userId, term) → full-text search            │   │
│  │  - archive(userId, id) → soft delete                  │   │
│  │  - import(userId, csvBuffer) → batch insert           │   │
│  │                                                         │   │
│  │ PDFService:                                             │   │
│  │  - generatePDF(invoiceId) → Uint8Array                │   │
│  │  - Uses Puppeteer + HTML template                     │   │
│  │  - Caches in S3 with ETag                             │   │
│  │                                                         │   │
│  │ EmailService:                                           │   │
│  │  - sendInvoice(invoiceId, to) → SendGrid API call     │   │
│  │  - sendReminder(invoiceId) → reminder template        │   │
│  │  - Queued via Bull (async, retries)                   │   │
│  │                                                         │   │
│  │ AuthService:                                            │   │
│  │  - register(email, password) → create user            │   │
│  │  - login(email, password) → return JWT token          │   │
│  │  - resetPassword(email, token, newPwd) → update       │   │
│  │                                                         │   │
│  │ StorageService:                                         │   │
│  │  - uploadLogo(userId, file) → S3 + return URL         │   │
│  │  - getSignedUrl(path, expires) → CloudFront URL       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ DATABASE ACCESS (Prisma ORM)                            │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ Prisma Client:                                          │   │
│  │  - Automatically type-safe queries                     │   │
│  │  - Connection pooling (PgPool)                         │   │
│  │  - Prepared statements (SQL injection safe)            │   │
│  │  - Transaction support for atomic operations           │   │
│  │                                                         │   │
│  │ Models:                                                 │   │
│  │  - User, Invoice, Client, LineItem, AuditLog         │   │
│  │                                                         │   │
│  │ Custom Queries:                                         │   │
│  │  - Raw SQL for complex aggregations (stats)           │   │
│  │  - Cached in Redis (1 hour TTL)                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 3.4 C4 Level 3 - Component Architecture (Frontend)

```
┌──────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js App + React)                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PAGES & LAYOUTS (App Router)                            │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ Public Routes:                                          │   │
│  │  /(auth)/login         → LoginPage component          │   │
│  │  /(auth)/register      → RegisterPage component        │   │
│  │  /(auth)/reset         → ResetPasswordPage component   │   │
│  │                                                         │   │
│  │ Protected Routes (requireAuth middleware):             │   │
│  │  /(app)/dashboard      → DashboardPage (overview)     │   │
│  │  /(app)/invoices       → InvoicesPage (list)          │   │
│  │  /(app)/invoices/create → CreateInvoicePage          │   │
│  │  /(app)/invoices/[id]  → InvoiceDetailPage           │   │
│  │  /(app)/clients        → ClientsPage (list)           │   │
│  │  /(app)/clients/create → CreateClientPage            │   │
│  │  /(app)/settings       → SettingsPage (with tabs)     │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ COMPONENTS (React)                                      │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ Layout Components:                                      │   │
│  │  - AppLayout (navbar, sidebar, main content)           │   │
│  │  - AuthLayout (centered form layout)                   │   │
│  │  - DashboardLayout (widgets, spacing)                  │   │
│  │                                                         │   │
│  │ Shared Components (UI Library):                         │   │
│  │  - Button, Input, Select, Checkbox, Radio             │   │
│  │  - Card, Alert, Badge, Modal, Drawer                  │   │
│  │  - Table, Pagination, Tabs, Breadcrumbs               │   │
│  │  - Form (React Hook Form integration)                 │   │
│  │  - Spinner, Toast notifications                       │   │
│  │                                                         │   │
│  │ Feature Components:                                     │   │
│  │  - InvoiceForm (create/edit with auto-save)           │   │
│  │  - LineItemsTable (add/remove rows, calc)             │   │
│  │  - InvoiceList (table with filters, sorting)          │   │
│  │  - ClientForm (create/edit)                           │   │
│  │  - DashboardCards (KPI metrics)                       │   │
│  │  - DownloadPDFButton, SendEmailButton                 │   │
│  │  - OutstandingInvoices (filtered view)                │   │
│  │                                                         │   │
│  │ All components:                                         │   │
│  │  - Accessible (WCAG 2.1 AA)                            │   │
│  │  - Responsive (mobile-first design)                    │   │
│  │  - Typed with TypeScript                               │   │
│  │  - Tested with React Testing Library                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ STATE MANAGEMENT & DATA FETCHING                        │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ TanStack Query (React Query):                           │   │
│  │  - Fetching & caching API responses                    │   │
│  │  - Automatic invalidation & refetching                 │   │
│  │  - Background updates (polling)                        │   │
│  │  - Optimistic updates for better UX                    │   │
│  │  - useQuery, useMutation hooks                         │   │
│  │                                                         │   │
│  │ Zustand (Lightweight state):                            │   │
│  │  - User auth state (token, user data)                  │   │
│  │  - Filter state (dashboard, invoices list)             │   │
│  │  - UI state (modal open, sidebar collapsed)            │   │
│  │                                                         │   │
│  │ React Hook Form:                                        │   │
│  │  - Form state management                               │   │
│  │  - Validation with Zod schemas                         │   │
│  │  - Efficient re-renders (field-level)                  │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ STYLING & THEME                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ Tailwind CSS:                                           │   │
│  │  - Utility-first CSS framework                         │   │
│  │  - Dark mode support (optional v2)                     │   │
│  │  - Responsive breakpoints                              │   │
│  │  - Custom color palette (design system)                │   │
│  │                                                         │   │
│  │ Shadcn/ui Components:                                  │   │
│  │  - Pre-built, composable components                    │   │
│  │  - Copy-paste model (not npm package)                  │   │
│  │  - Full control over styling                           │   │
│  │                                                         │   │
│  │ Theme System:                                           │   │
│  │  - CSS variables for colors, spacing, fonts            │   │
│  │  - Centralized in tailwind.config.ts                   │   │
│  │  - Easy customization per brand                        │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ UTILITIES & HELPERS                                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │ API Client:                                             │   │
│  │  - Fetch wrapper with auth token injection             │   │
│  │  - Error handling & toast notifications                │   │
│  │  - Base URL configuration                              │   │
│  │                                                         │   │
│  │ formatters:                                             │   │
│  │  - formatCurrency(€, 2 decimals)                       │   │
│  │  - formatDate(locale-aware)                            │   │
│  │  - formatPhoneNumber                                   │   │
│  │                                                         │   │
│  │ validators:                                             │   │
│  │  - Email, SIRET, URL validation (client-side)          │   │
│  │  - Integrated with React Hook Form                     │   │
│  │                                                         │   │
│  │ hooks (custom):                                         │   │
│  │  - useAuth (get user, login, logout)                   │   │
│  │  - useInvoices (CRUD operations)                       │   │
│  │  - useClients (CRUD operations)                        │   │
│  │  - useDashboard (fetch KPIs)                           │   │
│  │  - useLocalStorage (persist state)                     │   │
│  │  - useDebounce (optimize search)                       │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Composants Majeurs

### 4.1 Module d'Authentification

**Responsabilités:**
- Enregistrement utilisateur (email + mot de passe)
- Authentification JWT (exp 30 jours)
- Réinitialisation mot de passe (email link)
- Rate limiting (5 tentatives login par IP)

**Flux:**
1. User registre → email + password hachés (bcrypt) → JWT signé
2. User login → validation credentials → JWT retourné → localStorage
3. Requête API → attach JWT dans Authorization header
4. Middleware valide JWT → 401 si invalide/expiré
5. Token expiré → call /api/auth/refresh → nouveau token

**Sécurité:**
- JWT signé avec HS256 + secret strong
- Password min 8 chars, hachés via bcrypt (cost 10)
- HTTPS obligatoire (env.NEXT_PUBLIC_API_URL doit être https://)
- Token stocké en localStorage (NOT secure pour XSS, mais acceptable MVP)
- CSRF token optionnel (SameSite cookies suffisant)

### 4.2 Module Factures

**Responsabilités:**
- CRUD factures (brouillon, émise, payée)
- Calcul automatique TVA + totaux
- Numérotation atomique (pas de doublons)
- Statuts workflow (DRAFT → ISSUED → PAID/CANCELLED)

**Flux:**
1. User crée facture → status DRAFT, sauvegardé en DB
2. User ajoute lignes articles → calculs TVA temps réel (frontend)
3. User clique "Emit" → status DRAFT → ISSUED, issued_at = now, **read-only**
4. User marque payée → status ISSUED → PAID, paidAt = date, paidAmount = amount
5. Dashboard recalcule KPIs (aggregate invoices WHERE status = PAID, etc)

**Validation:**
- Montant min 0€, max 1M€
- TVA rates: 0%, 5.5%, 20% (France uniquement MVP)
- Date due >= date issue
- Client must exist
- Status transitions atomique (Prisma transaction)

**Performance:**
- Auto-save toutes les 10s (frontend local state)
- Debounce API calls (300ms)
- Cache queries 1h (Redis)
- PDF generation < 3s (Puppeteer)

### 4.3 Module Clients

**Responsabilités:**
- CRUD clients (name, email, address, SIRET)
- Recherche full-text (nom, email, SIRET)
- Soft-delete avec archivage
- Import/export CSV

**Flux:**
1. User crée client → stored in DB, linked to userId
2. User cherche client → PostgreSQL full-text search
3. User crée facture → sélectionne client dans dropdown (live search)
4. User archive client → soft-delete (not deleted, isArchived=true)
5. Factures existantes restent liées (client peut être réactivé)

**Validation:**
- Email format validation
- SIRET: regex ^[0-9]{14}$ optionnel
- Name: 2-100 chars, required
- Phone: optional, regex validation

**CSV Import:**
- Format: name, email, address, siret, phone
- Max 5000 lignes
- Rapport d'erreurs (line number, error message)
- Rollback si erreur validations

### 4.4 Module PDF Generation

**Responsabilités:**
- Transformer facture en PDF professionnel
- Inclure logo, signature utilisateur
- Respecter format légal France (SIRET, TVA)
- Performant < 3s

**Technologie:**
- Puppeteer (headless Chrome) OU pdfkit
- Template HTML/CSS (Next.js page component ou HTML string)
- Optionnel: wkhtmltopdf (deprecated, avoid)

**Flux:**
1. User clique "Download PDF" ou "Send Email"
2. Backend génère HTML rendering facture (template)
3. Puppeteer convertit HTML → PDF buffer (≈2s)
4. Optionnel: cache PDF en S3 avec ETag (si pas de modifications)
5. Retour PDF au client (Content-Disposition: attachment)

**Template includes:**
- Company logo (top left, max 2MB)
- Invoice number, date, due date
- Client info (name, email, address)
- Line items table (description, qty, price, tax, total)
- Subtotal HT, Tax, Discount, Total TTC
- Terms & Conditions
- Company SIRET/SIREN, signature, bank details

### 4.5 Module Email

**Responsabilités:**
- Envoyer emails factures aux clients
- Rappels paiement (v2)
- Notifications utilisateurs

**Technologie:**
- SendGrid transactional email
- Bull/BullMQ pour async queues (Redis-backed)
- Email templates (Handlebars syntax)

**Flux:**
1. User clique "Send Email"
2. API crée job dans Bull queue
3. Worker récupère job → appel SendGrid API
4. Email envoyé avec PDF joint
5. Webhook SendGrid → log status (delivered, opened, bounced)
6. Log archivé en audit_logs table

**Retry Logic:**
- Exponential backoff: 5s, 25s, 125s, 625s
- Max 5 retries
- Deadletter queue pour emails échoués

### 4.6 Module Dashboard & Analytics

**Responsabilités:**
- KPIs temps réel (Total facturé, Payé, Impayé, Retard)
- Vue Outstanding Invoices (impayées)
- Vue Overdue Invoices (en retard)
- Graphiques tendances revenue

**Flux:**
1. User ouvre dashboard
2. Frontend appel /api/dashboard/summary
3. Backend agrège invoices (somme status=PAID, date range, etc)
4. Cache en Redis 5 minutes
5. Retour JSON {totalInvoiced, totalPaid, totalOutstanding, totalOverdue, metrics}
6. Frontend render KPI cards + widgets

**Calculs:**
- **Total Invoiced** = SUM(total WHERE status IN (ISSUED, PAID))
- **Total Paid** = SUM(total WHERE status = PAID)
- **Outstanding** = SUM(total WHERE status = ISSUED AND dueDate >= today)
- **Overdue** = SUM(total WHERE status = ISSUED AND dueDate < today)
- **Collection %** = totalPaid / totalInvoiced * 100
- **Days to Pay (DSO)** = AVG(daysToPayment) for paid invoices

---

## 5. Schéma Base de Données Détaillé

### 5.1 Schema SQL (PostgreSQL)

```sql
-- ==========================================
-- USERS TABLE
-- ==========================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  
  -- Profile
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  
  -- Company info
  company_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'FR',
  
  -- Legal info
  siret VARCHAR(14),
  siren VARCHAR(9),
  tax_regime VARCHAR(50), -- MICROENTREPRENEUR, EIRL, SARL, EURL, etc
  code_ape VARCHAR(10),
  
  -- Settings
  currency VARCHAR(3) DEFAULT 'EUR',
  language VARCHAR(2) DEFAULT 'FR',
  timezone VARCHAR(50) DEFAULT 'Europe/Paris',
  default_payment_terms VARCHAR(50) DEFAULT 'NET_30',
  
  -- Invoice numbering
  invoice_number_format VARCHAR(50) DEFAULT 'FAC-YYYY-NNN',
  next_invoice_number BIGINT DEFAULT 1,
  
  -- Assets (S3 paths)
  logo_url VARCHAR(500),
  signature_url VARCHAR(500),
  
  -- Legal documents
  terms_and_conditions TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_email_unique UNIQUE(email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ==========================================
-- CLIENTS TABLE
-- ==========================================
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(2) DEFAULT 'FR',
  
  siret_siren VARCHAR(14),
  tax_id VARCHAR(50),
  
  notes TEXT,
  
  is_favorite BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT clients_pkey PRIMARY KEY (id),
  CONSTRAINT clients_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_name_fulltext ON clients USING gin(to_tsvector('french', name));
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_archived ON clients(is_archived);
CREATE INDEX idx_clients_created_at ON clients(created_at DESC);

-- ==========================================
-- INVOICES TABLE
-- ==========================================
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  
  invoice_number VARCHAR(50) NOT NULL UNIQUE,
  po_number VARCHAR(50),
  
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
  
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED')),
  
  -- Amounts (in cents or decimal, using DECIMAL for accuracy)
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0, -- HT (before tax)
  tax_amount DECIMAL(12, 2) NOT NULL DEFAULT 0, -- Total TVA
  discount_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0, -- TTC (after tax)
  
  -- Payment tracking
  paid_at TIMESTAMP WITH TIME ZONE,
  paid_amount DECIMAL(12, 2), -- Montant payé (peut être partiel)
  payment_method VARCHAR(50), -- BANK_TRANSFER, CARD, CHECK, CRYPTO, MANUAL
  payment_notes TEXT,
  
  -- Document content
  internal_notes TEXT,
  terms_and_conditions TEXT,
  
  -- Audit trail
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  issued_at TIMESTAMP WITH TIME ZONE,
  
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT invoices_pkey PRIMARY KEY (id),
  CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT invoices_client_id_fkey FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
  CONSTRAINT invoices_created_by_fkey FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT invoices_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_created_at ON invoices(created_at DESC);
CREATE INDEX idx_invoices_user_status ON invoices(user_id, status);
CREATE INDEX idx_invoices_user_date ON invoices(user_id, created_at DESC);

-- ==========================================
-- INVOICE LINE ITEMS TABLE
-- ==========================================
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  -- Line content
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL,
  
  -- Tax
  tax_rate DECIMAL(5, 3) NOT NULL DEFAULT 0.20, -- 0.20 = 20%, 0.055 = 5.5%, 0 = 0%
  
  -- Calculated
  line_total DECIMAL(12, 2) NOT NULL, -- quantity * unit_price * (1 + tax_rate)
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT invoice_line_items_pkey PRIMARY KEY (id),
  CONSTRAINT invoice_line_items_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);

-- ==========================================
-- AUDIT LOGS TABLE
-- ==========================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  entity_type VARCHAR(50) NOT NULL, -- INVOICE, CLIENT, USER, etc
  entity_id UUID NOT NULL,
  
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, EMIT, MARK_PAID, etc
  
  old_values JSONB, -- before values (for UPDATE/DELETE)
  new_values JSONB, -- after values (for CREATE/UPDATE)
  
  changes JSONB, -- diff: {"field_name": {"old": "", "new": ""}}
  
  ip_address VARCHAR(45), -- IPv4 or IPv6
  user_agent TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ==========================================
-- PAYMENT REMINDERS TABLE (future v2)
-- ==========================================
CREATE TABLE payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  
  sent_at TIMESTAMP WITH TIME ZONE,
  reminder_count SMALLINT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT payment_reminders_pkey PRIMARY KEY (id),
  CONSTRAINT payment_reminders_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ==========================================
-- MIGRATION COMMENTS
-- ==========================================
COMMENT ON TABLE users IS 'User accounts with company information and settings';
COMMENT ON TABLE clients IS 'Client/customer database linked to users';
COMMENT ON TABLE invoices IS 'Invoices with status tracking and payment info';
COMMENT ON TABLE invoice_line_items IS 'Line items breakdown for invoices';
COMMENT ON TABLE audit_logs IS 'Audit trail for compliance and debugging';
```

### 5.2 Relationships & Constraints

```
users (1) ──────────(N) clients
  └─ Each user has many clients
  └─ Cascade delete: delete user → delete clients

users (1) ──────────(N) invoices
  └─ Each user owns many invoices
  └─ Cascade delete: delete user → delete invoices

clients (1) ──────────(N) invoices
  └─ Each client linked to many invoices
  └─ Restrict delete: can't delete client with outstanding invoices

invoices (1) ──────────(N) invoice_line_items
  └─ Each invoice has many line items
  └─ Cascade delete: delete invoice → delete line items

users (1) ──────────(N) audit_logs
  └─ Audit trail of user actions
  └─ Set null delete: user deleted but logs preserved
```

### 5.3 Partitioning Strategy (Future Scaling)

Pour > 1M invoices, implémenter partitioning par userId:

```sql
-- Create partitioned table (PostgreSQL 14+)
CREATE TABLE invoices_partitioned (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  -- ... autres colonnes
  PRIMARY KEY (id, user_id)
) PARTITION BY HASH (user_id);

-- Create 16 partitions (initial)
CREATE TABLE invoices_part_0 PARTITION OF invoices_partitioned
  FOR VALUES WITH (MODULUS 16, REMAINDER 0);
-- ... repeat for partitions 1-15

-- Allows PostgreSQL optimizer to prune partitions based on user_id
-- Improves query performance for large tables
```

---

## 6. Flux de Données

### 6.1 Flux Authentication

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ 1. POST /api/auth/login
       │    {email, password}
       ▼
┌──────────────────────────┐
│  API Server              │
│  1. Hash password        │
│  2. Compare with stored  │
│  3. Generate JWT         │
│  4. Return {token, user} │
└──────┬───────────────────┘
       │
       │ 2. {token, user}
       ▼
┌─────────────┐
│  Client     │
│  Store      │
│  - JWT in   │
│    localStorage
│  - User in  │
│    Zustand  │
└──────┬──────┘
       │
       │ 3. Subsequent API calls
       │    Authorization: Bearer <token>
       ▼
┌──────────────────────────┐
│  API Server Middleware   │
│  verifyJWT():            │
│  - Decode token          │
│  - Check signature       │
│  - Check expiry          │
│  - Attach user to request│
└──────┬───────────────────┘
       │
       │ OK → proceed, 401 if invalid
       ▼
┌──────────────────────────┐
│  Protected Route Handler │
└──────────────────────────┘
```

### 6.2 Flux Invoice Creation & Emission

```
USER ACTION → [Frontend State] → [API] → [Database] → [Cache] → [UI Update]

Step 1: CREATE DRAFT
┌─ User fills form (client, lines, amounts)
├─ Frontend auto-calculates TVA, totals (local)
├─ POST /api/invoices {data}
├─ Backend:
│  ├─ Validate data (Zod schema)
│  ├─ Transaction:
│  │  ├─ Generate next invoice number (atomically)
│  │  ├─ INSERT invoice (status=DRAFT)
│  │  ├─ INSERT line_items (batch)
│  │  ├─ INSERT audit_log (CREATE action)
│  │  └─ COMMIT
│  ├─ Clear cache (user's invoice list)
│  └─ Return invoice {id, number, ...}
├─ Frontend: show toast "Invoice created"
└─ UI updates invoice list

Step 2: EDIT DRAFT
┌─ User edits invoice (only if DRAFT)
├─ Frontend debounce (300ms) → save button OR auto-save
├─ PUT /api/invoices/:id {data}
├─ Backend:
│  ├─ Check status = DRAFT (throw 403 if not)
│  ├─ Validate data
│  ├─ Transaction:
│  │  ├─ UPDATE invoice
│  │  ├─ DELETE old line_items
│  │  ├─ INSERT new line_items
│  │  ├─ INSERT audit_log (UPDATE + changes)
│  │  └─ COMMIT
│  ├─ Clear cache
│  └─ Return updated invoice
├─ Frontend: update local state
└─ Auto-save every 10s in background

Step 3: EMIT (DRAFT → ISSUED)
┌─ User clicks "Emit Invoice"
├─ Show confirmation modal
├─ POST /api/invoices/:id/emit
├─ Backend:
│  ├─ Check status = DRAFT
│  ├─ Transaction:
│  │  ├─ UPDATE invoice (status=ISSUED, issued_at=NOW)
│  │  ├─ INSERT audit_log (EMIT action)
│  │  └─ COMMIT
│  ├─ Clear cache
│  └─ Return updated invoice
├─ Frontend: redirect to detail page
├─ Show toast: "Invoice emitted successfully"
└─ Invoice now read-only (PUT disabled)

Step 4: VIEW PDF
┌─ User clicks "Download PDF" or "Preview"
├─ GET /api/invoices/:id/pdf
├─ Backend:
│  ├─ Check S3 cache (ETag)
│  ├─ If miss OR modified:
│  │  ├─ Fetch invoice + client + line_items from DB
│  │  ├─ Render HTML template (Next.js Page Component)
│  │  ├─ Puppeteer: HTML → PDF (< 3s)
│  │  ├─ Upload S3 (with ETag, cache 7 days)
│  │  └─ Return Content-Type: application/pdf
│  └─ If hit: return S3 stream
├─ Frontend: display PDF or download
└─ POST to emit creates PDF immediately (async job)

Step 5: SEND EMAIL
┌─ User clicks "Send Email"
├─ Optional: show email editor (template, message)
├─ POST /api/invoices/:id/send {to, message}
├─ Backend:
│  ├─ Queue job (Bull) {invoiceId, to, message, attachPdf}
│  ├─ Return {jobId, status}
│  ├─ Worker (async):
│  │  ├─ Fetch invoice, PDF
│  │  ├─ Render email template (Handlebars)
│  │  ├─ SendGrid API call (with PDF attachment)
│  │  ├─ On success: INSERT audit_log (SEND_EMAIL, new_values={sentAt, to})
│  │  └─ On fail: retry (exponential backoff)
│  └─ Webhook: SendGrid → /api/webhooks/email {status, ...}
├─ Frontend: show toast "Sending..." then "Email sent"
└─ UI shows "Email sent" timestamp in detail view
```

### 6.3 Flux Payment Tracking

```
USER ACTION → [Mark Paid] → [API Update] → [Dashboard Recalc] → [KPI Update]

Step 1: MARK AS PAID
┌─ User clicks "Mark as Paid" on outstanding invoice
├─ Show modal: {date, amount, method, notes}
├─ POST /api/invoices/:id/pay {datePaid, amountPaid, paymentMethod, notes}
├─ Backend:
│  ├─ Check status = ISSUED
│  ├─ Transaction:
│  │  ├─ UPDATE invoice (
│  │  │   status = 'PAID',
│  │  │   paid_at = datePaid,
│  │  │   paid_amount = amountPaid,
│  │  │   payment_method = method,
│  │  │   payment_notes = notes
│  │  │ )
│  │  ├─ INSERT audit_log (MARK_PAID, changes={status, paid_at, ...})
│  │  └─ COMMIT
│  ├─ Invalidate cache:
│  │  ├─ user's invoice list
│  │  ├─ user's dashboard summary
│  │  └─ outstanding invoices
│  └─ Return updated invoice
├─ Frontend: close modal, update invoice detail
├─ Auto-refresh dashboard (TanStack Query invalidation)
└─ Show toast "Invoice marked as paid"

Step 2: DASHBOARD AGGREGATE (on-demand OR polling)
┌─ GET /api/dashboard/summary
├─ Check Redis cache (5 min TTL)
├─ If miss:
│  ├─ DB queries:
│  │  ├─ SUM(total) WHERE user_id=X AND status='PAID' → totalPaid
│  │  ├─ SUM(total) WHERE user_id=X AND status IN ('ISSUED','PAID') → totalInvoiced
│  │  ├─ SUM(total) WHERE user_id=X AND status='ISSUED' AND due_date < TODAY → totalOverdue
│  │  ├─ SUM(total) WHERE user_id=X AND status='ISSUED' AND due_date >= TODAY → totalOutstanding
│  │  ├─ COUNT(*) per status (for widget)
│  │  └─ AVG(daysToPayment) for paid invoices → DSO
│  ├─ Compute metrics:
│  │  ├─ collectionRate = totalPaid / totalInvoiced
│  │  ├─ lastMonth vs thisMonth trends
│  │  └─ Invoices overdue count
│  ├─ Cache in Redis 5 min
│  └─ Return JSON {totalInvoiced, totalPaid, totalOverdue, metrics, ...}
├─ Frontend: render KPI cards with values
└─ Refresh on demand (button) or auto-poll (30s interval)

Step 3: OUTSTANDING VIEW (filtered list)
┌─ GET /api/invoices?status=ISSUED&sort=due_date&limit=50
├─ DB query:
│  └─ SELECT * WHERE user_id=X AND status='ISSUED' AND deleted_at IS NULL
│    ORDER BY due_date ASC LIMIT 50
├─ Frontend: render table with:
│  ├─ Invoice number, client, amount, due date
│  ├─ Days since due (calc: due_date - today)
│  ├─ Badge [OVERDUE] if < 0
│  ├─ Action: "Mark Paid" button
│  └─ Action: "Send Reminder" (future)
└─ Paginate if > 50 results
```

---

## 7. Intégrations Externes

### 7.1 Email Service (SendGrid)

**Configuration:**
```env
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@facturation.app
SENDGRID_FROM_NAME=Facturation App
```

**Cas d'usage:**

| Cas | Template | Déclencheur | Async |
|-----|----------|-------------|-------|
| Invoice sent | `invoice-email.hbs` | User clicks "Send Email" | ✅ Bull queue |
| Payment reminder | `payment-reminder.hbs` | Manual (v2: scheduled) | ✅ Bull queue |
| Welcome email | `welcome.hbs` | User registre | ✅ Bull queue |
| Password reset | `reset-password.hbs` | User clicks "Reset" | ✅ Immediate |
| Invoice reminder (overdue) | `overdue-reminder.hbs` | Scheduled cron (v2) | ✅ Bull queue |

**API Integration:**
```typescript
// Use SendGrid SDK
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'client@example.com',
  from: 'noreply@facturation.app',
  subject: 'Your Invoice FAC-2026-001',
  html: '<html>...</html>',
  attachments: [
    {
      content: pdfBuffer.toString('base64'),
      filename: 'FAC-2026-001.pdf',
      type: 'application/pdf',
      disposition: 'attachment'
    }
  ],
  replyTo: 'support@facturation.app'
};

await sgMail.send(msg);
```

**Webhook Handling:**
```
POST /api/webhooks/sendgrid
{
  "event": "delivered|opened|bounced|dropped|spam",
  "email": "client@example.com",
  "timestamp": 1234567890,
  "external_event_id": "..."
}

Log event in audit_logs table for tracking
```

**Retries & Error Handling:**
- Bull queue: exponential backoff (5s, 25s, 125s, 625s, 3125s)
- Max 5 retries
- Deadletter queue for persistent failures
- Admin dashboard shows failed sends

### 7.2 Storage Service (AWS S3)

**Configuration:**
```env
AWS_REGION=eu-west-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=facturation-app-prod
AWS_S3_PREFIX=invoices/
AWS_CLOUDFRONT_DOMAIN=d123.cloudfront.net
```

**Use Cases:**

| Ressource | Dossier | TTL | Versioning |
|-----------|---------|-----|-----------|
| Logo utilisateur | `users/{userId}/logo.png` | 90 days | disabled |
| Signature | `users/{userId}/signature.png` | 90 days | disabled |
| PDF factures | `invoices/{invoiceId}/FAC-YYYY-NNN.pdf` | 7 years | enabled |

**Upload Flow:**
```typescript
// Frontend: upload logo
const formData = new FormData();
formData.append('file', logoFile);
const response = await fetch('/api/me/upload-logo', {
  method: 'POST',
  body: formData
});

// Backend: signed S3 upload
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({region: process.env.AWS_REGION});
const command = new PutObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET,
  Key: `users/${userId}/logo.${ext}`,
  Body: fileBuffer,
  ContentType: file.type,
  ACL: 'private',
  Metadata: {userId, uploadedAt: new Date().toISOString()}
});

const result = await s3.send(command);
// Store logoUrl = `https://${CLOUDFRONT_DOMAIN}/users/${userId}/logo.${ext}`
```

**CloudFront CDN:**
- Origin: S3 bucket
- Cache behavior: TTL 365 days (for logos), 7 years (for PDFs)
- Signed URLs for private content (optional, not needed if public read)
- OAI (Origin Access Identity) for S3 bucket access

### 7.3 Payment Gateway (Stripe - Future v2)

**Integration Point:**
```
POST /api/invoices/:id/payment-link
// Generate Stripe Payment Link
// Client receives email with link
// Payment confirmed → webhook → auto-mark paid

POST /api/webhooks/stripe
// Handle payment.success, payment.failed events
```

---

## 8. Matrice d'Évaluation Technologique

### 8.1 Frontend Framework Comparison

| Critère | React (Next.js) | Vue 3 | Svelte |
|---------|---|---|---|
| **Popularity** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Learning Curve** | Moyen | Moyen | Rapide |
| **DX** | Excellent | Bon | Excellent |
| **Ecosystem** | Énorme | Bon | Modéré |
| **Job Market** | Énorme | Modéré | Faible |
| **Performance** | Bon | Bon | Excellent |
| **Bundle Size** | 45KB gzip | 35KB gzip | 15KB gzip |
| **SSR/SSG** | ✅ Next.js | ✅ Nuxt | ✅ SvelteKit |
| **TypeScript** | ✅ Excellent | ✅ Bon | ✅ Bon |
| **Community** | Massive | Large | Growing |
| **Recommendation for MVP** | ✅ **RECOMMANDÉ** | Alternative | Alternative |

**Justification:** React + Next.js offre le meilleur équilibre entre DX, scalabilité, et accès talent. Écosystème mature, nombreuses librairies (TanStack Query, Zod, etc).

### 8.2 Backend Runtime Comparison

| Critère | Node.js | Python | Golang |
|---------|---|---|---|
| **Startup Speed** | Rapide | Moyen | Très rapide |
| **Throughput** | Bon | Moyen | Excellent |
| **Memory Usage** | Moyen | Moyen | Très efficace |
| **DX** | Excellent | Excellent | Bon |
| **Learning Curve** | Facile | Très facile | Moyen |
| **Ecosystem** | Énorme | Énorme | Bon |
| **Monolithe Options** | Express, Next.js | Django, Flask | Gin, Echo |
| **ORM/Query Builder** | Prisma, Sequelize | SQLAlchemy, Django ORM | GORM, sqlc |
| **Job Market** | Énorme | Énorme | Croissant |
| **Total Cost of Ownership** | Bas-Moyen | Bas | Moyen |
| **Recommendation for MVP** | ✅ **RECOMMANDÉ** | Alternative | Alternative |

**Justification:** Node.js + Next.js = même language (TypeScript) frontend + backend = DX optimal, debugging simplifié. Déploiement monolithe possible sur Vercel, Heroku, etc.

### 8.3 Database Choice Comparison

| Critère | PostgreSQL | MongoDB | MySQL |
|---------|---|---|---|
| **ACID Transactions** | ✅ Full | ⚠️ Limited | ✅ Full |
| **Data Integrity** | ✅ Excellent | ⚠️ Document-based | ✅ Good |
| **Scalability** | Vertical + Horizontal (sharding) | Horizontal (replica sets) | Vertical |
| **JSON Support** | ✅ JSONB + Full-text search | ✅ Native | ⚠️ Limited |
| **Query Performance** | ✅ Excellent | Good (aggregation pipeline) | Good |
| **Cost** | Open source | Open source + Atlas | Open source |
| **Operational Complexity** | Moyen | Moyen-Haut | Bas |
| **Prisma Support** | ✅ Excellent | ✅ Excellent | ✅ Good |
| **Recommendation for MVP** | ✅ **RECOMMANDÉ** | Alternative (document-heavy apps) | Alternative |

**Justification:** PostgreSQL offre ACID guarantees, contraintes relationnelles, et excellent cost/performance. Perfect pour structured invoice data. Pas besoin flexibilité MongoDB.

### 8.4 PDF Generation Library Comparison

| Critère | Puppeteer | pdfkit | wkhtmltopdf |
|---------|---|---|---|
| **Approach** | Headless Chrome (HTML→PDF) | Direct PDF generation | Webkit-based |
| **Quality** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐⭐ Good | ⭐⭐⭐ Fair |
| **Speed** | 2-3 seconds | < 500ms | Slow (deprecated) |
| **Design Fidelity** | 100% (CSS/JS support) | Limited | Limited |
| **Ease of Use** | Moderate | Simple | Simple |
| **Bundle Size** | Heavy (Chrome) | Light | External dependency |
| **License** | Apache 2.0 | MIT | LGPL |
| **Docker Support** | ✅ alpine image | ✅ Lightweight | ⚠️ Large image |
| **Recommendation** | ✅ **RECOMMANDÉ** | Lightweight alternative | ❌ Avoid |

**Justification:** Puppeteer + Next.js = render facture component as HTML, Puppeteer → PDF. Design perfect car CSS/React possible. Speed < 3s acceptable pour use case (pas real-time).

---

## 9. Performance & Scalabilité

### 9.1 Performance Targets (Web Vitals)

| Métrique | Cible | Mesure |
|----------|--------|--------|
| **Largest Contentful Paint (LCP)** | < 2.5s | Lighthouse, DevTools |
| **First Input Delay (FID)** | < 100ms | DevTools, RUM |
| **Cumulative Layout Shift (CLS)** | < 0.1 | Lighthouse |
| **Time to Interactive (TTI)** | < 4s | Lighthouse |
| **First Contentful Paint (FCP)** | < 1.8s | DevTools |

**Optimization Strategy:**
- Code splitting (dynamic imports for routes)
- Image optimization (next/image, WebP)
- CSS minification (Tailwind purge)
- JavaScript minification & tree-shaking
- Lazy load components (React Suspense)
- Service Worker for offline access (future PWA)

### 9.2 API Performance

| Endpoint | Current | Target | Optimizations |
|----------|---------|--------|-----------------|
| GET /api/invoices | 200-500ms | < 200ms | Index sur user_id + status, pagination, caching |
| POST /api/invoices | 100-300ms | < 200ms | Batch inserts line items, atomic transactions |
| GET /api/invoices/:id/pdf | 2-3s | < 3s | Puppeteer caching en S3, HTML template reuse |
| GET /api/dashboard/summary | 500-2000ms | < 500ms | Redis cache 5min, query aggregation optimization |
| POST /api/auth/login | 100-200ms | < 100ms | Database index sur email, bcrypt cost 10 |

**Caching Strategy:**
```
Redis Cache (TTL):
  - Dashboard KPIs: 5 minutes
  - Invoice list (per user): 1 minute
  - Client list (per user): 5 minutes
  - User profile: 30 minutes
  - Auth token refresh: stateless (no server-side session)

S3 + CloudFront (CDN):
  - Static assets (JS, CSS): 365 days
  - User logos/signatures: 90 days
  - Generated PDFs: 7 years (versioned by invoiceId)

Browser Cache:
  - Service Worker: offline support + cache-first for static
  - localStorage: JWT token (30 days)
```

### 9.3 Database Performance

**Query Optimization:**
```sql
-- EXPLAIN ANALYZE key queries
EXPLAIN ANALYZE
SELECT SUM(total), COUNT(*), MAX(created_at)
FROM invoices
WHERE user_id = $1 AND status = $2 AND created_at >= $3;

-- Index strategy:
-- idx_invoices_user_status (user_id, status) → reduces full table scan
-- idx_invoices_user_date (user_id, created_at DESC) → supports range queries

-- Partitioning (future, when > 1M invoices):
-- PARTITION BY HASH (user_id) → parallel query execution
```

**Connection Pooling:**
- Prisma built-in: `connection_limit = 5` (per app instance)
- PgBouncer external: `max_client_conn = 1000`, `default_pool_size = 25`
- Horizontal scaling: each API instance has own pool

### 9.4 Scalability Roadmap

**Phase 1 (v1, MVP - 500-1000 users):**
- Monolithic Next.js + single PostgreSQL instance (RDS Multi-AZ)
- Redis single instance (ElastiCache)
- S3 + CloudFront
- 1-2 API instances (behind ALB)

**Phase 2 (v2, 5000-10000 users):**
- API horizontal scaling (auto-scaling groups, target 1000 concurrent users/instance)
- PostgreSQL read replicas (for reporting)
- Redis cluster (for high throughput)
- Dedicated worker processes (Bull queue consumers)
- Elasticsearch for advanced search (optional)

**Phase 3 (v3, 50000+ users):**
- Database sharding by userId (if needed)
- Microservices split (Auth, Invoicing, Payments separate)
- Kafka for event streaming (audit trail, notifications)
- GraphQL API layer (if needed)

---

## 10. Sécurité & Conformité

### 10.1 Authentication & Authorization

**JWT Implementation:**
```typescript
// Token payload
{
  sub: userId,      // subject (unique identifier)
  email: user.email,
  iat: issuedAt,    // issued at
  exp: expiresAt,   // expires at (30 days)
  iss: 'facturation.app',
  aud: 'facturation.app'
}

// Signing algorithm: HS256 (HMAC-SHA256)
// Secret: min 32 bytes, random, stored in .env
// Token lifetime: 30 days
// Refresh: POST /api/auth/refresh (with refresh token from httpOnly cookie, v2)
```

**RBAC (Role-Based Access Control):**
- Current MVP: User (all can manage own data)
- Future: Admin, Accountant, Reader roles (v2)
- Row-level security: User can only see own invoices/clients
  ```sql
  -- Ensure user_id match
  SELECT * FROM invoices WHERE user_id = current_user_id;
  -- PostgreSQL RLS policies (optional, application-level enforced)
  ```

### 10.2 Input Validation & Sanitization

**Client-side validation (Zod):**
```typescript
const createInvoiceSchema = z.object({
  clientId: z.string().uuid(),
  lineItems: z.array(z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0).max(1000000),
    taxRate: z.enum(['0', '0.055', '0.20'])
  })),
  dueDate: z.string().datetime()
    .refine(d => new Date(d) >= new Date(), "Due date must be future")
});
```

**Server-side validation (Zod + custom):**
- Parse & validate all request bodies
- Prepared statements (Prisma ORM prevents SQL injection)
- Email validation (RFC 5322)
- SIRET format validation (regex + luhn check)
- XSS prevention: sanitize rich text inputs (DOMPurify if needed)

### 10.3 Data Protection

**Encryption:**
- **In transit:** TLS 1.3 (HTTPS everywhere)
- **At rest:** 
  - PostgreSQL with encryption (AWS RDS encryption by default)
  - S3 default encryption (AES-256)
  - Passwords: bcrypt with cost 10
  - Optional: field-level encryption for sensitive data (email, SIRET) using Prisma extension

**RGPD Compliance:**
- Right to be forgotten: `DELETE FROM users WHERE id = $1 CASCADE`
- Data export: `GET /api/me/export` → JSON dump (all user data)
- Audit logs: retained 3 years minimum
- Privacy policy & Terms of Service (legal review needed)
- Consent for email marketing (opt-in)
- DPA (Data Processing Agreement) if using subprocessors

### 10.4 Monitoring & Incident Response

**Security Headers:**
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

**Rate Limiting:**
```
POST /api/auth/login:       5 per minute per IP
POST /api/auth/register:    1 per hour per IP
GET /api/invoices:          100 per minute per user
POST /api/invoices:         50 per hour per user
Webhook endpoints:          1000 per minute (SendGrid, Stripe)
```

**Logging & Monitoring:**
- All auth events (login, signup, reset)
- All data modifications (CRUD on invoices, clients)
- API errors (4xx, 5xx)
- Security events (rate limit exceeded, failed auth)
- Centralized logging: CloudWatch / ELK

**Incident Response:**
- Automated alerts (5xx errors > 1%, latency > 5s)
- On-call rotation (phase 2+)
- Post-mortem process

---

## 11. Déploiement & DevOps

### 11.1 CI/CD Pipeline (GitHub Actions)

```yaml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build
      - run: npm run test:integration

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Vercel (or AWS, DigitalOcean, etc)
        run: |
          npm install -g vercel
          vercel deploy --prod --token=${{ secrets.VERCEL_TOKEN }}

      - name: Run smoke tests
        run: |
          npm run test:e2e --environment=production
```

### 11.2 Deployment Targets

#### Option A: Vercel (Recommended for MVP)
- Zero config Next.js deployment
- Auto-scaling, global CDN
- PostgreSQL via Vercel Postgres (AWS RDS) or Supabase
- Serverless functions (API routes)
- Free tier available
- **Cons:** Locked into Vercel ecosystem, potential vendor lock-in

#### Option B: AWS (Production-grade)
- **Compute:** ECS (Elastic Container Service) + EC2
- **Database:** RDS PostgreSQL (Multi-AZ)
- **Cache:** ElastiCache Redis
- **Storage:** S3 + CloudFront
- **ALB:** Application Load Balancer
- **Monitoring:** CloudWatch, X-Ray
- **Estimated cost:** $200-500/month v1

#### Option C: DigitalOcean (Balance)
- **App Platform:** Managed Next.js deployment
- **Database:** Managed PostgreSQL
- **Cache:** Managed Redis
- **Spaces:** S3-compatible object storage
- **App Gateway:** Built-in load balancer
- **Cost:** $150-350/month v1

#### Option D: Heroku (Legacy, simpler)
- One-click deployment from GitHub
- Managed PostgreSQL add-on
- Auto-scaling available
- **Cons:** More expensive ($7+ per dyno), deprecating free tier
- **Cost:** $250+/month v1

### 11.3 Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Build
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Run
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml (for local development)
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: facturation
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/facturation
      REDIS_URL: redis://redis:6379
      NEXT_PUBLIC_API_URL: http://localhost:3000
    depends_on:
      - postgres
      - redis
    volumes:
      - .:/app
      - /app/node_modules

volumes:
  postgres_data:
```

### 11.4 Database Migrations

Using Prisma Migrate:

```bash
# Create migration
npx prisma migrate dev --name add_invoices_table

# Deploy to production
npx prisma migrate deploy

# Reset (dev only)
npx prisma migrate reset
```

### 11.5 Monitoring & Observability

```typescript
// logging.ts
import winston from 'winston';

export const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('Invoice created', {invoiceId, userId, amount});
logger.error('Payment failed', {invoiceId, error: err.message});
```

**Metrics to Track:**
- API response times (p50, p95, p99)
- Error rates (4xx, 5xx)
- Database query performance
- Redis cache hit rate
- Invoice generation duration
- Email send success rate
- User signup/activation funnel
- DAU/WAU/MAU trends

---

## Conclusion

L'architecture proposée est **simple, scalable, et production-ready** pour un MVP. Les décisions clés (Next.js, PostgreSQL, JWT) offrent un excellent balance entre :
- **Developer Experience:** TypeScript full-stack, type safety
- **Operational Simplicity:** Monolithe déployable facilement
- **Scalability:** Stateless API, horizontal scaling possible
- **Cost:** Infrastructure légère (~$300-500/mois v1)

Les ADRs accompagnant ce document formalisent chaque décision majeure avec contexte et conséquences.

---

**Approved by:** [Product Lead]  
**Last Updated:** 16 février 2026  
**Next Review:** 1er avril 2026 (après Phase 1 MVP)
