# ✅ QA Testing Checklist - Invoices CRUD Feature

**Feature:** Invoices CRUD (Create, Read, Update, Delete) + Navigation  
**Tester:** Quinn  
**Date Started:** 2026-02-16  
**Status:** READY FOR QA  

---

## 🔧 Pre-Test Setup

- [ ] Clone latest code from main branch
- [ ] Install dependencies: `npm install`
- [ ] Setup `.env` file (copy from `.env.example`)
- [ ] Create PostgreSQL database: `facturation_dev`
- [ ] Run migrations: `npm run migrate:latest`
- [ ] Start server: `npm run dev` (port 3000 or 3001)
- [ ] Open browser at `http://localhost:5173` (frontend dev server)

---

## 📝 Test Scenarios

### 1️⃣ User Authentication
- [ ] Register new account with valid credentials
  - Email: test@example.com
  - Password: TestPassword123!
  - First Name: Test
  - Last Name: User
- [ ] Verify success message and redirect to login
- [ ] Login with registered credentials
- [ ] Verify JWT token stored in localStorage
- [ ] Navigate to dashboard after login
- [ ] Logout and verify redirect to login page

### 2️⃣ Dashboard & Navigation
- [ ] Dashboard loads after login
- [ ] Navigation bar visible with buttons: Clients, Factures, Profil, Déconnexion
- [ ] Factures card displays (showing 0 invoices initially)
- [ ] Click "Factures" in navbar → Navigate to /invoices
- [ ] Click Factures card → Navigate to /invoices

### 3️⃣ Create Test Clients (Required for Invoices)
- [ ] Go to /clients page
- [ ] Click "+ Nouveau Client" button
- [ ] Create Client 1:
  - [ ] Name: ACME Corporation
  - [ ] Email: contact@acme.com
  - [ ] Phone: +33123456789
  - [ ] Address: 123 Rue de la Paix
  - [ ] City: Paris
  - [ ] Postal Code: 75001
  - [ ] Country: France
  - [ ] Click "Créer" → Verify in list
  
- [ ] Create Client 2:
  - [ ] Name: Tech Startup Inc
  - [ ] Email: hello@techstartup.com
  - [ ] Phone: +33987654321
  - [ ] Address: 456 Boulevard Innovation
  - [ ] City: Lyon
  - [ ] Postal Code: 69000
  - [ ] Country: France
  - [ ] Click "Créer" → Verify in list

### 4️⃣ Invoice List Page
- [ ] Navigate to /invoices
- [ ] Verify empty state message "Aucune facture"
- [ ] Verify "+ Nouvelle facture" button is visible
- [ ] Verify filter dropdown shows statuses: Tous, Brouillon, Envoyée, Payée, En retard, Annulée
- [ ] Verify table headers: Numéro, Client, Montant, Statut, Date, Actions

### 5️⃣ Create Invoice - Part 1 (DRAFT)
- [ ] Click "+ Nouvelle facture" button
- [ ] Verify form loads with fields:
  - [ ] Client selection (dropdown)
  - [ ] Invoice Date (datetime-local)
  - [ ] Due Date (datetime-local)
  - [ ] Status (select: DRAFT, SENT, PAID)
  - [ ] Description (textarea)
  - [ ] Notes (textarea)
  - [ ] Line items section (empty initially)
  - [ ] Tax rate field
  - [ ] Currency (EUR, USD, GBP)
  - [ ] Payment terms
  - [ ] Create button (disabled until client selected)

- [ ] Select Client 1 (ACME Corporation)
- [ ] Set Invoice Date: Today
- [ ] Set Due Date: 30 days from today
- [ ] Enter Description: "Consulting services for February"
- [ ] Leave Status as DRAFT
- [ ] Click "+ Ajouter ligne" to add line items

### 6️⃣ Line Items Entry
- [ ] Add Line Item 1:
  - [ ] Description: "Frontend Development"
  - [ ] Quantity: 20
  - [ ] Unit Price: 75.00
  - [ ] Verify Amount calculates: 1500.00
  
