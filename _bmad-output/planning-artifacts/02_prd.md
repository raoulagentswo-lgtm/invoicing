# Product Requirements Document (PRD)
## Application de Facturation pour Freelances et PME

**Version:** 1.0  
**Date:** 16 février 2026  
**Statut:** Phase Planning  
**Auteur:** Équipe Product  
**Approbation:** En attente

---

## 1. Vue d'Ensemble Exécutive

### 1.1 Description Produit
L'**application de facturation** est une solution web et mobile native permettant aux freelances et PME (1-10 collaborateurs) de gérer simplement l'émission et le suivi de leurs factures. Elle offre un workflow fluide : création de clients → génération de factures → export PDF → suivi des paiements, sans friction et sans complexité technique.

### 1.2 Valeur Proposée
- ⏱️ **Réduction de 80% du temps de facturation** (vs Excel/Word)
- ✅ **Conformité légale** (templates TVA France validés)
- 📊 **Visibilité financière** (dashboard paiements en temps réel)
- 💰 **Zéro coût caché** (gratuit MVP + freemium transparent)
- 🎯 **Design moderne** (UX minimaliste, productive)

### 1.3 Public Cible Primaire
1. Freelances (dev, design, consulting) : 70% du marché initial
2. Micro-entrepreneurs : 20%
3. Petites agences (2-5 personnes) : 10%

---

## 2. Objectifs et KPIs

### 2.1 Objectifs Stratégiques

| # | Objectif | Horizon | Justification |
|---|----------|---------|---------------|
| **O1** | Atteindre 500+ utilisateurs actifs mensuels | Q2 2026 | Validation marché + traction initiale |
| **O2** | 60%+ activation (≥3 factures créées) | Q2 2026 | Signal d'engagement produit |
| **O3** | Taux de rétention 40%+ @30j | Q2 2026 | Viabilité économique |
| **O4** | NPS ≥ 40 | Q2 2026 | Satisfaction utilisateur + potentiel viral |
| **O5** | Être **gratuit et accessible sans friction** | MVP | Différenciation marché |

### 2.2 Key Performance Indicators (KPIs)

#### **Adoption Metrics**
- **DAU (Daily Active Users)** : Cible 150+ utilisateurs uniques/jour (Q2)
- **WAU (Weekly Active Users)** : Cible 300+ (Q2)
- **MAU (Monthly Active Users)** : Cible 500+ (Q2)
- **Sign-up conversion rate** : ≥ 5% (visitors → inscrits)

#### **Engagement Metrics**
- **Activation rate** : % d'utilisateurs créant ≥3 factures → Cible 60%
- **Invoice creation frequency** : Moyenne factures/utilisateur/mois → Cible 8+
- **Feature adoption** : % utilisateurs utilisant PDF export, suivi paiements → Cible 75%+ chacun
- **Session duration** : Durée moyenne session → Cible 12+ minutes

#### **Retention Metrics**
- **D30 retention** : % MAU actifs après 30j → Cible 40%
- **Churn rate** : % utilisateurs inactifs >30j → Cible <15%/mois
- **Support ticket rate** : Tickets/100 utilisateurs → Cible <10

#### **Satisfaction Metrics**
- **NPS (Net Promoter Score)** → Cible ≥40
- **CSAT (Customer Satisfaction)** : % utilisateurs satisfaits → Cible ≥75%
- **Feature satisfaction** : Rating fonctionnalités MVP → Cible ≥4/5

#### **Business Metrics**
- **Cost per user acquisition** : CAC → Cible <$3 (organic)
- **Lifetime value** : LTV (future, freemium) → À calculer Q2+
- **User referral rate** : % utilisateurs référant 2+ contacts → Cible 20%

---

## 3. Exigences Fonctionnelles Détaillées

### 3.1 Module 1 : Gestion des Clients

#### 3.1.1 Récit Utilisateur Primaire
**US-1.1:** "En tant que freelance, je veux ajouter un client en 10 secondes pour l'associer à une facture sans friction."

#### 3.1.2 Fonctionnalités Détaillées

| Feature | Description | Priorité | Acceptation |
|---------|-------------|----------|-------------|
| **Créer client** | Formulaire simple : Nom, Email, Adresse, SIRET/SIREN optionnel | P0 | < 20 secondes, validation email |
| **Modifier client** | Édition rapide des infos, historique changements | P0 | Audit trail complet |
| **Supprimer client** | Suppression logique (soft delete) + archivage | P1 | Pas de suppression data, archivage seul |
| **Lister clients** | Vue liste/grille, tri (alphabétique, date création), filtres | P0 | < 500ms charge, 1000+ clients |
| **Rechercher client** | Recherche full-text (nom, email, SIRET) | P0 | Auto-complete, <100ms latence |
| **Import CSV** | Upload CSV (nom, email, adresse) | P1 | Validation, rapports d'erreur, max 5000 lignes |
| **Export CSV** | Téléchargement données clients | P1 | Format standardisé, complet |
| **Détail client** | Affichage profil + historique factures liées | P0 | Panel latéral ou page dédiée |
| **Marquage favori** | "Clients fréquents" accessibles rapidement | P2 | Tri rapide, filtrage |

#### 3.1.3 Champs de Données (Client Entity)

```json
{
  "id": "uuid",
  "userId": "uuid (FK)",
  "name": "string (req, 2-100 chars)",
  "email": "string (req, valid email)",
  "phone": "string (optional)",
  "address": "string (optional, max 500 chars)",
  "siretSiren": "string (optional, regex validation)",
  "country": "string (default: FR)",
  "notes": "text (optional)",
  "isFavorite": "boolean (default: false)",
  "isArchived": "boolean (default: false)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "deletedAt": "timestamp (soft delete)"
}
```

#### 3.1.4 Critères d'Acceptation

