# User Stories - Application de Facturation PME

**Document Version:** 1.0  
**Date:** 16 février 2026  
**Statut:** Phase Planning - STORY DETAILING  
**Audience:** Équipe Engineering, Product, QA

---

## Table des Matières

- [EPIC-5: User Management & Onboarding](#epic-5-user-management--onboarding)
- [EPIC-1: Core Billing](#epic-1-core-billing)
- [EPIC-2: Client Management](#epic-2-client-management)
- [EPIC-4: PDF & Communication](#epic-4-pdf--communication)
- [EPIC-3: Payment Tracking](#epic-3-payment-tracking)
- [Summary & Metrics](#summary--metrics)

---

## EPIC-5: User Management & Onboarding

### Story EPIC-5-001: User Registration

**Titre:** Créer un nouveau compte utilisateur

**Format Story:**  
> As a **new user**, I want to **register with email and password**, so that **I can access the application**.

**Description:**  
Permettre aux nouveaux utilisateurs de créer un compte en fournissant un email et un mot de passe. Validation du format email et force du mot de passe. Stockage sécurisé du mot de passe en bcrypt. Email unique par utilisateur.

**Critères d'Acceptation:**
- [ ] Formulaire sign-up affiche champs: email, password, password-confirm
- [ ] Validation email: format RFC 5322, unique en base (contrainte DB)
- [ ] Validation password: min 8 caractères, 1 majuscule, 1 chiffre, 1 spécial
- [ ] Bouton "S'inscrire" disabled si validation échoue
- [ ] Erreurs affichées inline sous champs
- [ ] Password hashé bcrypt (cost 10) avant stockage
- [ ] Utilisateur créé en DB + JWT token retourné
- [ ] Email de bienvenue envoyé (SendGrid)
- [ ] Redirection vers profil setup après succès
- [ ] Rate limit: max 5 inscriptions/IP/jour
- [ ] Response time < 500ms

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-5  
**Dependencies:** None  
**Labels:** auth, registration, security

---

### Story EPIC-5-002: User Login

**Titre:** Se connecter avec email et mot de passe

**Format Story:**  
> As a **registered user**, I want to **login with email and password**, so that **I can access my invoices**.

**Description:**  
Authentification par email/mot de passe. Génération JWT token valide 30 jours. Gestion erreurs (email non trouvé, password incorrect, compte désactivé). Rate limiting.

**Critères d'Acceptation:**
- [ ] Formulaire login affiche email, password, "Forgot password?" link
- [ ] Validation: email + password required
- [ ] Appel POST /api/auth/login avec credentials
- [ ] Password comparé via bcrypt.compare()
- [ ] Erreur si email non trouvé → "Email ou mot de passe incorrect"
- [ ] Erreur si password incorrect → "Email ou mot de passe incorrect" (pas de révélation)
- [ ] Token JWT généré avec sub=userId, exp=30 jours, HS256
- [ ] Token stocké localStorage (v1, XSS risk accepted)
- [ ] Redirection vers dashboard après succès
- [ ] Session persiste si token valide au refresh page
- [ ] Rate limit: 5 tentatives/15 minutes/IP
- [ ] Response time < 300ms

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-001  
**Labels:** auth, login

---

### Story EPIC-5-003: Password Reset

**Titre:** Réinitialiser le mot de passe oublié

**Format Story:**  
> As a **user with forgotten password**, I want to **reset it via email link**, so that **I can regain access**.

**Description:**  
Envoi d'email avec lien reset valide 1 heure. Validation du token. Nouveau password avec validation format. Invalidation du lien après utilisation.

**Critères d'Acceptation:**
- [ ] Page "Forgot Password" avec champ email
- [ ] Bouton "Envoyer lien reset"
- [ ] Email vérifié existe en DB
- [ ] Token généré (UUID) + stocké en DB avec exp 1h
- [ ] Email envoyé via SendGrid avec lien: `/reset-password?token=XXX`
- [ ] Lien valide 1h seulement
- [ ] Page reset affiche password + confirm fields
- [ ] Validation nouveau password (8+ chars, 1 maj, 1 chiffre, 1 spécial)
- [ ] Token validé, non expiré, non utilisé
- [ ] Password mis à jour bcrypt, token invalidé
- [ ] Message succès: "Mot de passe réinitialisé"
- [ ] Lien expiré → "Lien expiré, demander nouveau"
- [ ] Response time < 500ms

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-001  
**Labels:** auth, security, email

---

### Story EPIC-5-004: User Profile View

**Titre:** Afficher le profil utilisateur

**Format Story:**  
> As a **user**, I want to **view my profile details**, so that **I can see my account information**.

**Description:**  
Affichage des infos profil: nom, email, téléphone, adresse, SIRET/company, logo, signature. Panel ou page dédiée. Read-only ou editable selon contexte.

**Critères d'Acceptation:**
- [ ] Page profile affiche en panel ou route /profile
- [ ] Affichage: firstname, lastname, email, phone, address, company, SIRET
- [ ] Logo affiché si uploadé (thumbnail)
- [ ] Signature affichée si uploadée (thumbnail)
- [ ] Bouton "Éditer" toggle edit mode
- [ ] Champs non-éditables: email (sauf via settings), userId, createdAt
- [ ] Avatar placeholder si pas logo
- [ ] Response time < 200ms
- [ ] Mobile responsive

**Story Points:** 3  
**Priority:** P0  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-001  
**Labels:** profile, user-info

---

### Story EPIC-5-005: Update User Profile

**Titre:** Modifier les informations de profil

**Format Story:**  
> As a **user**, I want to **update my profile details**, so that **my invoices reflect accurate company info**.

**Description:**  
Édition des champs profil (nom, téléphone, adresse, etc). Validation des inputs. Sauvegarde optimiste. Audit trail des modifications.

**Critères d'Acceptation:**
- [ ] Formulaire édition: firstname, lastname, phone, address, city, zipcode
- [ ] Validation firstname/lastname: 2+ chars, no special chars
- [ ] Validation phone: format E.164 ou vide
- [ ] Validation zipcode: regex France (5 digits)
- [ ] Bouton "Sauvegarder" → PATCH /api/user/profile
- [ ] Validation côté serveur identique
- [ ] Succès: toast "Profil mis à jour"
- [ ] Erreur: toast rouge + détails
- [ ] Donnée sauvegardée en DB + audit log (user_id, field, old_value, new_value, timestamp)
- [ ] Response time < 300ms
- [ ] Optimistic update UI (show changes before server response)

**Story Points:** 3  
**Priority:** P0  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-001  
**Labels:** profile, form, validation

---

### Story EPIC-5-006: Company SIRET & Info Setup

**Titre:** Configurer SIRET et infos entreprise

**Format Story:**  
> As a **business user**, I want to **enter my SIRET and company details**, so that **invoices include correct legal info**.

**Description:**  
Entrée SIRET, régime fiscal, Code APE, raison sociale. Validation SIRET par regex. Affichage en factures générées.

**Critères d'Acceptation:**
- [ ] Formulaire avec champs: SIRET, companyName, fiscalRegime, APECode
- [ ] Validation SIRET: regex 14 digits format
- [ ] Validation SIRET: unique error si déjà utilisé
- [ ] Validation fiscalRegime: dropdown (Micro, Real, EIRL, SARL)
- [ ] Validation APECode: 4 digits + 1 letter
- [ ] Bouton "Enregistrer"
- [ ] Données sauvegardées user table
- [ ] Succès: toast confirmation
- [ ] SIRET affiché dans factures PDFs
- [ ] Response time < 300ms

**Story Points:** 3  
**Priority:** P0  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-005  
**Labels:** setup, company-info, validation

---

### Story EPIC-5-007: Logo Upload

**Titre:** Télécharger logo entreprise

**Format Story:**  
> As a **user**, I want to **upload my company logo**, so that **it appears on invoices and dashboard**.

**Description:**  
Upload image logo (PNG, JPG). Compression. Stockage. Affichage dans profil et invoices PDF.

**Critères d'Acceptation:**
- [ ] Page profile affiche "Upload Logo" button
- [ ] Formulaire file input, type image/* only
- [ ] Max file size 2MB
- [ ] Accepted formats: jpg, jpeg, png, webp
- [ ] Validation côté client: format, size
- [ ] Validation côté serveur: magic bytes image
- [ ] Compression sharp: max 500x500px, quality 80%
- [ ] Upload Multer → /uploads/logo-{userId}-{timestamp}.png
- [ ] Thumbnail affiché après upload (75x75px)
- [ ] DB stockage: logoUrl (path/S3 key)
- [ ] Logo affiché en entête facture PDF
- [ ] Delete button pour supprimer logo
- [ ] Success toast: "Logo uploadé"
- [ ] Response time < 2s

**Story Points:** 5  
**Priority:** P1  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-005  
**Labels:** file-upload, images, ui

---

### Story EPIC-5-008: Signature Upload

**Titre:** Télécharger signature numérique

**Format Story:**  
> As a **user**, I want to **upload my signature image**, so that **it appears on invoices PDF**.

**Description:**  
Upload image signature (PNG, JPG, transparent preferred). Compression. Affichage pied de page factures.

**Critères d'Acceptation:**
- [ ] Page profile affiche "Upload Signature" button
- [ ] Formulaire file input, type image/* only
- [ ] Max file size 1MB
- [ ] Accepted formats: png, jpg, jpeg, webp
- [ ] Validation côté client/serveur: format, size, magic bytes
- [ ] Compression: max 200x100px, quality 85%
- [ ] Upload Multer → /uploads/signature-{userId}-{timestamp}.png
- [ ] Preview affiché après upload
- [ ] DB stockage: signatureUrl
- [ ] Signature affiché en pied facture PDF
- [ ] Delete button pour supprimer
- [ ] Success toast: "Signature uploadée"
- [ ] Response time < 2s

**Story Points:** 5  
**Priority:** P1  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-005  
**Labels:** file-upload, images

---

### Story EPIC-5-009: Invoice Number Format Configuration

**Titre:** Personnaliser le format de numérotation des factures

**Format Story:**  
> As a **user**, I want to **customize invoice number format**, so that **it matches my company's standard**.

**Description:**  
Param format numérotation: prefix, suffix, variables (année, mois, séquence). Examples: FAC-2026-001, INV-2026-02-0001, etc.

**Critères d'Acceptation:**
- [ ] Page settings affiche "Invoice Number Format"
- [ ] Champ texte input avec variables disponibles: {YEAR}, {MONTH}, {SEQ}
- [ ] Exemple: "FAC-{YEAR}-{SEQ}" → "FAC-2026-001"
- [ ] Validation: min 3 chars, max 50 chars
- [ ] Validation: doit contenir au minimum {SEQ}
- [ ] Preview affiche numéro généré (ex. FAC-2026-001)
- [ ] Bouton "Enregistrer"
- [ ] Format sauvegardé en user settings
- [ ] Prochaines factures utilisent nouveau format
- [ ] Séquence reset si format change
- [ ] Response time < 300ms

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-005  
**Labels:** settings, configuration

---

### Story EPIC-5-010: Default Payment Terms Configuration

**Titre:** Paramétrer les conditions de paiement par défaut

**Format Story:**  
> As a **user**, I want to **set default payment terms**, so that **they auto-populate on invoices**.

**Description:**  
Param conditions paiement: Net 30, Net 60, Immédiat, Custom. Affichage factures générées.

**Critères d'Acceptation:**
- [ ] Page settings affiche "Default Payment Terms"
- [ ] Dropdown: "Immédiat", "Net 30", "Net 60", "Custom"
- [ ] Si Custom: champ jours input (max 365)
- [ ] Validation: positive integer, max 365
- [ ] Bouton "Enregistrer"
- [ ] Valeur sauvegardée user settings
- [ ] Nouvelles factures pré-remplies ce terme
- [ ] Utilisateur peut override per facture
- [ ] Response time < 300ms

**Story Points:** 2  
**Priority:** P1  
**Epic:** EPIC-5  
**Dependencies:** EPIC-5-005  
**Labels:** settings, configuration

---

## EPIC-1: Core Billing

### Story EPIC-1-001: Create Invoice Draft

**Titre:** Créer une facture brouillon

**Format Story:**  
> As a **user**, I want to **create a new invoice in draft status**, so that **I can add items and save it before issuing**.

**Description:**  
Création facture empty, status=DRAFT, auto-assigné userId et createdAt. Interface form avec client selection, items array, totals calculated.

**Critères d'Acceptation:**
- [ ] Route POST /api/invoices, crée nouveau invoice
- [ ] Utilisateur non authentifié → erreur 401
- [ ] Facture initialisée: status=DRAFT, userId=logged-in, createdAt=now
- [ ] invoiceNumber = null (assigné à l'issue)
- [ ] clientId, items[], subtotal, tax, total = initial defaults
- [ ] Response: 201 + invoice object avec id (UUID)
- [ ] Facture persiste en DB
- [ ] Auto-save activé (PUT every 10s si unsaved changes)
- [ ] Response time < 500ms
- [ ] Utilisateur redirigé vers edit form

**Story Points:** 13  
**Priority:** P0  
**Epic:** EPIC-1  
**Dependencies:** EPIC-5-001  
**Labels:** billing, invoice, draft

---

### Story EPIC-1-002: Add/Edit Invoice Line Items

**Titre:** Ajouter/modifier/supprimer des lignes articles

**Format Story:**  
> As a **user**, I want to **add, edit, and remove invoice line items**, so that **I can build a complete invoice**.

**Description:**  
Gestion lignes articles: description, quantity, unit price, tax rate. Calculs automatiques (amount = qty × unit_price, row_tax = amount × tax_rate).

**Critères d'Acceptation:**
- [ ] Formulaire affiche table items vide initialement
- [ ] Bouton "Ajouter ligne" → ligne vide + inputs
- [ ] Champs ligne: description, quantity, unitPrice, taxRate (0%, 5.5%, 20%)
- [ ] Validation description: 3+ chars, max 500 chars
- [ ] Validation quantity: positive number, max 9999
- [ ] Validation unitPrice: positive number, 2 decimals max
- [ ] Calcul automatique: amount = qty × unitPrice
- [ ] Calcul automatique: lineTax = amount × (taxRate/100)
- [ ] Affichage total ligne avec tax
- [ ] Bouton "Supprimer" par ligne
- [ ] Bouton "Éditer" toggle edit mode par ligne
- [ ] Min 1 ligne, max 50 lignes
- [ ] PUT /api/invoices/{id}/items sauvegarde
- [ ] Delete /api/invoices/{id}/items/{lineId} supprime
- [ ] Response time < 300ms per action

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-001  
**Labels:** billing, line-items, forms

---

### Story EPIC-1-003: Auto-calculate Invoice Totals with VAT

**Titre:** Calculer automatiquement les totaux avec TVA

**Format Story:**  
> As a **user**, I want to **invoice totals calculated automatically**, so that **I don't make math errors**.

**Description:**  
Calculs totaux: subtotal (SUM amounts), tax (SUM line taxes), total (subtotal + tax). TVA taux: 0%, 5.5%, 20%. Affichage temps réel.

**Critères d'Acceptation:**
- [ ] Subtotal = SUM(qty × unitPrice) for all lines
- [ ] Tax par taux: 0%, 5.5%, 20% calculés séparément
- [ ] Total tax = SUM(line taxes)
- [ ] Total = subtotal + total tax
- [ ] Affichage: subtotal, [tax @ 0%], [tax @ 5.5%], [tax @ 20%], total
- [ ] Mise à jour temps réel quand ligne modifiée
- [ ] Calculs côté frontend ET backend (validation)
- [ ] Arrondi 2 decimals (banker's rounding)
- [ ] Display formatage EUR (€ symbol, , decimals)
- [ ] Response time < 100ms calcul

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-002  
**Labels:** billing, calculations, validation

---

### Story EPIC-1-004: Invoice Numbering - Atomic Increment

**Titre:** Générer numéros de facture atomiques sans doublons

**Format Story:**  
> As a **system**, I want to **assign unique invoice numbers atomically**, so that **no duplicates exist**.

**Description:**  
Numérotation atomique via transaction DB. Séquence par user + année. Format configurable. Validation d'unicité.

**Critères d'Acceptation:**
- [ ] Numéro attribué lors de l'issue (DRAFT→ISSUED)
- [ ] Format = userSetting.numberFormat (ex: FAC-{YEAR}-{SEQ})
- [ ] Séquence incrémentale (1, 2, 3...) par user, par année
- [ ] Reset séquence à 1 le 1er janvier
- [ ] DB transaction: BEGIN → assignNumber → COMMIT (atomique)
- [ ] Race condition test: 100 concurrent issues → 0 doublons
- [ ] Unicité constraint: (userId, invoiceNumber) unique
- [ ] Assignation en < 500ms même avec concurrent requests
- [ ] Retour du numéro attribué

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-001, EPIC-5-009  
**Labels:** billing, database, concurrency

---

### Story EPIC-1-005: Invoice Status Workflow

**Titre:** Gérer les transitions d'état des factures

**Format Story:**  
> As a **user**, I want to **transition invoices between DRAFT, ISSUED, PAID, CANCELLED**, so that **I track invoice lifecycle**.

**Description:**  
Workflow d'état: DRAFT → ISSUED (+ issuedAt), ISSUED → PAID (+ paidAt) ou CANCELLED (+ cancelledAt). Transitions validées, transitions invalides rejetées.

**Critères d'Acceptation:**
- [ ] Facture créée en status DRAFT
- [ ] DRAFT → ISSUED: validations (client, items, totals) + timestamp issuedAt
- [ ] DRAFT → CANCELLED: set cancelledAt, reste accessible
- [ ] ISSUED → PAID: set paidAt, set paidAmount (default = total)
- [ ] ISSUED → CANCELLED: set cancelledAt
- [ ] Transitions invalides rejetées (ex: PAID → DRAFT)
- [ ] API endpoint PATCH /api/invoices/{id}/status
- [ ] Validation erreurs claires: "Cannot cancel issued invoice"
- [ ] Audit log chaque transition (old_status, new_status, timestamp, userId)
- [ ] UI affiche current status + available actions
- [ ] Response time < 300ms

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-001  
**Labels:** billing, workflow, state-machine

---

### Story EPIC-1-006: Read-Only Post-Issue Protection

**Titre:** Protéger les factures émises de la modification

**Format Story:**  
> As a **system**, I want to **prevent edits to issued invoices**, so that **invoices remain legally immutable**.

**Description:**  
Factures avec status !== DRAFT ne peuvent pas être éditées (items, totals, etc). Read-only après émission. Audit trail pour traçabilité.

**Critères d'Acceptation:**
- [ ] PUT/PATCH line items rejected si status !== DRAFT
- [ ] Error message: "Cannot edit issued invoice"
- [ ] Frontend: désactiver inputs, hide edit buttons pour ISSUED+
- [ ] Seul cancelledAt/paidAt peuvent être modifiés après ISSUED
- [ ] Response 403 Forbidden si tentative d'edit
- [ ] Audit log: every edit attempt (success/failure)
- [ ] Admin peut override (future feature)
- [ ] Response time < 100ms validation

**Story Points:** 3  
**Priority:** P0  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-005  
**Labels:** billing, security, immutability

---

### Story EPIC-1-007: Invoice Audit Trail & History

**Titre:** Enregistrer l'historique complet des modifications de factures

**Format Story:**  
> As a **user**, I want to **view invoice history and audit trail**, so that **I see who changed what and when**.

**Description:**  
Table audit: entity_id, action (create, update, delete), changes JSON, changedBy (userId), changedAt. Affichage UI panel historique.

**Critères d'Acceptation:**
- [ ] Table invoice_audit_logs: invoiceId, action, changes (JSON), userId, timestamp
- [ ] Log créé pour: CREATE, UPDATE status, UPDATE items, UPDATE client, ISSUE, MARK_PAID, CANCEL
- [ ] Changes JSON contient: { field: value, old_value: X, new_value: Y }
- [ ] Page detail invoice affiche "History" panel/modal
- [ ] History affiche timeline: "John marked paid on 2026-02-15 10:30"
- [ ] Clicking timeline item affiche détails changes
- [ ] Min 10+ entries supportés sans perf issue
- [ ] Query history: GET /api/invoices/{id}/history
- [ ] Response time < 300ms

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-001  
**Labels:** billing, audit, history

---

### Story EPIC-1-008: Invoice Details View

**Titre:** Afficher les détails complets d'une facture

**Format Story:**  
> As a **user**, I want to **view complete invoice details**, so that **I can review before sending**.

**Description:**  
Vue facture: en-tête client, items table, totaux, status, actions disponibles. Detail page ou side panel.

**Critères d'Acceptation:**
- [ ] Route GET /api/invoices/{id} retourne facture + client + items
- [ ] Page/panel affiche:
  - [ ] Numéro facture, date, client (name, email, adresse)
  - [ ] Table lignes: description, qty, unit price, tax, amount
  - [ ] Subtotal, tax breakdown, total
  - [ ] Status badge, dates (created, issued, paid)
  - [ ] History panel
  - [ ] Action buttons (Edit, Issue, Mark Paid, Cancel, Download PDF, Email)
- [ ] Responsive design (mobile OK)
- [ ] PDF preview button
- [ ] Back button retour list
- [ ] Response time < 300ms

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-001, EPIC-1-003  
**Labels:** billing, ui, details

---

### Story EPIC-1-009: Auto-Save Draft Invoices

**Titre:** Auto-sauvegarder les brouillons automatiquement

**Format Story:**  
> As a **user**, I want to **changes auto-saved every 10 seconds**, so that **I don't lose work on browser crash**.

**Description:**  
Debounce auto-save: détect changement → attendre 10s inactivité → PUT to server. Visual indicator "Saving..." / "Saved".

**Critères d'Acceptation:**
- [ ] Chaque modification input → set unsavedChanges flag
- [ ] Debounce timer 10s inactivité → auto-save trigger
- [ ] UI affiche "Saving..." spinner
- [ ] Auto-save PUT /api/invoices/{id} avec données complètes
- [ ] Succès: "Saved at HH:MM" message
- [ ] Erreur: toast "Save failed, retrying..."
- [ ] Retry exponential backoff (5s, 25s, 125s)
- [ ] Max 3 retries before user alert
- [ ] Works offline: queue requests, sync when online
- [ ] Disable auto-save si status !== DRAFT
- [ ] Response time < 1s per save

**Story Points:** 5  
**Priority:** P1  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-001  
**Labels:** billing, ux, offline

---

### Story EPIC-1-010: Duplicate Invoice

**Titre:** Quick-copy facture existante

**Format Story:**  
> As a **user**, I want to **duplicate an existing invoice**, so that **I quickly create similar invoices**.

**Description:**  
Copier facture: crée nouvelle DRAFT avec mêmes items, client, totals. Utilise pour récurrents clients.

**Critères d'Acceptation:**
- [ ] Button "Duplicate" dans detail view
- [ ] POST /api/invoices/{id}/duplicate
- [ ] Nouvelle facture: copy clientId, items[], same taux TVA, status=DRAFT
- [ ] Ignore: invoiceNumber, issuedAt, paidAt, cancelledAt
- [ ] Reset createdAt = now
- [ ] Redirect detail page nouvelle copie
- [ ] Success toast: "Facture dupliquée"
- [ ] Response time < 500ms

**Story Points:** 5  
**Priority:** P1  
**Epic:** EPIC-1  
**Dependencies:** EPIC-1-001  
**Labels:** billing, quick-action

---

## EPIC-2: Client Management

### Story EPIC-2-001: Create Client

**Titre:** Créer un nouveau client

**Format Story:**  
> As a **user**, I want to **add a new client to my directory**, so that **I can issue invoices to them**.

**Description:**  
Formulaire création client: nom, email, téléphone, adresse, SIRET/company. Validation champs. Stockage DB.

**Critères d'Acceptation:**
- [ ] Route POST /api/clients
- [ ] Champs obligatoires: firstName, lastName, email, companyName
- [ ] Champs optionnels: phone, address, city, zipcode, SIRET, notes
- [ ] Validation email: format + unique per user (user_id, email)
- [ ] Validation phone: E.164 ou vide
- [ ] Validation SIRET: regex si fourni
- [ ] Validation zipcode: France 5 digits ou vide
- [ ] Client créé DB avec userId, createdAt
- [ ] Response 201 + client object
- [ ] Redirection detail client après création
- [ ] Response time < 500ms

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-2  
**Dependencies:** EPIC-5-001  
**Labels:** clients, crud, form

---

### Story EPIC-2-002: Client Details View

**Titre:** Afficher les détails du client et ses factures

**Format Story:**  
> As a **user**, I want to **view client profile and invoicing history**, so that **I track client relationship**.

**Description:**  
Profile client: infos, contact, historique factures (list, total, paid, outstanding).

**Critères d'Acceptation:**
- [ ] Route GET /api/clients/{id}
- [ ] Page affiche: name, email, phone, address, SIRET, company
- [ ] Onglet "Factures" affiche table avec:
  - [ ] Numéro, date, total, status, actions
  - [ ] Tri par date descending default
  - [ ] Quick actions: view, email, mark paid
- [ ] Résumé totaux: Total facturé, Payé, Impayé, Retard
- [ ] Button "Créer facture pour ce client"
- [ ] Button "Éditer" → edit mode
- [ ] Response time < 300ms

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, details

---

### Story EPIC-2-003: Update Client

**Titre:** Modifier les infos du client

**Format Story:**  
> As a **user**, I want to **update client details**, so that **my records stay current**.

**Description:**  
Edit client: tous champs éditables sauf userId. Validations idem création. Audit log.

**Critères d'Acceptation:**
- [ ] Route PATCH /api/clients/{id}
- [ ] Formulaire pré-rempli données actuelles
- [ ] Champs éditables: firstName, lastName, email, phone, address, etc.
- [ ] Validations: email unique, phone format, SIRET regex, zipcode
- [ ] Email uniqueness check: (userId, email) != current client
- [ ] Bouton "Sauvegarder"
- [ ] Success toast, redirect detail page
- [ ] Audit log: changes JSON
- [ ] Response time < 300ms

**Story Points:** 3  
**Priority:** P0  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, crud, form

---

### Story EPIC-2-004: Archive Client

**Titre:** Archiver un client sans supprimer les données

**Format Story:**  
> As a **user**, I want to **archive inactive clients**, so that **my active list stays clean**.

**Description:**  
Soft-delete: set isArchived=true. Client hidden from list sauf filter. Factures restent accessibles. Pas de suppression physique.

**Critères d'Acceptation:**
- [ ] Route PATCH /api/clients/{id}/archive
- [ ] Set isArchived=true, archivedAt=now
- [ ] Client disappears de list par défaut
- [ ] Filter "Show archived" affiche clients archivés
- [ ] Factures liées restent accessibles
- [ ] Button "Unarchive" dans detail view si archived
- [ ] PATCH /api/clients/{id}/unarchive restore
- [ ] Response time < 200ms

**Story Points:** 3  
**Priority:** P0  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, soft-delete

---

### Story EPIC-2-005: List Clients View

**Titre:** Afficher la liste de tous les clients

**Format Story:**  
> As a **user**, I want to **see all my clients in a table**, so that **I can browse and search**.

**Description:**  
Table clients paginée, triable, avec colonnes: name, email, company, created date, actions.

**Critères d'Acceptation:**
- [ ] Route GET /api/clients (query params: page, limit, sort, archived)
- [ ] Tableau affiche: name, email, companyName, createdAt, invoiceCount
- [ ] Tri: nom (asc/desc), date (asc/desc)
- [ ] Pagination: limit 50 default, max 100
- [ ] Exclus archived par défaut (unless filter checked)
- [ ] Row click → detail page
- [ ] Quick actions: view, edit, archive, delete (swipe mobile)
- [ ] Empty state si 0 clients
- [ ] Response time < 300ms

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, list, table

---

### Story EPIC-2-006: Client Search Full-Text

**Titre:** Rechercher clients par nom, email, SIRET

**Format Story:**  
> As a **user**, I want to **search clients instantly**, so that **I find the right client quickly**.

**Description:**  
Search input avec FTS PostgreSQL. Requête LIKE sur name, email, SIRET. Debounce 300ms.

**Critères d'Acceptation:**
- [ ] Search input dans list header
- [ ] Typing → debounce 300ms → query backend
- [ ] POST /api/clients/search { query: "john" }
- [ ] FTS sur: firstName, lastName, email, companyName, SIRET
- [ ] Case-insensitive, partial match
- [ ] Results < 100ms pour 1000 clients
- [ ] Exclude archived sauf explicit filter
- [ ] Display results count: "12 results"
- [ ] Clear button reset search
- [ ] Empty state si no results
- [ ] Mobile: soft keyboard appearance

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, search, performance

---

### Story EPIC-2-007: Client Autocomplete (Invoice Creation)

**Titre:** Auto-complétion client lors de la création de facture

**Format Story:**  
> As a **user**, I want to **autocomplete client name while creating invoice**, so that **selection is fast**.

**Description:**  
Dropdown autocomplete: typing → live suggestions. Select to auto-populate facture. Debounce 300ms.

**Critères d'Acceptation:**
- [ ] Invoice form client field: text input + dropdown
- [ ] Typing → query /api/clients/autocomplete?q=text
- [ ] Debounce 300ms, min 1 char
- [ ] Results affichent: name, email, company (10 max)
- [ ] Click result → populate clientId + auto-fetch client data
- [ ] Response < 200ms
- [ ] Keyboard navigation (arrow keys, enter)
- [ ] Mobile: soft keyboard OK

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, autocomplete, ux

---

### Story EPIC-2-008: Favorite Clients

**Titre:** Marquer clients favoris pour accès rapide

**Format Story:**  
> As a **user**, I want to **mark favorite clients**, so that **I quickly find frequent clients**.

**Description:**  
Toggle favorite flag. Affichage en top de list. Tri rapide.

**Critères d'Acceptation:**
- [ ] Star icon dans list/detail view
- [ ] Click → toggle isFavorite flag
- [ ] PATCH /api/clients/{id}/favorite
- [ ] Clients favoris affichés en premier de list
- [ ] Visual indicator: gold star filled vs empty
- [ ] Filter "Favorites only" checkbox
- [ ] Response time < 200ms

**Story Points:** 3  
**Priority:** P1  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, quick-access, ux

---

### Story EPIC-2-009: Import Clients from CSV

**Titre:** Importer clients depuis fichier CSV

**Format Story:**  
> As a **user**, I want to **import bulk clients from CSV**, so that **I migrate from Excel quickly**.

**Description:**  
Upload CSV file. Parse, validé, inséré en batch. Rapport erreurs. Format attendu: firstName, lastName, email, phone, etc.

**Critères d'Acceptation:**
- [ ] Page clients, bouton "Import CSV"
- [ ] File input CSV max 10MB
- [ ] Parse Papa Parse library
- [ ] Expected columns: firstName, lastName, email, companyName, phone, address (optional)
- [ ] Validation: email required + unique per user, firstName/lastName required
- [ ] Error report: row number, field, error detail (ex: "Row 5: Email invalid")
- [ ] Dry run option: preview + confirm before insert
- [ ] Batch insert 100 clients < 2s
- [ ] Success message: "120 clients imported, 3 skipped" + download error CSV
- [ ] Response time < 3s total
- [ ] Audit log CSV import

**Story Points:** 8  
**Priority:** P1  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, bulk-import, csv

---

### Story EPIC-2-010: Export Clients to CSV

**Titre:** Exporter tous les clients en CSV

**Format Story:**  
> As a **user**, I want to **export clients as CSV**, so that **I can integrate with other tools**.

**Description:**  
Export all non-archived clients CSV. Download direct navigateur. Format Excel-compatible.

**Critères d'Acceptation:**
- [ ] Bouton "Export CSV" dans list header
- [ ] GET /api/clients/export
- [ ] CSV columns: firstName, lastName, email, phone, address, city, zipcode, companyName, SIRET, createdAt
- [ ] Encoding UTF-8 BOM (Excel FR compatible)
- [ ] Filename: clients-{date}.csv (ex: clients-2026-02-15.csv)
- [ ] Download direct navigateur (content-disposition)
- [ ] Exclude archived clients
- [ ] Response time < 2s pour 1000 clients
- [ ] File size < 10MB

**Story Points:** 3  
**Priority:** P1  
**Epic:** EPIC-2  
**Dependencies:** EPIC-2-001  
**Labels:** clients, export, csv

---

## EPIC-4: PDF & Communication

### Story EPIC-4-001: Generate Invoice PDF

**Titre:** Générer facture en PDF

**Format Story:**  
> As a **user**, I want to **generate invoice as PDF**, so that **I send professional documents**.

**Description:**  
Conversion facture HTML → PDF via Puppeteer. Template Tailwind CSS. Logo, signature, taux TVA. < 3s generation.

**Critères d'Acceptation:**
- [ ] Route POST /api/invoices/{id}/pdf
- [ ] Template HTML: en-tête (logo, company info), client, lignes, totaux, signature
- [ ] Tailwind CSS styling, A4 format
- [ ] Logo affiché si uploadé (en-tête top-left)
- [ ] Signature affiché si uploadée (pied de page)
- [ ] SIRET/company info légale
- [ ] Taux TVA breakdown (0%, 5.5%, 20%) si applicable
- [ ] Date émission (issuedAt) ou today si DRAFT
- [ ] Puppeteer headless → PDF bytes
- [ ] Generation < 3s p95
- [ ] Response: PDF file avec nom: FAC-{number}.pdf
- [ ] Error handling: missing data → clear error message

**Story Points:** 13  
**Priority:** P0  
**Epic:** EPIC-4  
**Dependencies:** EPIC-1-001, EPIC-5-007, EPIC-5-008  
**Labels:** pdf, generation, design

---

### Story EPIC-4-002: Download PDF Invoice

**Titre:** Télécharger facture PDF

**Format Story:**  
> As a **user**, I want to **download invoice PDF to my computer**, so that **I can archive and share**.

**Description:**  
Bouton "Download PDF" dans detail facture. Génère PDF, navigateur download. Filename cohérent.

**Critères d'Acceptation:**
- [ ] Button "Download PDF" dans invoice detail view
- [ ] Click → POST /api/invoices/{id}/pdf
- [ ] PDF généré (voir EPIC-4-001)
- [ ] Navigateur download automatique
- [ ] Filename: FAC-{invoiceNumber}-{date}.pdf (ex: FAC-2026-001-2026-02-15.pdf)
- [ ] Content-Type: application/pdf, Content-Disposition: attachment
- [ ] Success toast: "PDF téléchargé"
- [ ] Erreur: toast rouge avec détails
- [ ] Response time < 3s

**Story Points:** 3  
**Priority:** P0  
**Epic:** EPIC-4  
**Dependencies:** EPIC-4-001  
**Labels:** pdf, download, ux

---

### Story EPIC-4-003: PDF Preview Modal

**Titre:** Afficher aperçu PDF dans modal

**Format Story:**  
> As a **user**, I want to **preview invoice PDF before downloading**, so that **I ensure it looks correct**.

**Description:**  
Modal affiche PDF preview (iframe embed ou image stream). Full-screen option. Download button depuis modal.

**Critères d'Acceptation:**
- [ ] Button "Preview" dans invoice detail
- [ ] Modal appear avec PDF embedded (iframe ou stream)
- [ ] Full width modal, scrollable
- [ ] Button "Download" dans modal footer
- [ ] Button "Close" ferme modal
- [ ] Full-screen toggle
- [ ] Print button (browser print)
- [ ] Response time < 2s load PDF

**Story Points:** 5  
**Priority:** P1  
**Epic:** EPIC-4  
**Dependencies:** EPIC-4-001  
**Labels:** pdf, preview, modal

---

### Story EPIC-4-004: Send Invoice Email

**Titre:** Envoyer facture par email au client

**Format Story:**  
> As a **user**, I want to **email invoice to client**, so that **they receive it directly**.

**Description:**  
Bouton "Send Email" → modal input email recipient + message perso. Genère PDF, jointe email, envoie SendGrid.

**Critères d'Acceptation:**
- [ ] Button "Send Email" dans invoice detail
- [ ] Modal: recipient email (pré-rempli client.email), subject, message body
- [ ] Validation email: format + required
- [ ] Validation message: min 0 (optional), max 500 chars
- [ ] Checkbox "Save client email for future"
- [ ] Bouton "Send"
- [ ] POST /api/invoices/{id}/email
- [ ] PDF généré si absent (EPIC-4-001)
- [ ] Email composé template HTML avec PDF attached
- [ ] Envoyé SendGrid transactional
- [ ] Success toast: "Email envoyé à {email}"
- [ ] Error: toast détails SendGrid error (bounce, invalid, etc.)
- [ ] Audit log: email sent (to, at, status)
- [ ] Response time < 3s (async job, bg processing OK)

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-4  
**Dependencies:** EPIC-4-001  
**Labels:** email, communication, sendgrid

---

### Story EPIC-4-005: Email Template Design

**Titre:** Créer template HTML email professionnel

**Format Story:**  
> As a **system**, I want to **generate professional email template**, so that **email looks branded**.

**Description:**  
Template Handlebars email: header (logo, company), body (greeting, message, CTA), facture attachment info, signature, footer (contact, legal).

**Critères d'Acceptation:**
- [ ] Template Handlebars variables: {{userName}}, {{clientName}}, {{invoiceNumber}}, {{invoiceAmount}}, {{dueDate}}, {{message}}
- [ ] Layout: company logo, greeting "Dear {{clientName}},", body message, "PDF facture en pièce jointe", CTA button (optionnel v2)
- [ ] Signature: sender name, company, phone, email
- [ ] Footer: copyright, unsubscribe link (futur)
- [ ] Responsive HTML (mobile OK)
- [ ] No external dependencies (inline CSS)
- [ ] Tailwind CSS can be inlined
- [ ] Test: render avec données sample

**Story Points:** 5  
**Priority:** P1  
**Epic:** EPIC-4  
**Dependencies:** EPIC-4-004  
**Labels:** email, template, design

---

### Story EPIC-4-006: Email Confirmation & Logging

**Titre:** Logger et confirmer envoi d'email

**Format Story:**  
> As a **user**, I want to **see confirmation and log of emails sent**, so that **I track communication**.

**Description:**  
UI confirmation envoi. Table log emails sent (to, date, status, invoice#). Intégration webhooks SendGrid (delivered, bounced).

**Critères d'Acceptation:**
- [ ] Toast success immediate après envoi POST request
- [ ] Table "Email History" dans invoice detail
- [ ] Colonnes: recipient, sent_at, status (pending, delivered, bounced, failed), invoice#
- [ ] Status icons: ✓ delivered, ✗ bounced, ⚠ failed
- [ ] SendGrid webhooks: /api/webhooks/sendgrid → update status
- [ ] Log table query: GET /api/invoices/{id}/emails
- [ ] Delete email log (soft delete, audit trail)
- [ ] Response time < 200ms

**Story Points:** 3  
**Priority:** P1  
**Epic:** EPIC-4  
**Dependencies:** EPIC-4-004  
**Labels:** email, logging, webhooks

---

## EPIC-3: Payment Tracking

### Story EPIC-3-001: Mark Invoice Paid

**Titre:** Marquer une facture comme payée

**Format Story:**  
> As a **user**, I want to **record invoice payment**, so that **I track which invoices are paid**.

**Description:**  
Bouton "Mark Paid" → modal date + montant. Transition ISSUED→PAID. Set paidAt, paidAmount.

**Critères d'Acceptation:**
- [ ] Button "Mark Paid" dans invoice detail, visible si status=ISSUED
- [ ] Modal: paidAt (date picker, default today), paidAmount (currency input, default invoice.total)
- [ ] Validation: paidAmount > 0, <= invoice.total (warning si over)
- [ ] Validation: paidAt <= today
- [ ] Button "Confirm"
- [ ] PATCH /api/invoices/{id}/mark-paid { paidAt, paidAmount }
- [ ] Status transition ISSUED → PAID
- [ ] Audit log: marked paid by user
- [ ] Success toast: "Facture marquée payée"
- [ ] Invoice detail updated: status PAID, dates visible
- [ ] Response time < 300ms

**Story Points:** 5  
**Priority:** P0  
**Epic:** EPIC-3  
**Dependencies:** EPIC-1-001  
**Labels:** payment, tracking

---

### Story EPIC-3-002: Dashboard KPI Cards

**Titre:** Afficher KPIs financiers en cartes (Total, Payé, Impayé, Retard)

**Format Story:**  
> As a **user**, I want to **see financial summary KPI cards**, so that **I understand my billing health**.

**Description:**  
Dashboard cartes: Total facturé (EUR), Total payé, Total impayé, Factures retard. Couleurs: green/red selon santé.

**Critères d'Acceptation:**
- [ ] Route GET /api/dashboard/kpis { period: "month" } (default), { period: "quarter" }, { period: "year" }
- [ ] Calculs:
  - [ ] Total Invoiced = SUM(invoice.total) WHERE status IN [ISSUED, PAID]
  - [ ] Total Paid = SUM(paidAmount) WHERE status=PAID
  - [ ] Total Outstanding = Total Invoiced - Total Paid
  - [ ] Overdue = SUM(invoice.total) WHERE status=ISSUED AND dueDate < today
- [ ] Dashboard 4 cartes: "€X.XXX Facturé", "€X.XXX Payé", "€X.XXX Impayé (red)", "€X.XXX Retard (red)"
- [ ] Trend arrow: if vs previous period, up/down/flat
- [ ] Click card → drill into list (outstanding, overdue, etc.)
- [ ] Response time < 500ms

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-3  
**Dependencies:** EPIC-1-001, EPIC-3-001  
**Labels:** dashboard, analytics, kpi

---

### Story EPIC-3-003: Outstanding Invoices View

**Titre:** Afficher factures impayées

**Format Story:**  
> As a **user**, I want to **see all unpaid invoices**, so that **I track receivables**.

**Description:**  
Table factures impayées (status=ISSUED, not paid). Triable par date, montant, client. Quick actions.

**Critères d'Acceptation:**
- [ ] Route GET /api/invoices/outstanding
- [ ] Table colonnes: invoiceNumber, client, amount, issuedDate, dueDate, daysOverdue, status
- [ ] Tri: date, amount, client name, days overdue
- [ ] Pagination limit 50
- [ ] Row color: red si overdue
- [ ] Quick action: "Mark Paid", "View", "Email"
- [ ] Total outstanding affichée (sum)
- [ ] Response time < 300ms

**Story Points:** 8  
**Priority:** P0  
**Epic:** EPIC-3  
**Dependencies:** EPIC-1-001  
**Labels:** invoices, receivables

---

### Story EPIC-3-004: Overdue Invoices Alert

**Titre:** Identifier et alerter sur factures en retard

**Format Story:**  
> As a **user**, I want to **see overdue invoices highlighted**, so that **I prioritize follow-up**.

**Description:**  
Factures overdue (dueDate < today, status=ISSUED). Red badge, alert visual. Count en dashboard.

**Critères d'Acceptation:**
- [ ] Calculation: overdue = dueDate < today AND status=ISSUED
- [ ] Dashboard card "X factures retard" (red)
- [ ] Invoice list: red icon/badge si overdue
- [ ] Invoice detail: red banner "Overdue by X days"
- [ ] Filter "Overdue only" dans outstanding list
- [ ] Response time < 200ms

**Story Points:** 5  
**Priority:** P1  
**Epic:** EPIC-3  
**Dependencies:** EPIC-1-001  
**Labels:** alerts, overdue

---

### Story EPIC-3-005: Collection Rate Metric

**Titre:** Calculer le taux de recouvrement

**Format Story:**  
> As a **user**, I want to **see my collection rate %**, so that **I benchmark performance**.

**Description:**  
Collection Rate = (Total Paid / Total Invoiced) × 100%. Affichage dashboard + trend.

**Critères d'Acceptation:**
- [ ] Metric: Collection Rate = SUM(paidAmount) / SUM(invoiceTotal) × 100
- [ ] Period filter: month, quarter, year
- [ ] Dashboard card ou chart: "Collection Rate: 85% ↑ 2%"
- [ ] Trend vs previous period (arrow + %)
- [ ] Target benchmark: 85% (configurable admin futur)
- [ ] Response time < 200ms

**Story Points:** 3  
**Priority:** P1  
**Epic:** EPIC-3  
**Dependencies:** EPIC-3-001  
**Labels:** metrics, analytics

---

## Summary & Metrics

### Total Stories: 27

| Epic | Story Count | Total Points |
|------|------------|--------------|
| EPIC-5 | 10 | 59 |
| EPIC-1 | 10 | 70 |
| EPIC-2 | 10 | 56 |
| EPIC-4 | 6 | 37 |
| EPIC-3 | 5 | 29 |
| **TOTAL** | **27** | **251** |

### Story Point Distribution (Fibonacci)
- **1 point:** 0
- **2 points:** 2 (EPIC-5-010, EPIC-3-005)
- **3 points:** 11 (EPIC-1-006, EPIC-2-003, EPIC-2-004, EPIC-2-008, EPIC-2-010, EPIC-4-002, EPIC-4-006, EPIC-3-001 partial, EPIC-3-005)
- **5 points:** 11 (EPIC-5-004, EPIC-5-005, EPIC-1-003, EPIC-1-009, EPIC-1-010, EPIC-2-001, EPIC-2-002, EPIC-2-005, EPIC-2-007, EPIC-4-003)
- **8 points:** 10 (EPIC-5-002, EPIC-5-003, EPIC-1-002, EPIC-1-004, EPIC-1-007, EPIC-2-006, EPIC-2-009, EPIC-4-004, EPIC-3-002, EPIC-3-003)
- **13 points:** 4 (EPIC-5-001, EPIC-1-001, EPIC-4-001, EPIC-5-010 extension)

### Priority Distribution
- **P0:** 18 stories (critical path, MVP)
- **P1:** 8 stories (important, phase 1 nice-to-have)
- **P2:** 1 story (future enhancement)

### Dependency Graph
- **Foundation (no deps):** EPIC-5 stories
- **Tier 1 (depend on EPIC-5):** EPIC-1, EPIC-2
- **Tier 2 (depend on Tier 1):** EPIC-4, EPIC-3
- **Tier 3 (infrastructure):** EPIC-6 (separate)

### MVP Focus Stories (Sprint 1, see sprint-01.md)
Core 8-10 stories enabling basic invoice workflow:
1. EPIC-5-001: User Registration
2. EPIC-5-002: User Login
3. EPIC-5-004: User Profile View
4. EPIC-1-001: Create Invoice Draft
5. EPIC-1-002: Add/Edit Line Items
6. EPIC-1-003: Auto-calculate Totals
7. EPIC-1-005: Invoice Status Workflow
8. EPIC-2-001: Create Client
9. EPIC-2-005: List Clients
10. EPIC-4-001: Generate PDF Invoice

---

## Document Metadata

| Property | Value |
|----------|-------|
| **Document Version** | 1.0 |
| **Last Updated** | 2026-02-16 |
| **Status** | ✏️ DETAILED - Ready for Sprint Planning |
| **Next Step** | Sprint 1 Planning (sprint-01.md) |
| **Total Stories** | 27 |
| **Total Points** | 251 |
| **Audience** | Engineering, Product, QA |

---

**End of User Stories Document**
