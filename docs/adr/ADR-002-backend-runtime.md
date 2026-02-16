# ADR-002: Choix du Backend Runtime

**Status:** ACCEPTED  
**Date:** 2026-02-16  
**Authors:** Architecture Team  
**Decision:** Node.js 18+ LTS + Next.js API Routes

---

## 1. Context

L'application nécessite un backend pour :
- Authentification & autorisation (JWT)
- CRUD operations (invoices, clients, users)
- Calculs complexes (TVA, numérotation atomique)
- Intégrations externes (email SendGrid, PDF generation, S3 storage)
- Async job queue (for email sending)

**Options évaluées:**
1. **Node.js + Express/Next.js** - JavaScript async, good for async jobs
2. **Python + FastAPI/Django** - Excellent DX, large data lib ecosystem, mais async moins natif
3. **Golang** - Performance excellent, concurrency native, mais steeper learning curve

**Contraintes:**
- Équipe initiale: 2-3 developers (pas besoin ultra-performance v1)
- Timeline: 8 semaines MVP
- Besoin intégration tight avec frontend (same language = TypeScript)
- Async jobs pour email sending (async-first)

---

## 2. Decision

**Adopter Node.js 18+ LTS + Next.js API Routes + Prisma ORM**

### Justification

| Critère | Node.js | Python | Golang |
|---------|---------|--------|--------|
| **Startup Speed** | Fast (cold start ~100ms) | Slow (cold start ~500ms) | Very Fast (<10ms) |
| **Memory Usage** | Moyen (50-100MB baseline) | Moyen (30-80MB baseline) | Très efficace (5-20MB) |
| **Throughput** | Bon (async) | Moyen (WSGI bottleneck) | Excellent (native concurrency) |
| **DX** | Excellent | Excellent | Bon |
| **Shared Types (TS)** | ✅ PERFECT | ❌ Différent langage | ❌ Différent langage |
| **Async Jobs** | ✅ Native | ⚠️ Celery/RQ overhead | ✅ Native |
| **ORM Quality** | Prisma (excellent) | SQLAlchemy (excellent) | GORM (bon) |
| **Team Scaling** | Excellent (JS everywhere) | Bon (Python popular) | Moyen (Go moins courant) |
| **Cost of Infrastructure** | Bas-Moyen (memory usage) | Bas-Moyen (slower startup) | Très bas (efficient) |
| **Rapid MVP** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |

### Raisons principales

1. **Same Language as Frontend:**
   - TypeScript shared types: `types/models.ts` utilisé par frontend ET backend
   - Full-stack type safety: Compiler catching errors at build time
   - Easier debugging: Same language, same ecosystem, same mental model
   - Recruiter advantage: React dev → can also do backend API routes

2. **Native Async-First:**
   - Promise/async-await natively supported (vs Python Celery complexity)
   - Job queues (Bull/BullMQ) more ergonomic than Celery
   - Email sending, PDF generation without blocking main thread
   - Long-polling, WebSocket ready

3. **Shared Monolith:**
   - API routes collocated in same Next.js app
   - Single deploy artifact
   - Shared middleware, utilities, types
   - Easier to refactor (move code between frontend/backend)

4. **Excellent Ecosystem for Invoicing:**
   - Prisma: Type-safe DB client with migrations
   - Zod: Schema validation (used frontend + backend)
   - jsonwebtoken: JWT auth (battle-tested)
   - SendGrid SDK: Officially maintained
   - Puppeteer: Headless Chrome PDF generation
   - Bull/BullMQ: Redis-backed queues (better than Celery for small teams)

5. **Serverless-Ready:**
   - Vercel Functions = serverless Node.js runtime (v1 if needed)
   - Easier deployments than Python cold starts
   - AWS Lambda Node.js: excellent support
   - Minimal warm-up time

### Why NOT Python?