- [ ] Add Line Item 2:
  - [ ] Description: "UI/UX Design"
  - [ ] Quantity: 10
  - [ ] Unit Price: 60.00
  - [ ] Verify Amount calculates: 600.00
  
- [ ] Add Line Item 3:
  - [ ] Description: "Project Management"
  - [ ] Quantity: 5
  - [ ] Unit Price: 50.00
  - [ ] Verify Amount calculates: 250.00

- [ ] Verify Totals:
  - [ ] Subtotal HT: €2350.00
  - [ ] Tax (20%): €470.00
  - [ ] Total TTC: €2820.00

- [ ] Remove Line Item 2 (click X button)
- [ ] Verify Totals recalculate:
  - [ ] Subtotal HT: €1750.00
  - [ ] Tax (20%): €350.00
  - [ ] Total TTC: €2100.00

### 7️⃣ Create Invoice - Part 2 (Save & Verify)
- [ ] Set Tax Rate: 20 (or keep default)
- [ ] Set Currency: EUR
- [ ] Set Payment Terms: "Net 30 days"
- [ ] Click "Créer" button
- [ ] Verify redirect to /invoices
- [ ] Verify new invoice appears in list:
  - [ ] Numéro: INV-YYYYMM-xxxxx (auto-generated)
  - [ ] Client: ACME Corporation
  - [ ] Montant: €2100.00
  - [ ] Statut: BROUILLON (orange badge)
  - [ ] Date: Today's date

### 8️⃣ Invoice Detail Page
- [ ] Click on invoice number in list → Navigate to /invoices/{id}
- [ ] Verify detail page displays:
  - [ ] Invoice number as heading
  - [ ] Status badge (orange for DRAFT)
  - [ ] Client name: ACME Corporation
  - [ ] Invoice date
  - [ ] Due date
  - [ ] Description
  - [ ] Line items table (2 lines)
  - [ ] Subtotal HT: €1750.00
  - [ ] Tax: €350.00
  - [ ] Total TTC: €2100.00
  - [ ] Status change section (dropdown + button)
  - [ ] Action buttons: Éditer, Télécharger PDF, Supprimer

### 9️⃣ Edit Invoice
- [ ] From detail page, click "Éditer" button
- [ ] Verify form pre-populated with invoice data
- [ ] Change Description: "Consulting services - UPDATED"
- [ ] Add new line item:
  - [ ] Description: "Additional Support"
  - [ ] Quantity: 3
  - [ ] Unit Price: 100.00
  - [ ] Verify Amount: 300.00

- [ ] Verify Totals updated:
  - [ ] Subtotal HT: €2050.00
  - [ ] Tax (20%): €410.00
  - [ ] Total TTC: €2460.00

- [ ] Click "Mettre à jour" button
- [ ] Verify redirect to invoice detail
- [ ] Verify updated data displayed

### 🔟 Status Transitions
- [ ] On detail page, Status change section:
  - [ ] Current dropdown value: DRAFT
  - [ ] Change to: SENT
  - [ ] Click "Changer" button
  - [ ] Verify status badge changes to blue (SENT)
  - [ ] Verify no error message
  
- [ ] Change status again: SENT → PAID
  - [ ] Click "Changer" button
  - [ ] Verify status badge changes to green (PAID)
  
- [ ] Try invalid transition: PAID → DRAFT
  - [ ] Select DRAFT from dropdown
  - [ ] Click "Changer"
  - [ ] Verify error message appears (status transition not allowed)
  - [ ] Verify status remains PAID

### 1️⃣1️⃣ Invoice List - Advanced Features
- [ ] Back to /invoices list
- [ ] Filter by Status:
  - [ ] Select "Payée" from filter dropdown
  - [ ] Verify only PAID invoices show (the one we just updated)
  - [ ] Select "Brouillon"
  - [ ] Verify no invoices shown (we moved ours to PAID)
  - [ ] Select "Tous"
  - [ ] Verify invoice still visible in list