- ✅ **CA-1.1:** Créer un client et le retrouver immédiatement en recherche
- ✅ **CA-1.2:** Modifier email client, reflété dans factures existantes
- ✅ **CA-1.3:** Importer 100 clients via CSV, erreurs signalées clairement
- ✅ **CA-1.4:** Chercher client par SIRET et le retrouver
- ✅ **CA-1.5:** Archiver client sans supprimer factures passées

---

### 3.2 Module 2 : Création et Gestion des Factures

#### 3.2.1 Récits Utilisateurs
- **US-2.1:** "Je veux créer une facture en 2-3 minutes avec calcul automatique de TVA."
- **US-2.2:** "Je veux modifier une facture brouillon sans impact sur la numérotation officielle."
- **US-2.3:** "Je veux voir l'historique complet de chaque facture (qui l'a créée, quand, modifications)."

#### 3.2.2 Fonctionnalités Détaillées

| Feature | Description | Priorité | Acceptation |
|---------|-------------|----------|-------------|
| **Créer facture** | Sélection client, ajout lignes articles, calculs auto | P0 | Brouillon auto-save |
| **Numérotation auto** | Format configurable (ex: FAC-2026-001) | P0 | Atomique, pas de doublons |
| **Ajouter lignes** | Description, quantité, prix unitaire, calculs TVA | P0 | Ligne min 0€, max 1M€ |
| **Modifier facture** | Édition sauf si émise (lecture seule post-émission) | P0 | Validation avant enregistrement |
| **Supprimer facture** | Brouillons seul, annulation pour émises | P1 | Audit trail complet |
| **Statuts facture** | Brouillon → Émise → Payée / Annulée | P0 | Transitions validées, workflow clair |
| **Conditions paiement** | Net 30, Net 60, Immédiat, Custom | P0 | Calcul date échéance auto |
| **Taux TVA** | Standard (20%), Réduit (5.5%), Exempte (0%) FR | P0 | Configurable par ligne/facture |
| **Remise globale** | % ou montant fixe sur total HT | P1 | Recalcul automatique |
| **Notes internes** | Mémos privés (non visibles PDF) | P0 | RTF basique |
| **CGV facture** | Conditions générales, signature bloc texte | P0 | Template personnalisable |
| **Historique** | Journal modifications facture (créateur, date, action) | P0 | Vue audit trail |
| **Duplication facture** | Copier facture existante → brouillon | P1 | Quick-copy devis → facture |

#### 3.2.3 Modèle de Données (Invoice Entity)

```json
{
  "id": "uuid",
  "userId": "uuid (FK)",
  "clientId": "uuid (FK to Client)",
  "invoiceNumber": "string (unique per user, e.g., FAC-2026-001)",
  "issueDate": "date",
  "dueDate": "date",
  "paymentTerms": "enum (NET_30, NET_60, IMMEDIATE, CUSTOM)",
  "currency": "string (default: EUR)",
  "status": "enum (DRAFT, ISSUED, PAID, CANCELLED)",
  
  "lineItems": [
    {
      "id": "uuid",
      "description": "string",
      "quantity": "number (>0)",
      "unitPrice": "decimal",
      "taxRate": "decimal (0, 0.055, 0.20)",
      "lineTotal": "decimal (calc)"
    }
  ],
  
  "subtotal": "decimal (calc, excl tax)",
  "taxAmount": "decimal (calc)",
  "discountAmount": "decimal (optional)",
  "total": "decimal (calc, incl tax)",
  
  "internalNotes": "text",
  "termsAndConditions": "text",
  "poNumber": "string (optional)",
  
  "paidAt": "timestamp (optional)",
  "paidAmount": "decimal (optional)",
  "paymentMethod": "enum (MANUAL, BANK_TRANSFER, CARD, CRYPTO) (optional)",
  
  "createdBy": "uuid",
  "createdAt": "timestamp",
  "updatedBy": "uuid",
  "updatedAt": "timestamp",
  "issuedAt": "timestamp (optional, when status=ISSUED)"
}
```

#### 3.2.4 Critères d'Acceptation

- ✅ **CA-2.1:** Créer facture avec 5 lignes articles, TVA calculée correctement
- ✅ **CA-2.2:** Numérotation automatique atomique, aucun doublon sur 1000 factures
- ✅ **CA-2.3:** Modifier facture brouillon, données sauvegardées auto toutes les 10s
- ✅ **CA-2.4:** Passer facture "DRAFT" → "ISSUED", voir timestamp et non-modifiable après
- ✅ **CA-2.5:** Annuler facture émise, marquée "CANCELLED", conservée en BD
- ✅ **CA-2.6:** Voir historique 10+ modifications, avec auteur, date, champ changé

---

### 3.3 Module 3 : Génération et Export PDF

#### 3.3.1 Récit Utilisateur
**US-3.1:** "Je veux générer un PDF professionnel envoyable directement à mon client en 1 clic."

#### 3.3.2 Fonctionnalités Détaillées

| Feature | Description | Priorité | Acceptation |
|---------|-------------|----------|-------------|
| **Générer PDF** | Export facture au format PDF A4, signé, prêt envoi | P0 | < 3s génération |
| **Télécharger PDF** | Bouton DL direct du navigateur | P0 | Nom fichier cohérent (FAC-2026-001.pdf) |
| **Prévisualiser PDF** | Affichage avant DL dans modal/sidebar | P1 | Live update si modifications |
| **Logo + Signature** | Upload optionnel, affichage en en-tête/pied | P1 | Compression images, max 2MB |
| **Paramétrages PDF** | Couleurs (entreprise), police, positions éléments | P2 | CSS template personnalisable |
| **Format légal FR** | Numéro SIRET/SIREN du freelancer, mention TVA | P0 | Validation template légale |
| **Envoi email direct** | Bouton "Envoyer par email" (intégration email) | P1 | Confirmation envoi, email en BC |
| **Historique envois** | Log des PDF générés/envoyés (date, recipient) | P2 | Vue audit trail |

