# ADR-001: Choix du Framework Frontend

**Status:** ACCEPTED  
**Date:** 2026-02-16  
**Authors:** Architecture Team  
**Decision:** Next.js 14 + React 18 + TypeScript

---

## 1. Context

L'application de facturation nécessite une UI web responsive, performante et maintenable pour :
- Gestion de formulaires complexes (création/édition de factures)
- Affichage de tableaux de données (listes de factures/clients)
- Dashboard avec KPIs temps réel
- Intégration d'une génération PDF dans la même appli

**Options évaluées:**
1. **React (Next.js 14)** - Framework full-stack avec API routes
2. **Vue 3 + Nuxt 3** - Alternative plus légère mais écosystème plus petit
3. **Svelte + SvelteKit** - Excellent performance, écosystème croissant

**Contraintes du projet:**
- Équipe initiale 2-3 developers
- Timeline: 8 semaines MVP
- Besoin d'une large communauté pour hiring (v2)
- Support TypeScript obligatoire
- Déploiement simplifié

---

## 2. Decision

**Adopter Next.js 14 (App Router) + React 18 + TypeScript strict**

### Justification

| Critère | Next.js | Vue/Nuxt | Svelte |
|---------|---------|----------|--------|
| **Maturité** | Production-proven | Bon, croissant | Croissant |
| **Ecosystem** | Énorme | Bon | Limité |
| **Job Market** | Massif | Moyen | Petit |
| **DX (TypeScript)** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **SSR/SSG** | ✅ Built-in | ✅ Nuxt | ✅ SvelteKit |
| **API Routes** | ✅ Intégrées | ❌ Séparé | ❌ Séparé |
| **Learning Curve** | Moyen | Moyen | Rapide |
| **Community Support** | Massif | Moyen | Croissant |
| **Bundle Size** | 45KB gzip | 35KB gzip | 15KB gzip |

### Raisons principales

1. **API Routes intégrées** : Pouvoir placer le backend dans le même repo/déploiement = DevOps simplifié
   - Single monolith déployable
   - Debugging cross-stack plus facile (same app instance)
   - Partageable types TypeScript (frontend ↔ backend)

2. **Écosystème mature** :
   - TanStack Query, React Hook Form, Zod, Shadcn/ui = stack moderne pré-bâti
   - Nombreuses librairies PDF, chart, form
   - Community large → stackoverflow answers, tutorials, packages

3. **Job market** :
   - React #1 skill demandée (LinkedIn 2025)
   - Easier recruiting pour phase 2-3
   - Équipe peut scale (beaucoup de React devs disponibles)

4. **Production-ready tooling** :
   - Built-in code splitting, image optimization, font loading
   - Vercel hosting (1-click deploy) OU self-hosted facile
   - Auto-scaling possible (stateless API)

5. **DX TypeScript** :
   - Type-safe API responses avec Zod
   - Autocomplete excellent in VSCode
   - Refactoring confident

---

## 3. Consequences

### ✅ Avantages

- **Monolithe scalable:** Deploy frontend + backend together (Vercel, Docker, etc)
- **Type safety end-to-end:** TypeScript frontend ↔ backend
- **Partageable types:** `shared/types.ts` utilisé par frontend ET API routes
- **Performance:** Built-in optimizations (code splitting, lazy load, image optimization)
- **Hiring:** React devs plus facile à trouver pour v2
- **Community:** Large ecosystem, many tutorials, packages

### ❌ Inconvénients

- **Bundle size:** React + Next.js = ~45KB gzip (vs Svelte 15KB)
  - **Mitigation:** Code splitting, lazy routes, service worker caching
- **Learning curve:** App Router peut être confuse pour débutants Next.js
  - **Mitigation:** Documentation excellente, community large
- **Potential vendor lock-in:** Vercel ecosystem (mais self-hosted possible)
  - **Mitigation:** No hard dependency, peut déployer n'importe où