- ✅ Python DX is excellent
- ✅ Large ecosystem for data science (not needed here)
- ✅ Django has great batteries
- **BUT:** Type sharing with frontend = extra tooling, duplicated definitions
- **BUT:** Async is second-class citizen (ASGI, Celery complexity)
- **BUT:** Cold starts slower (Lambda: 500-1000ms vs Node 100-300ms)

### Why NOT Golang?

- ✅ Performance excellent
- ✅ Concurrency native
- ✅ Binary small & fast
- **BUT:** Steep learning curve (not needed for MVP performance)
- **BUT:** Type sharing with frontend requires code generation (complexity)
- **BUT:** Job market: fewer Golang devs available for v2 scaling

---

## 3. Consequences

### ✅ Avantages

- **Monolithic simplicity:** Frontend + Backend in same deploy
- **Type safety end-to-end:** TypeScript across full stack
- **Developer velocity:** Same language everywhere, code sharing, debugging easier
- **Async operations:** Email sending, PDF generation non-blocking
- **Horizontal scaling:** Stateless API, easy auto-scaling
- **Job market:** Easier hiring (React devs can extend to backend)
- **Serverless option:** Vercel Functions v2, AWS Lambda good support

### ❌ Inconvénients

- **Memory usage:** Node baseline ~50MB (vs Go ~5MB), CPU less efficient per request
  - **Mitigation:** Fine for MVP (500-1000 users), optimize if needed phase 2
- **Lacks batteries:** Less built-in than Django (auth, admin, ORM)
  - **Mitigation:** Prisma + jsonwebtoken + custom middleware sufficient
- **Async complexity:** Callback hell if not careful (mitigated by async/await)
  - **Mitigation:** Use TypeScript, enforce strict eslint rules
- **Large ecosystem:** npm has more package quality variation
  - **Mitigation:** Stick to verified packages (Prisma, Bull, SendGrid official)

### Trade-offs

- Chose **developer velocity + shared types + async native** over **raw performance**
- Could switch to Go phase 2 if needed (unlikely for this problem space)

---

## 4. Compliance & Alternatives

**Rejeté Python/FastAPI:**
- Excellent DX, mais type sharing dengan frontend = complexity, async less ergonomic, cold starts slower

**Rejeté Golang:**
- Excellent performance, mais MVP doesn't need it, type sharing more complex, hiring harder v2

---

## 5. Implementation Plan

### Stack détaillé

```json
{
  "runtime": "node@18.x (LTS)",
  "framework": "next.js@14.x (API Routes)",
  "language": "typescript@5.x (strict)",
  "orm": "prisma@5.x",
  "validation": "zod@3.x",
  "auth": "jsonwebtoken@9.x + bcrypt@5.x",
  "async-jobs": "bull@4.x (Redis queue)",
  "email": "@sendgrid/mail@7.x",
  "pdf": "puppeteer@21.x",
  "logging": "winston@3.x",
  "testing": "jest@29.x + supertest@6.x",
  "api-gateway": "built-in (no express needed)"
}
```

### Backend API Routes Structure

```
app/api/
├── auth/
│   ├── register/route.ts
│   ├── login/route.ts
│   ├── logout/route.ts
│   ├── refresh/route.ts
│   └── reset-password/route.ts
├── invoices/
│   ├── route.ts               # GET list + POST create
│   ├── [id]/route.ts          # GET detail + PUT update + DELETE soft-delete
│   ├── [id]/emit/route.ts     # POST DRAFT → ISSUED
│   ├── [id]/pay/route.ts      # POST mark as paid
│   ├── [id]/pdf/route.ts      # GET generate PDF
│   ├── [id]/send/route.ts     # POST send email
│   └── [id]/history/route.ts  # GET audit trail
├── clients/
│   ├── route.ts               # GET list + POST create
│   ├── [id]/route.ts          # GET + PUT + DELETE
│   └── import/route.ts        # POST CSV import
├── dashboard/
│   ├── summary/route.ts       # GET KPIs
│   ├── outstanding/route.ts   # GET impayées
│   └── overdue/route.ts       # GET en retard
├── me/
│   ├── route.ts               # GET profile + PUT update
│   ├── upload-logo/route.ts   # POST S3 upload
│   └── export/route.ts        # GET GDPR export
└── webhooks/
    └── sendgrid/route.ts      # POST email events
```