#### 3.3.3 Critères d'Acceptation

- ✅ **CA-3.1:** Générer PDF facture < 3 secondes
- ✅ **CA-3.2:** PDF contient tous les champs (client, lignes, total, conditions, SIRET)
- ✅ **CA-3.3:** PDF téléchargé avec nom cohérent et date
- ✅ **CA-3.4:** Logo uploadé apparaît en en-tête (ratio aspect préservé)
- ✅ **CA-3.5:** Envoi email PDF, bonne mise en page, rapport d'envoi archivé

---

### 3.4 Module 4 : Suivi des Paiements

#### 3.4.1 Récits Utilisateurs
- **US-4.1:** "Je veux voir en un coup d'œil combien on me doit et de qui (dashboard)."
- **US-4.2:** "Je veux marquer une facture comme payée et voir l'impact immédiat sur mes stats."

#### 3.4.2 Fonctionnalités Détaillées

| Feature | Description | Priorité | Acceptation |
|---------|-------------|----------|-------------|
| **Marquer payée** | Clic rapide "Mark as Paid" + date paiement | P0 | Statut immédiat, audit trail |
| **Date/Montant paiement** | Enregistrement date effective + montant payé | P0 | Flexible (paiement partiel) |
| **Méthode paiement** | Virement, Chèque, Carte, Crypto (optionnel) | P1 | Droplist, notes optional |
| **Dashboard paiements** | KPI visuels : Total facturé, Payé, Impayé | P0 | Refresh temps réel |
| **Vue "Outstanding"** | Factures impayées triables (date échéance, montant) | P0 | Filtre par client |
| **Vue "Overdue"** | Factures en retard (dépassé date échéance) | P1 | Alerte visuelle, tri desc |
| **Rappels manuels** | Bouton "Envoyer rappel paiement" par email (v2) | P2 | Template rappel, signature |
| **Métriques paiement** | Jours moyen paiement (DSO), taux collection | P2 | Graphiques simples |
| **Gestion litiges** | Notes sur factures impayées/contentieuses | P1 | Flag + vue dédiée |

#### 3.4.3 Model Dashboard Data

```json
{
  "period": "MONTH | QUARTER | YEAR | CUSTOM",
  "totalInvoiced": "decimal",
  "totalPaid": "decimal",
  "totalOutstanding": "decimal",
  "totalOverdue": "decimal",
  "collectionRate": "percent",
  "averageDaysToPay": "integer",
  
  "invoicesByStatus": {
    "DRAFT": "count",
    "ISSUED": "count",
    "PAID": "count",
    "CANCELLED": "count"
  },
  
  "outstandingInvoices": [
    {
      "id": "uuid",
      "clientName": "string",
      "amount": "decimal",
      "dueDate": "date",
      "daysPast": "integer",
      "status": "OUTSTANDING | OVERDUE"
    }
  ]
}
```

#### 3.4.4 Critères d'Acceptation

- ✅ **CA-4.1:** Dashboard affiche montants Total/Payé/Impayé corrects
- ✅ **CA-4.2:** Marquer facture payée → Dashboard update immédiatement
- ✅ **CA-4.3:** Vue outstanding affiche factures impayées triées par date échéance
- ✅ **CA-4.4:** Facture échue affichée en "Overdue" avec alerte visuelle

---

### 3.5 Module 5 : Paramètres et Profil Utilisateur

#### 3.5.1 Récit Utilisateur
**US-5.1:** "Je veux configurer ma signature, mon numéro SIRET, mes conditions de paiement par défaut en 2 minutes."

#### 3.5.2 Fonctionnalités Détaillées

| Feature | Description | Priorité | Acceptation |
|---------|-------------|----------|-------------|
| **Profil utilisateur** | Nom, Prénom, Email, Adresse, Téléphone | P0 | Éditable, notif si email changé |
| **Infos légales** | SIRET/SIREN, Régime fiscal, Code APE optionnel | P0 | Validation format SIRET |
| **Devise par défaut** | EUR, USD, GBP, autres (défaut EUR) | P0 | Reflète dans toutes factures |
| **Conditions paiement défaut** | Net 30/60, Immédiat, Custom (template) | P0 | Override per-facture possible |
| **Logo + Signature** | Upload image, utilisée en PDF | P1 | Compression, ratio aspect |
| **Numérotation personnalisée** | Format facture (FAC-YYYY-NNN, INV-001, custom) | P0 | Regex validation, preview |
| **Modèle CGV** | Template texte conditions générales | P1 | WYSIWYG, bloc précédent |
| **Langue + Timezone** | FR/EN, fuseaux horaires | P1 | Format dates cohérent |
| **Notification settings** | Email alerts (facture créée, rappel paiement) | P2 | Toggle par type d'alerte |
| **Security 2FA** | Authentification deux facteurs (v2) | P2 | TOTP/SMS optionnel |
| **Export données** | Téléchargement JSON complet (RGPD) | P2 | Archivage complet utilisateur |
| **Suppression compte** | Delete compte + toutes données (RGPD) | P2 | Confirmation 2x, délai 30j |

#### 3.5.3 Champs Profil Utilisateur

```json
{
  "id": "uuid",
  "email": "string (unique, req)",
  "passwordHash": "string (req)",
  "firstName": "string (req)",
  "lastName": "string (req)",
  "phoneNumber": "string (optional)",
  "companyName": "string (optional)",
  "address": "string (optional)",
  "city": "string (optional)",
  "postalCode": "string (optional)",
  "country": "string (default: FR)",
  
  "siret": "string (optional, regex)",
  "siren": "string (optional, regex)",
  "taxRegime": "enum (MICROENTREPRENEUR, EIRL, SARL, etc.)",
  "codeApe": "string (optional)",
  
  "currency": "enum (default: EUR)",
  "language": "enum (default: FR)",
  "timezone": "string (default: Europe/Paris)",
  "defaultPaymentTerms": "enum (NET_30, NET_60, IMMEDIATE)",
  
  "invoiceNumberFormat": "string (template, e.g., FAC-YYYY-NNN)",
  "nextInvoiceNumber": "integer",
  
  "logoUrl": "string (optional, S3 path)",
  "signatureUrl": "string (optional, S3 path)",
  "termsAndConditions": "text (optional)",
  
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLoginAt": "timestamp"
}
```