- [ ] Create another invoice (Invoice 2):
  - [ ] With Client 2 (Tech Startup Inc)
  - [ ] Add 2 line items
  - [ ] Leave as DRAFT
  - [ ] Save

- [ ] Verify list now shows 2 invoices
- [ ] Test filter combinations

### 1️⃣2️⃣ PDF Download (Optional)
- [ ] Open detail page for PAID invoice
- [ ] Click "Télécharger PDF" button
- [ ] Verify PDF file downloads (invoice-{id}.pdf)
- [ ] Open PDF and verify content:
  - [ ] Invoice number
  - [ ] Client information
  - [ ] Line items
  - [ ] Totals
  - [ ] Invoice date

### 1️⃣3️⃣ Delete Invoice
- [ ] From Invoice 2 detail page, click "Supprimer" button
- [ ] Verify confirmation dialog appears
- [ ] Click "OK" to confirm
- [ ] Verify redirect to /invoices list
- [ ] Verify Invoice 2 no longer appears in list
- [ ] Verify only Invoice 1 (PAID) remains

### 1️⃣4️⃣ Error Handling
- [ ] Try creating invoice without selecting client:
  - [ ] Leave client dropdown empty
  - [ ] Try to submit form
  - [ ] Verify error message or button stays disabled
  
- [ ] Try accessing non-existent invoice:
  - [ ] Go to /invoices/invalid-id
  - [ ] Verify error message: "Facture non trouvée"
  
- [ ] Try accessing another user's invoice:
  - [ ] (Create second test account)
  - [ ] As User 1, note an invoice ID
  - [ ] Login as User 2
  - [ ] Try accessing /invoices/{user1_invoice_id}
  - [ ] Verify 403 Unauthorized or similar

### 1️⃣5️⃣ Console & Network Checks
- [ ] Open browser DevTools (F12)
- [ ] Check Console tab:
  - [ ] No red error messages
  - [ ] No unhandled promise rejections
  - [ ] Warnings are acceptable

- [ ] Check Network tab:
  - [ ] All API requests return 2xx or 4xx (not 5xx)
  - [ ] /api/invoices returns 200 with invoice list
  - [ ] POST /api/invoices returns 201 with created invoice
  - [ ] PATCH /api/invoices/:id returns 200
  - [ ] DELETE /api/invoices/:id returns 200
  - [ ] PATCH /api/invoices/:id/status returns 200

---

## 🎯 Pass/Fail Criteria

### ✅ MUST PASS (Critical)
- [ ] Create invoice with valid data
- [ ] Invoice appears in list after creation
- [ ] Edit invoice and verify changes persist
- [ ] Delete invoice and verify removal from list
- [ ] Status transitions work (DRAFT → SENT → PAID)
- [ ] No console errors during normal usage
- [ ] Authorization: Can't access other users' invoices
- [ ] Calculations: Tax and totals accurate

### ⚠️ SHOULD PASS (Important)
- [ ] Filter invoices by status
- [ ] Download invoice as PDF
- [ ] Status history page loads
- [ ] Auto-calculation of line item amounts
- [ ] Form validation (client required, etc.)
- [ ] Responsive design on mobile

### 📝 NICE TO HAVE (Optional)
- [ ] Email sending invoice
- [ ] Bulk actions (multi-select delete)
- [ ] Invoice templates
- [ ] Recurring invoices

---

## 🐛 Bug Report Template

If you find issues, please use this template:

```
**Title:** [Brief description]

**Severity:** Critical | High | Medium | Low

**Steps to Reproduce:**
1. ...
2. ...
3. ...

**Expected Result:**
...

**Actual Result:**
...

**Environment:**
- Browser: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux
- URL: http://localhost:5173/invoices

**Screenshots/Video:** [If applicable]

**Additional Notes:**
...
```

---

## ✅ Sign-Off

- [ ] All critical tests passed
- [ ] All important tests passed
- [ ] Bug report(s) filed (if any)
- [ ] Feature approved for deployment

**Signed by:** _________________ **Date:** _________

---

**Status: READY FOR QA** ✅

Quinn, please proceed with testing and report any findings.