### Trade-offs

- Choisi **maturité + écosystème + hiring potential** sur **légèreté du bundle**
- Svelte serait meilleur pour performance pure, mais Next.js meilleur pour équipe scaling

---

## 4. Compliance & Alternatives

**Rejeté Vue/Nuxt:**
- Raison: Écosystème plus petit, plus de difficulté hiring France, integration API routes moins native

**Rejeté Svelte:**
- Raison: Bundle size plus léger, DX excellent MAIS job market très limité pour hiring v2, écosystème plus restreint

---

## 5. Implementation Plan

### Stack détaillé

```json
{
  "framework": "next.js@14.x",
  "runtime": "react@18.x",
  "language": "typescript@5.x",
  "styling": "tailwindcss@3.x",
  "ui-components": "shadcn/ui",
  "state-management": "zustand@4.x (light state) + @tanstack/react-query@5.x (server state)",
  "forms": "react-hook-form@7.x + zod@3.x",
  "icons": "lucide-react",
  "charts": "recharts",
  "testing": "jest@29.x + @testing-library/react@14.x",
  "linting": "eslint@8.x + prettier@3.x",
  "build": "turbopack (built-in Next.js)"
}
```

### Structure du projet

```
facturation/
├── app/                           # Next.js App Router
│   ├── (auth)/                    # Public routes group
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset/page.tsx
│   ├── (app)/                     # Protected routes group (with layout)
│   │   ├── dashboard/page.tsx
│   │   ├── invoices/
│   │   │   ├── page.tsx           # list
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/page.tsx      # detail
│   │   ├── clients/
│   │   └── settings/
│   ├── api/                       # Backend API routes
│   │   ├── auth/[...auth].ts
│   │   ├── invoices/
│   │   ├── clients/
│   │   └── webhooks/
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Home/redirect
├── components/
│   ├── ui/                        # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── layouts/
│   │   ├── AppLayout.tsx
│   │   └── AuthLayout.tsx
│   └── features/
│       ├── InvoiceForm.tsx
│       ├── InvoiceTable.tsx
│       └── ...
├── lib/
│   ├── api-client.ts              # Fetch wrapper with auth
│   ├── utils.ts                   # Helper functions
│   ├── validators.ts              # Zod schemas
│   └── formatting.ts              # formatCurrency, formatDate, etc
├── hooks/
│   ├── useAuth.ts
│   ├── useInvoices.ts
│   ├── useDashboard.ts
│   └── ...
├── types/
│   ├── index.ts                   # Shared types (frontend + API)
│   └── models.ts
├── styles/
│   ├── globals.css                # Tailwind directives
│   └── theme.css
├── public/                        # Static assets
├── prisma/                        # ORM (backend)
│   └── schema.prisma
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

### Development Workflow

```bash
# Install
npm install

# Dev server (frontend + backend)
npm run dev

# Build
npm run build

# Production
npm run start

# Testing
npm run test
npm run test:e2e

# Linting & formatting
npm run lint
npm run format
```

---

## 6. Monitoring & Review

**Metrics de succès:**
- ✅ Time to first interactive < 4s (Lighthouse score > 80)
- ✅ Build size < 100KB gzip (initial bundle)
- ✅ Code coverage > 70% (jest)
- ✅ TypeScript strict mode = 0 `any` types
- ✅ Lighthouse accessibility > 90

**Review point:**
- End of Phase 1 (end of March 2026): Reassess if bundle size > 80KB gzip, consider code splitting improvements

---

## 7. References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [React 18 New Features](https://react.dev/blog/2023/03/16/react-labs-what-we-have-been-working-on-march-2023)
- [Shadcn/ui Components](https://ui.shadcn.com)
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
- [Zod Schema Validation](https://zod.dev)

---

**Decision Owner:** CTO / Lead Architect  
**Approved by:** Product Manager  
**Date Approved:** 2026-02-16