#### 3.5.4 Critères d'Acceptation

- ✅ **CA-5.1:** Modifier profil → factures futures reflètent changements
- ✅ **CA-5.2:** Changer numérotation facture format → prochaine facture utilise nouveau format
- ✅ **CA-5.3:** Upload logo < 2MB, apparaît en PDF rapidement
- ✅ **CA-5.4:** Changer devise → toutes factures affichent nouvelle devise
- ✅ **CA-5.5:** Données SIRET validées via regex, rejet format invalide

---

### 3.6 Module 6 : Authentification et Onboarding

#### 3.6.1 Récit Utilisateur
**US-6.1:** "Je veux m'inscrire et créer ma première facture en < 5 minutes sans friction."

#### 3.6.2 Fonctionnalités Détaillées

| Feature | Description | Priorité | Acceptation |
|---------|-------------|----------|-------------|
| **Sign-up** | Email + mot de passe, validation, confirmation email | P0 | Rate-limit 5 inscriptions/IP/jour |
| **Login** | Email + password, "Remember me" optionnel | P0 | Session 30j, HTTPS enforced |
| **Password reset** | Email reset link (valide 1h) | P0 | Confirmation, rate-limit 3/jour |
| **Onboarding** | Tour 4-5 étapes (profil, client, facture, PDF, finish) | P1 | Skip possible, réaffichable |
| **Email verification** | Lien confirmation email avant full access (optionnel v1) | P1 | Retry après 24h |
| **Social login** | GitHub, Google sign-in (v2) | P2 | SSO via OAuth2 |
| **Session management** | Logout, session expiry, multi-device | P1 | Invalidation complète logout |

#### 3.6.3 Critères d'Acceptation

- ✅ **CA-6.1:** Créer compte en < 2 minutes, accès immédiat
- ✅ **CA-6.2:** Onboarding guidé crée profil + 1er client + 1ère facture
- ✅ **CA-6.3:** Email reset fonctionne, lien valide 1h uniquement
- ✅ **CA-6.4:** Logout invalide session, impossible relancer sans re-login

---

## 4. Exigences Non-Fonctionnelles

### 4.1 Performance

| Exigence | Cible | Mesure |
|----------|-------|--------|
| **Page load (initial)** | < 2.5s (First Contentful Paint) | Web Vitals (Lighthouse) |
| **Time to Interactive (TTI)** | < 4s | Lighthouse / DevTools |
| **Interaction latency** | < 100ms (click → feedback) | DevTools Timeline |
| **Invoice generation PDF** | < 3s | Backend timing log |
| **Search response** | < 100ms (client search, 1000 records) | API response time |
| **Database query** | < 100ms (p95) | APM / Query logs |
| **API endpoint response** | < 200ms (p95) | APM / Monitoring |

### 4.2 Scalabilité

| Exigence | Détail |
|----------|--------|
| **Concurrent users** | Support 1000+ utilisateurs simultanés (v1) → 10k+ (v2) |
| **Database scaling** | PostgreSQL avec partitioning par userId pour invoices/clients |
| **File storage** | S3 pour logos/signatures, CDN pour assets statiques |
| **API horizontal scaling** | Stateless app, load-balanced via ALB/nginx |
| **Caching strategy** | Redis pour sessions, CloudFront pour assets, SWR queries |
| **Rate limiting** | 100 req/min par utilisateur, 1000 req/min per IP (signup) |

### 4.3 Disponibilité & Reliability

| Exigence | Cible | Justification |
|----------|-------|---------------|
| **Uptime SLA** | 99.5% (v1) | Outil critique financier |
| **RTO (Recovery Time)** | < 1h | Redéploiement rapide possible |
| **RPO (Recovery Point)** | < 5 min | Backup DB toutes 5 min |
| **Error rate** | < 0.1% (5xx errors) | Monitoring continu |
| **Backup strategy** | Daily + hourly snapshots | Cross-region redundancy |

### 4.4 Sécurité

| Exigence | Implémentation |
|----------|-----------------|
| **Authentification** | JWT tokens (exp 30j), HTTPS obligatoire, rate-limit login (5 tentatives) |
| **Autorisation** | RBAC (Admin, User), row-level security (utilisateur voir seules ses données) |
| **Chiffrement données** | At-rest: AES-256 (DB field level), in-transit: TLS 1.3 |
| **RGPD compliance** | Droit oubli, export données, encryption PII (email, SIRET) |
| **Secrets management** | Hashicorp Vault / AWS Secrets Manager, rotation 90j |
| **SQL injection** | Prepared statements, ORM (Prisma), input validation |
| **CSRF protection** | SameSite cookies, CSRF tokens (POST/PUT/DELETE) |
| **XSS prevention** | Content-Security-Policy headers, sanitization input |
| **CORS** | Whitelist domaines, no credentials sur *-origin |
| **API security** | API keys + rate limit, no sensitive data in logs |
| **Password policy** | Min 8 chars, complexity optionnel (v2) |
| **Audit logging** | Toute action (create/edit/delete) avec userId + timestamp |
| **Monitoring** | SIEM (CloudWatch/ELK), alertes anomalies |

### 4.5 Compatibilité & Standards