### Service Layer Example

```typescript
// lib/services/InvoiceService.ts
import { prisma } from '@/lib/db';

export class InvoiceService {
  static async create(userId: string, data: CreateInvoiceInput) {
    // Generate invoice number atomically
    const nextNumber = await prisma.user.update({
      where: {id: userId},
      data: {nextInvoiceNumber: {increment: 1}},
      select: {nextInvoiceNumber: true}
    });
    
    const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(nextNumber).padStart(3, '0')}`;
    
    // Create invoice + line items in transaction
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        clientId: data.clientId,
        invoiceNumber,
        issueDate: new Date(),
        dueDate: data.dueDate,
        lineItems: {
          createMany: {
            data: data.lineItems.map(li => ({
              description: li.description,
              quantity: li.quantity,
              unitPrice: li.unitPrice,
              taxRate: li.taxRate,
              lineTotal: li.quantity * li.unitPrice * (1 + li.taxRate)
            }))
          }
        },
        status: 'DRAFT',
        createdBy: userId
      },
      include: {lineItems: true}
    });
    
    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        entityType: 'INVOICE',
        entityId: invoice.id,
        action: 'CREATE',
        newValues: invoice
      }
    });
    
    return invoice;
  }
}
```

### Job Queue Example (Bull)

```typescript
// lib/queues/emailQueue.ts
import Queue from 'bull';

const emailQueue = new Queue('email', {
  redis: {url: process.env.REDIS_URL}
});

export async function queueSendInvoiceEmail(
  invoiceId: string,
  to: string
) {
  await emailQueue.add(
    {invoiceId, to},
    {
      attempts: 5,
      backoff: {type: 'exponential', delay: 2000},
      removeOnComplete: true
    }
  );
}

// Worker
emailQueue.process(async (job) => {
  const {invoiceId, to} = job.data;
  
  const invoice = await prisma.invoice.findUnique({
    where: {id: invoiceId},
    include: {client: true, lineItems: true}
  });
  
  // Generate PDF
  const pdf = await generatePDF(invoice);
  
  // Send email
  await sendgrid.send({
    to,
    subject: `Invoice ${invoice.invoiceNumber}`,
    html: emailTemplate(invoice),
    attachments: [{
      content: pdf.toString('base64'),
      filename: `${invoice.invoiceNumber}.pdf`,
      type: 'application/pdf'
    }]
  });
  
  // Log
  await prisma.auditLog.create({
    data: {
      userId: invoice.userId,
      entityType: 'INVOICE',
      entityId: invoiceId,
      action: 'SEND_EMAIL',
      newValues: {sentAt: new Date(), to}
    }
  });
});
```

---

## 6. Monitoring & Review

**Metrics de succès:**
- ✅ API response time p95 < 200ms (all endpoints)
- ✅ Job queue processing time < 10s (email sending)
- ✅ Error rate < 0.1% (5xx errors)
- ✅ Memory usage < 200MB per instance
- ✅ TypeScript strict = 0 errors

**Review point:**
- End of Phase 1: If memory usage > 300MB or error rate > 0.5%, review optimization (connection pooling, caching)
- Phase 2: If QPS > 100/s, consider horizontal scaling or service separation

---

## 7. References

- [Node.js 18 LTS](https://nodejs.org/en/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Prisma ORM](https://www.prisma.io/docs/)
- [Bull Queue](https://github.com/OptimalBits/bull)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

---

**Decision Owner:** CTO / Backend Lead  
**Approved by:** Product Manager  
**Date Approved:** 2026-02-16