| Exigence | Détail |
|----------|--------|
| **Navigateurs** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ (desktop) |
| **Mobile** | iOS 14+, Android 11+ (responsive web, PWA future) |
| **Formats fichiers** | PDF (A4, ISO 32000), CSV (RFC 4180), JSON (REST) |
| **Normes légales** | Conformité TVA France, template validé expert comptable |
| **Accessibility (WCAG 2.1 AA)** | Contraste, alt-text, keyboard nav, screen reader support |
| **i18n** | FR + EN (v1), extensible à autres langues (v2) |

### 4.6 Maintenabilité

| Exigence | Détail |
|----------|--------|
| **Code quality** | SonarQube score ≥ 85, test coverage ≥ 70% |
| **Documentation** | README, API spec (OpenAPI/Swagger), inline comments |
| **Version control** | Git flow, squashed commits, semantic versioning |
| **Deployment** | CI/CD (GitHub Actions), zero-downtime deploys (blue-green) |
| **Monitoring** | Logs centralisés (ELK), APM (New Relic/DataDog), alertes |
| **Backup/Restore** | Testable restore procedure, RTO <1h |

---

## 5. Architecture et Diagrammes

### 5.1 Architecture Système (High Level)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Web UI (Next.js/React)  │  Mobile (React Native / PWA) (future)    │
└────────────┬──────────────────────────────────┬──────────────────────┘
             │                                  │
             │ HTTPS / TLS 1.3                  │
             ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       API GATEWAY / LOAD BALANCER                    │
│                    (AWS ALB / Nginx + WAF)                           │
├─────────────────────────────────────────────────────────────────────┤
│  Rate Limiting │ CORS │ SSL Termination │ DDoS Protection           │
└───────────────────────────┬────────────────────────────────────────┘
                            │
        ┌───────────────────┼──────────────────┐
        │                   │                  │
        ▼                   ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│   API        │  │   API        │  │   API        │
│ Instance 1   │  │ Instance 2   │  │ Instance N   │
│(Next.js/     │  │(Stateless)   │  │(Auto-scale)  │
│Express)      │  │              │  │              │
└────┬─────────┘  └────┬─────────┘  └────┬─────────┘
     │                 │                  │
     └─────────────────┼──────────────────┘
                       │
        ┌──────────────┼────────────────┐
        │              │                │
        ▼              ▼                ▼
    ┌────────┐  ┌──────────┐  ┌──────────────┐
    │ Redis  │  │PostgreSQL│  │   S3 / CDN   │
    │(Cache) │  │  (DB)    │  │ (Assets,PDF) │
    └────────┘  └──────────┘  └──────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │  Email Service       │
            │  (SendGrid/AWS SES)  │
            └──────────────────────┘
```

### 5.2 User Flow - "Créer et Facturer un Client"

```
User                      App                       Backend
  │                        │                         │
  ├─── Sign up/Login ─────→│                         │
  │                        ├─── Authenticate ──────→│
  │                        │←─── JWT Token ────────┤
  │
  ├─── Ajouter Client ────→│                         │
  │   (nom, email,         ├─── Validate + Store──→│
  │    adresse)            │←─── Client ID ────────┤
  │
  ├─── Créer Facture ─────→│                         │
  │   (sélect client,      ├─── Auto-incr # ──────→│
  │    ajouter lignes,     ├─── Calc TVA/Total ────│
  │    conditions)         │←─── Draft saved ──────┤
  │
  ├─── Preview PDF ───────→│                         │
  │                        ├─── Generate PDF ─────→│ (LibreOffice/wkhtmltopdf)
  │                        │←─── PDF stream ───────┤
  │                        │←─── Display in browser
  │
  ├─── Émettre Facture ──→│                         │
  │                        ├─── Update Status ────→│
  │                        │    to ISSUED          │
  │                        │←─── Success ──────────┤
  │
  ├─── Envoyer par Email ─→│                         │
  │                        ├─── Send Email ───────→│ (SendGrid)
  │                        │←─── Confirmation ─────┤
  │
  ├─ Marquer Payée ──────→│                         │
  │                        ├─── Update Status ────→│
  │                        │    to PAID            │
  │                        │←─── Dashboard updated ┤
  │
  └─── View Dashboard ───→│                         │
                          ├─── Aggregate metrics ─→│
                          │←─── KPIs updated ─────┤
```

### 5.3 Data Flow - Invoice Lifecycle

```
┌──────────────┐
│  DRAFT       │  User creates invoice, saves locally
│ (Brouillon)  │  ◆ Auto-save every 10s
└──────┬───────┘
       │ Emit Click
       ▼
┌──────────────┐
│  ISSUED      │  Invoice officially sent
│ (Émise)      │  ◆ Date issued = now
│              │  ◆ Read-only (no edits)
│              │  ◆ PDF may be regenerated
└──────┬───────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌──────────────┐           ┌──────────────┐
│   PAID       │           │   OVERDUE    │
│ (Payée)      │           │ (Echéance ok)│
│              │           │              │
│ Marked by    │           │ Auto-detect  │
│ user w/date  │           │ if past dueD │
└──────┬───────┘           └──────┬───────┘
       │                           │
       │     Or cancellation       │
       │     click                 │
       └───────────┬───────────────┘
                   │
                   ▼
         ┌──────────────────┐
         │  CANCELLED       │
         │ (Annulée)        │
         │                  │
         │ Soft-deleted,    │
         │ kept in history  │
         └──────────────────┘
```

### 5.4 Database Schema (Simplified)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(255),
  siret VARCHAR(14),
  currency ENUM DEFAULT 'EUR',
  invoice_number_format VARCHAR(50) DEFAULT 'FAC-YYYY-NNN',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Clients Table (FK to users)
CREATE TABLE clients (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT,
  siret VARCHAR(14),
  is_archived BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_name (name)
);

-- Invoices Table (FK to users + clients)
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  currency ENUM DEFAULT 'EUR',
  status ENUM ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED') DEFAULT 'DRAFT',
  
  subtotal DECIMAL(12,2),
  tax_amount DECIMAL(12,2),
  discount_amount DECIMAL(12,2),
  total DECIMAL(12,2),
  
  paid_at TIMESTAMP,
  paid_amount DECIMAL(12,2),
  payment_method VARCHAR(50),
  
  internal_notes TEXT,
  terms_and_conditions TEXT,
  
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW(),
  issued_at TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_client_id (client_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);

-- Invoice Line Items Table
CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(12,2) NOT NULL,
  tax_rate DECIMAL(5,3) DEFAULT 0.20,  -- 20%, 5.5%, 0%
  line_total DECIMAL(12,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_invoice_id (invoice_id)
);

-- Audit Log Table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50),  -- 'INVOICE', 'CLIENT', 'USER'
  entity_id UUID,
  action VARCHAR(50),  -- 'CREATE', 'UPDATE', 'DELETE'
  changes JSON,  -- old vs new values
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_created_at (created_at)
);
```

### 5.5 API Endpoints (REST)

```
┌─ AUTHENTICATION ──────────────────────────────┐
│ POST   /auth/register          │ Sign up       │
│ POST   /auth/login             │ Log in        │
│ POST   /auth/logout            │ Log out       │
│ POST   /auth/password-reset    │ Reset pwd     │
└───────────────────────────────────────────────┘

┌─ CLIENTS ─────────────────────────────────────┐
│ GET    /clients                │ List          │
│ POST   /clients                │ Create        │
│ GET    /clients/:id            │ Detail        │
│ PUT    /clients/:id            │ Update        │
│ DELETE /clients/:id            │ Archive       │
│ POST   /clients/import         │ CSV import    │
│ GET    /clients/export         │ CSV export    │
└───────────────────────────────────────────────┘

┌─ INVOICES ────────────────────────────────────┐
│ GET    /invoices               │ List (filter) │
│ POST   /invoices               │ Create        │
│ GET    /invoices/:id           │ Detail        │
│ PUT    /invoices/:id           │ Update        │
│ DELETE /invoices/:id           │ Soft-delete   │
│ POST   /invoices/:id/emit      │ Mark ISSUED   │
│ POST   /invoices/:id/pay       │ Mark PAID     │
│ POST   /invoices/:id/cancel    │ Mark CANCEL   │
│ GET    /invoices/:id/pdf       │ Generate PDF  │
│ POST   /invoices/:id/send      │ Email         │
│ POST   /invoices/:id/duplicate │ Duplicate     │
└───────────────────────────────────────────────┘

┌─ DASHBOARD & METRICS ──────────────────────────┐
│ GET    /dashboard/summary      │ KPIs         │
│ GET    /dashboard/outstanding  │ Impayées     │
│ GET    /dashboard/overdue      │ Retard       │
│ GET    /metrics                │ Advanced     │
└────────────────────────────────────────────────┘

┌─ USER PROFILE ────────────────────────────────┐
│ GET    /me                     │ Profile       │
│ PUT    /me                     │ Update        │
│ POST   /me/avatar              │ Upload logo   │
│ POST   /me/signature           │ Upload sig    │
│ POST   /me/export              │ GDPR export   │
│ DELETE /me                     │ Delete acct   │
└───────────────────────────────────────────────┘
```

---

## 6. Critères d'Acceptation par Feature

### 6.1 Matrice CRUD Client

| Opération | Critère d'Acceptation |
|-----------|----------------------|
| **Create Client** | ✅ Créer client, assigné à user courant, unique per user+email |
| **Read Client** | ✅ Récupérer client par ID, voir liste + search full-text |
| **Update Client** | ✅ Modifier nom/email/adresse, factures existantes réflètent changes |
| **Delete Client** | ✅ Soft-delete (archive), factures restent liées, restore possible |
| **Import CSV** | ✅ Upload fichier, valider 100+ clients, rapport erreurs |
| **Export CSV** | ✅ Télécharger tous clients format CSV, tous champs |

### 6.2 Matrice CRUD Invoice

| Opération | Critère d'Acceptation |
|-----------|----------------------|
| **Create Draft** | ✅ Brouillon auto-save, numérotation atomique, TVA calc |
| **Edit Draft** | ✅ Modifier avant émission, sauvegarder changs, voir historique |
| **Emit (ISSUED)** | ✅ Transition DRAFT→ISSUED, timestamp, read-only après |
| **Mark Paid** | ✅ Statut PAID + date/montant, reflet dashboard |
| **Cancel Invoice** | ✅ Soft-delete, marquée CANCELLED, conservée audit trail |
| **Generate PDF** | ✅ < 3s, contient tous champs, téléchargeable |
| **Send Email** | ✅ PDF joint, email template, confirmation envoi archivée |

### 6.3 Matrice Dashboard

| Widget | Critère d'Acceptation |
|--------|----------------------|
| **Total Facturé** | ✅ Somme invoices (status=ISSUED+PAID) |
| **Total Payé** | ✅ Somme invoices (status=PAID) |
| **Total Impayé** | ✅ Somme invoices (status=ISSUED, date<today) |
| **Impayées** | ✅ Liste factures ISSUED non payées, triables |
| **Retard** | ✅ Flag factures dépassant due date, alert visuelle |
| **Graphiques** | ✅ Tendance revenus, distribution clients, taux collection |

### 6.4 Matrice Authentification

| Scénario | Critère d'Acceptation |
|----------|----------------------|
| **Sign-up** | ✅ Email + pwd, validation, confirmation email, accès 5min |
| **Login** | ✅ Email + pwd, JWT token valide 30j, "Remember me" |
| **Logout** | ✅ Invalidate session, impossible relancer api sans re-login |
| **Password Reset** | ✅ Email link (valide 1h), set new pwd, revoke old sessions |
| **Session Expiry** | ✅ Auto-logout après 30j inactivité, alerte 1j avant |

---

## 7. Priorisation Features (MVP vs Roadmap)

### 7.1 MVP - Phase 1 (Q1 2026 - PRIORITAIRE ABSOLUE)

**Priorité P0 (GO/NO-GO):**
- [x] **Authentification** (sign-up, login, logout)
- [x] **Gestion Clients** (CRUD basique, search)
- [x] **Création Factures** (draft, lignes, calculs TVA, statuts)
- [x] **Génération PDF** (export facture < 3s)
- [x] **Suivi Paiements** (marquer payée, dashboard simple)
- [x] **Paramètres Utilisateur** (profil, devise, numérotation)

**Ensemble du code:**
- ~2-3k lignes (frontend + backend)
- Stack: **Next.js 14 + TypeScript + Prisma + PostgreSQL**
- UI: **Shadcn/ui + Tailwind CSS**
- PDF: **puppeteer / pdfkit**
- Email: **SendGrid / AWS SES**

**Pas de features:**
- ❌ Multi-utilisateurs/équipes
- ❌ Paiement en ligne (Stripe)
- ❌ Intégration comptable
- ❌ Rappels email auto
- ❌ Devis/Dépenses

### 7.2 Phase 2 (Q2 2026)

**Priorité P1 (High-Value Quick-Wins):**
- [ ] **Rappels Email Automatiques** (email quand date dépassée)
- [ ] **Import/Export CSV** (clients, invoices)
- [ ] **Paiement en Ligne** (intégration Stripe optionnel)
- [ ] **Export Comptable** (XML/EDI compta)
- [ ] **Onboarding Guidé** (tour 4-5 étapes)
- [ ] **Alertes Notifications** (email alerts paramétrage)

### 7.3 Phase 3+ (Q3-Q4 2026+)

**Priorité P2 (Strategic):**
- [ ] **Devis → Conversion Facture** (templates devis)
- [ ] **Gestion Dépenses** (suivi charges)
- [ ] **API Ouverte** (webhooks, Zapier integration)
- [ ] **Rapports Avancés** (graphiques, export Excel)
- [ ] **Collaboration Équipe** (multi-user, permissions)
- [ ] **Mobile Native** (iOS/Android native app)
- [ ] **Intégration Bancaire** (rapprochement)
- [ ] **Support Multilingue** (ES, DE, IT)

---

## 8. Glossaire et Définitions

### Termes Métier

| Terme | Définition |
|-------|-----------|
| **Freelancer** | Personne physique exerçant une activité professionnelle indépendante (micro-entrepreneur, EIRL, auto-entrepreneur) |
| **PME** | Petite-Moyenne Entreprise, < 50 salariés en France |
| **Facture** | Document commercial prouvant une prestation/vente et demandant paiement |
| **Brouillon** | État préliminaire facture, modifiable, non-légale |
| **Émise** | Facture officialisée, datée, envoyée, non-modifiable |
| **TVA** | Taxe sur Valeur Ajoutée (20% standard, 5.5% réduit, 0% exempte en France) |
| **Conditions Paiement** | Délai avant règlement (Net 30, Net 60, immédiat) |
| **Impayée** | Facture émise non payée à la date écue |
| **SIRET** | Numéro identifiant unique entreprise France (14 chiffres) |
| **SIREN** | Numéro identifiant unique entreprise France (9 chiffres) |
| **EIRL** | Entreprise Individuelle Responsabilité Limitée |
| **DSO** | Days Sales Outstanding (jours moyen paiement) |

### Termes Techniques

| Terme | Définition |
|-------|-----------|
| **JWT** | JSON Web Token, authentification stateless |
| **CORS** | Cross-Origin Resource Sharing, contrôle accès API |
| **CSRF** | Cross-Site Request Forgery, attaque web |
| **SQL Injection** | Injection code SQL malveillant |
| **XSS** | Cross-Site Scripting, injection code JS |
| **Rate Limiting** | Limitation requêtes par IP/utilisateur |
| **SLA** | Service Level Agreement, uptime garanti |
| **RTO** | Recovery Time Objective, durée max indispo |
| **RPO** | Recovery Point Objective, perte data max |
| **CDN** | Content Delivery Network, distribution assets |
| **S3** | Simple Storage Service AWS, stockage cloud |
| **Redis** | Cache in-memory haute performance |
| **WCAG** | Web Content Accessibility Guidelines |

### Acronymes Clés

| Acronyme | Signification |
|----------|---------------|
| **MVP** | Minimum Viable Product (phase 1) |
| **KPI** | Key Performance Indicator |
| **NPS** | Net Promoter Score |
| **CSAT** | Customer Satisfaction |
| **DAU/WAU/MAU** | Daily/Weekly/Monthly Active Users |
| **CAC** | Customer Acquisition Cost |
| **LTV** | Lifetime Value |
| **TTI** | Time to Interactive |
| **FCP** | First Contentful Paint |
| **RGPD** | Régulation Générale Protection Données |
| **UX** | User Experience |
| **UI** | User Interface |
| **API** | Application Programming Interface |
| **PDF** | Portable Document Format |

---

## 9. Constraints et Assumptions

### 9.1 Contraintes Connues

1. **Légales/Réglementaires**
   - Conformité TVA France obligatoire dès 2024-2025
   - RGPD compliance (droit oubli, data export)
   - Format facture XML (UBL/e-invoice) peut être requis futur

2. **Techniques**
   - Stack Next.js choisi (React frontend, Node backend)
   - PostgreSQL pour données relationnelles
   - Pas de frameworks lourds (ex: Symfony, Laravel) pour simplicité

3. **Ressources**
   - Équipe initiale: 2-3 devs (frontend/backend)
   - Budget infrastructure: < $500/mois v1
   - Timeline: 8 semaines MVP (février-mars 2026)

4. **Marché**
   - Concurrence active (Facture.net, SumUp, FastBill)
   - Utilisateurs cherchent **gratuit/simple d'abord**
   - Churn utilisateur élevé possible (à combattre avec v2)

### 9.2 Assumptions Clés

| # | Assumption | Risque | Mitigation |
|---|-----------|--------|-----------|
| **A1** | Les freelances cherchent alternative **gratuite/simple** | Moyen | Validation early-adopters + NPS tracking |
| **A2** | Design minimaliste = adoption rapide | Moyen | A/B test UX, feedback boucles |
| **A3** | Réglementations TVA resteront stables 2026 | Moyen | Audit légal q3, templates validés expert |
| **A4** | Utilisateurs accepteront **export CSV over cloud-sync** | Faible | Confirm interviews v2, plan sync optionnel |
| **A5** | Infrastructure légère (Next.js) scale à 10k users | Faible | Load testing, DB partitioning prévue |
| **A6** | Email sending suffisant (pas SMS/Slack) | Faible | Monitoring engagement, ajouter SMS phase 2 |

---

## 10. Considérations Futures (Post-MVP)

### 10.1 Paiement en Ligne (Phase 2)
- Intégration Stripe Payments
- Lien paiement sécurisé dans PDF + email
- Webhook confirmation paiement → auto-mark paid
- Frais 2.9% + €0.30 visible utilisateur

### 10.2 Comptabilité Intégrée (Phase 3)
- Export XML/EDI norme France (UBL)
- Synchronisation comptable (Sage, LCL Multimédia)
- Rappel automatique TVA à la fin période

### 10.3 Équipes et Collaboration (Phase 3)
- Inviter collaborateurs (comptable, assistant)
- Permissions granulaires (edit, view, admin)
- Historique qui a modifié quoi

### 10.4 Devis et Dépenses (Phase 2-3)
- Template devis (similaire facture)
- Conversion auto devis → facture
- Suivi dépenses (invoices à payer)
- Marges/profitabilité par projet

---

## 11. Métriques de Succès & Monitoring

### 11.1 Dashboard Monitoring (Real-time)

**Outils:** Grafana + Prometheus + CloudWatch

- ✅ Uptime (% 99.5+)
- ✅ Error rate (< 0.1%)
- ✅ API response time p95 (< 200ms)
- ✅ PDF generation time (< 3s)
- ✅ Active users (DAU/WAU/MAU)
- ✅ Invoices created (count/day)
- ✅ Sign-ups (count/day)
- ✅ Support tickets (count/day)
- ✅ NPS feedback (rolling)

### 11.2 Checkpoints Décision

| Date | Milestone | Metric Cible | Go/No-Go |
|------|-----------|-------------|----------|
| **Feb 28** | Beta fermeture | 50 utilisateurs, 10+ feedbacks | Go→Phase 1 finale |
| **Mar 15** | Phase 1 Release | 100 utilisateurs, NPS≥30 | Go→Phase 2 planning |
| **Apr 30** | Adoption Q2 | 500+ MAU, 60% activation | Go→Phase 3 planning |
| **Jun 30** | Rétention check | 40% D30, NPS≥40 | Viabilité confirmée |

---

## 12. Appendix - Ressources Références

### 12.1 Documentations & Normes

- [Norme TVA France 2024-2025](https://www.economie.gouv.fr)
- [RGPD Official](https://gdpr-info.eu)
- [OpenAPI Specification](https://swagger.io/specification/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [REST API Best Practices](https://restfulapi.net/)

### 12.2 Outils Stack Confirmés

| Categorie | Outil | Version |
|-----------|-------|---------|
| Frontend | Next.js | 14 LTS |
| Frontend | React | 18+ |
| Frontend | TypeScript | 5+ |
| Frontend | Tailwind CSS | 3+ |
| Frontend | Shadcn/ui | Latest |
| Backend | Node.js | 18+ LTS |
| Backend | Express / Next API routes | - |
| Database | PostgreSQL | 15+ |
| ORM | Prisma | 5+ |
| Cache | Redis | 7+ |
| PDF | Puppeteer / pdfkit | Latest |
| Email | SendGrid / AWS SES | - |
| Storage | AWS S3 | - |
| Auth | JWT (jsonwebtoken) | - |
| Testing | Jest + Supertest | - |
| CI/CD | GitHub Actions | - |
| Monitoring | CloudWatch / DataDog | - |

### 12.3 Personas Détaillées

#### **Persona 1: Claire - Freelance Dev/Designer**
- Age: 28, Indépendante depuis 3 ans
- Revenue: €3-5k/mois variable
- Pain: "Je perds 4h/mois Excel, clients demandent factures numérotées pro"
- Willingness-to-pay: €0-5/mois (gratuit préféré)
- Usage: 5-8 factures/mois

#### **Persona 2: Marc - Consultant PME**
- Age: 45, Consultant seul, 2 salariés staff
- Revenue: €80-120k/an
- Pain: "Toujours Word pour factures, pas légal, clients oublient payer"
- Willingness-to-pay: €10-15/mois
- Usage: 15-20 factures/mois

#### **Persona 3: Sophie - Agence Créative 4-5 perso**
- Age: 38, Agence créative (graphisme, web)
- Revenue: €300-500k/an
- Pain: "Outils fragmentés (Sheets + emails), besoin rapports + collaboration"
- Willingness-to-pay: €20-30/mois
- Usage: 50-100 factures/mois

---

## 13. Approbations et Signatures

| Rôle | Nom | Date | Signature |
|------|------|------|-----------|
| **Product Manager** | TBD | 2026-02-16 | ☐ |
| **Lead Developer** | TBD | 2026-02-16 | ☐ |
| **Business Sponsor** | TBD | 2026-02-16 | ☐ |

---

**Document Version:** 1.0  
**Last Updated:** 2026-02-16  
**Next Review:** 2026-03-01  
**Status:** ✏️ DRAFT - Pending Approvals
