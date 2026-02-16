# Story 4: EPIC-1-001 - Create Invoice Draft

## Overview
Complete backend and frontend implementation for creating invoice drafts in the invoicing application. This story enables freelancers/SMEs to create and save draft invoices before sending them to clients.

## Story Details
- **Epic**: EPIC-1-001
- **Title**: Create Invoice Draft
- **Story Points**: 13
- **Status**: ✅ Implementation Complete
- **Branch**: `feature/EPIC-1-001-create-invoice-draft`

## Implementation Summary

### 1. Database Layer

#### Migration 1: Create Clients Table (002_create_clients_table.js)
- UUID primary key
- Foreign key to users table
- Client information fields: name, email, phone, address
- Company information: siret, VAT number
- Contact person information
- Status tracking (active, inactive, archived)
- Timestamps and soft delete support
- Composite indexes for optimal query performance

#### Migration 2: Create Invoices Table (003_create_invoices_table.js)
- UUID primary key
- Foreign keys to users and clients tables
- Auto-incremented invoice number system
- Date tracking: invoice_date, due_date, paid_date
- Status enum: DRAFT, SENT, VIEWED, PAID, CANCELLED, REFUNDED
- Financial data: subtotal, tax, total, paid amounts
- Currency support (default EUR)
- Tax rate configuration (default 20%)
- Description and notes fields
- Payment information fields
- Comprehensive indexes for common queries

### 2. Backend Models

#### Client Model (src/models/client.js)
**Features:**
- Create new clients with comprehensive validation
- Find clients by ID, email, user ID
- Update client information
- Soft delete functionality
- Email uniqueness checking per user
- Response formatting (camelCase conversion)

**Methods:**
- `create(userId, clientData)` - Create new client
- `findById(clientId)` - Get client by ID
- `findByUserId(userId, options)` - List user's clients with pagination
- `findByNameAndUserId(userId, name)` - Find by name
- `findByEmailAndUserId(userId, email)` - Find by email
- `update(clientId, updateData)` - Update client
- `delete(clientId)` - Soft delete client
- `emailExistsForUser(userId, email, excludeId)` - Check email availability
- `formatClientResponse(client)` - Format response

#### Invoice Model (src/models/invoice.js)
**Features:**
- Invoice number auto-generation with configurable prefix
- Invoice creation with automatic calculations
- Tax amount and total calculation
- Invoice status management
- Find invoices by various criteria
- Full CRUD operations
- Response formatting

**Methods:**
- `generateInvoiceNumber(userId, prefix)` - Generate next invoice number
- `create(userId, invoiceData)` - Create invoice draft
- `findById(invoiceId)` - Get invoice by ID
- `findByUserId(userId, options)` - List user's invoices with filtering and pagination
- `findByInvoiceNumber(userId, invoiceNumber)` - Find by invoice number
- `update(invoiceId, updateData)` - Update invoice
- `delete(invoiceId)` - Soft delete invoice
- `updateStatus(invoiceId, status)` - Change invoice status
- `getDefaultDueDate()` - Get 30-day default due date
- `formatInvoiceResponse(invoice)` - Format response

### 3. API Routes

#### Client Routes (src/routes/clients.js)
**Endpoints:**
- `POST /api/clients` - Create new client
  - Validation: name, email (required)
  - Default country: France
  - Duplicate email check per user
  - Returns 201 on success

- `GET /api/clients` - List clients
  - Query params: status, limit, offset
  - Returns paginated list
  - Default status: active

- `GET /api/clients/:clientId` - Get single client
  - Ownership verification
  - Returns 404 if not found

- `PATCH /api/clients/:clientId` - Update client
  - Partial update support
  - Email uniqueness check
  - Ownership verification

- `DELETE /api/clients/:clientId` - Delete client
  - Soft delete with archived status
  - Ownership verification

#### Invoice Routes (src/routes/invoices.js)
**Endpoints:**
- `POST /api/invoices` - Create invoice draft
  - **Request Body:**
    - `clientId` (required, UUID)
    - `invoiceDate` (optional, ISO datetime)
    - `dueDate` (optional, ISO datetime)
    - `description` (optional, max 1000 chars)
    - `notes` (optional, max 5000 chars)
    - `currency` (default: EUR)
    - `taxRate` (default: 20, 0-100)
    - `subtotalAmount` (default: 0)
    - `paymentTerms` (optional)
    - `paymentInstructions` (optional)
    - `invoicePrefix` (default: INV)

  - **Validation:**
    - Client must belong to authenticated user
    - Due date >= Invoice date
    - Currency: 3 letters
    - Tax rate: 0-100
    - Returns validation errors with field details

  - **Success Response:**
    ```json
    {
      "success": true,
      "message": "Invoice created successfully",
      "data": {
        "invoice": { ... },
        "client": { ... }
      }
    }
    ```

- `GET /api/invoices` - List user's invoices
  - Query params: status, limit, offset
  - Returns paginated list of invoices

- `GET /api/invoices/:invoiceId` - Get invoice details
  - Ownership verification
  - Includes client information

- `PATCH /api/invoices/:invoiceId` - Update invoice
  - Partial update support
  - Automatic recalculation of amounts
  - Ownership verification

- `DELETE /api/invoices/:invoiceId` - Delete invoice
  - Soft delete with deleted_at timestamp

### 4. Frontend Components

#### CreateInvoice Component (src/pages/CreateInvoice.jsx)
**Features:**
- Responsive invoice creation form
- Client dropdown with async loading
- Automatic date defaults (today and +30 days)
- Real-time tax calculation
- Amount summary display
- Form validation with error messages
- Success notification and redirect

**Form Sections:**
1. **Client Information**
   - Required client selection from dropdown
   - Link to create new client if needed

2. **Invoice Dates**
   - Invoice date (defaults to today)
   - Due date (defaults to +30 days)

3. **Invoice Details**
   - Description (max 1000 chars)
   - Notes (max 5000 chars)

4. **Financial Information**
   - Currency selection (EUR, USD, GBP, CHF)
   - Tax rate input with validation
   - Subtotal amount input
   - Live calculation summary (subtotal, tax, total)

5. **Payment Information**
   - Payment terms
   - Payment instructions

#### CreateInvoice Styling (src/styles/CreateInvoice.css)
- Gradient header with purple theme
- Responsive grid layout
- Form validation error styling
- Summary calculation box with clear formatting
- Mobile-first responsive design
- Touch-friendly buttons and inputs

### 5. Testing

#### Unit Tests

**Client Model Tests (tests/unit/models/client.test.js)**
- Client creation with required and optional fields
- Default country assignment
- Find by ID, email, user ID
- Email uniqueness checking
- Soft deletion
- Response formatting
- Pagination

**Invoice Model Tests (tests/unit/models/invoice.test.js)**
- Invoice number generation with correct format
- Sequence number incrementing
- Invoice creation with calculations
- Tax amount and total calculation
- Custom currency and tax rate
- Find by ID and invoice number
- Default due date calculation
- Response formatting

#### Integration Tests

**Client Routes Tests (tests/integration/clients.test.js)**
- POST /api/clients: Create client with validation
- GET /api/clients: List clients with pagination
- GET /api/clients/:id: Get single client
- PATCH /api/clients/:id: Update client
- DELETE /api/clients/:id: Delete client
- Validation of email format, required fields
- Default country to France

**Invoice Routes Tests (tests/integration/invoices.test.js)**
- POST /api/invoices: Create draft with validation
- Validation of dates (due >= invoice)
- Currency format validation
- Tax rate range validation (0-100)
- Tax calculation verification
- Default values (EUR, 20% tax, unique invoice numbers)
- GET /api/invoices: List with filters
- GET /api/invoices/:id: Get single invoice
- PATCH /api/invoices/:id: Update invoice
- DELETE /api/invoices/:id: Delete invoice

### 6. Server Integration (src/server.js)
- Added import statements for client and invoice routes
- Mounted `/api/clients` route
- Mounted `/api/invoices` route
- Authentication required for all invoice/client routes

## Acceptance Criteria Status

- ✅ POST /api/invoices - Create new invoice (draft status)
- ✅ Invoice starts with auto-incremented invoice number (configurable)
- ✅ Select client from dropdown (linked to client ID)
- ✅ Set invoice date (today by default)
- ✅ Set due date (30 days by default, configurable)
- ✅ Set invoice description/notes
- ✅ Set currency (EUR by default)
- ✅ Set tax rate (20% by default, configurable)
- ✅ Save as draft (status = DRAFT)
- ✅ Return invoice ID + basic info
- ✅ Input validation (client required, dates valid)
- ✅ Error handling with detailed error messages
- ✅ Responsive design (mobile-first approach)
- ✅ Database schema implemented
- ✅ Tests included (unit + integration)

## File Structure

```
src/
├── database/
│   └── migrations/
│       ├── 002_create_clients_table.js
│       └── 003_create_invoices_table.js
├── models/
│   ├── client.js
│   └── invoice.js
├── routes/
│   ├── clients.js
│   └── invoices.js
├── pages/
│   └── CreateInvoice.jsx
├── styles/
│   └── CreateInvoice.css
└── server.js (modified)

tests/
├── unit/
│   └── models/
│       ├── client.test.js
│       └── invoice.test.js
└── integration/
    ├── clients.test.js
    └── invoices.test.js
```

## API Usage Examples

### Create a Client
```bash
POST /api/clients
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "01234567890",
  "companyName": "Acme Corp",
  "siret": "12345678901234"
}
```

### Create an Invoice Draft
```bash
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientId": "uuid-of-client",
  "invoiceDate": "2024-02-16",
  "dueDate": "2024-03-17",
  "description": "Web development services",
  "notes": "Payment terms: Net 30",
  "currency": "EUR",
  "taxRate": 20,
  "subtotalAmount": 1000,
  "paymentTerms": "Net 30",
  "invoicePrefix": "INV"
}
```

### Get User's Invoices
```bash
GET /api/invoices?status=DRAFT&limit=50&offset=0
Authorization: Bearer <token>
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- clients.test.js

# Run with coverage
npm test:ci
```

## Running Migrations

```bash
# Apply all pending migrations
npm run migrate:latest

# Rollback last migration
npm run migrate:rollback
```

## Notes

- All database operations use PostgreSQL with UUID primary keys
- Soft deletes are implemented for audit trail
- Client and Invoice routes require authentication (Bearer token)
- Invoice numbers are auto-generated with configurable prefixes
- Tax calculations are automatic based on subtotal and tax rate
- Comprehensive error handling with detailed validation messages
- Frontend form validates on submit with clear error display
- Responsive design works on mobile, tablet, and desktop

## Next Steps (Future Stories)

1. **Story 5**: Add invoice items/line items
2. **Story 6**: Upload invoice to PDF/download
3. **Story 7**: Send invoice to client (email)
4. **Story 8**: Invoice payment tracking
5. **Story 9**: Invoice templates/presets
6. **Story 10**: Client dashboard with invoice list

## Branch Information

- **Branch**: `feature/EPIC-1-001-create-invoice-draft`
- **Base Branch**: `feature/EPIC-5-001-user-registration`
- **Commits**: 1
- **Files Changed**: 13
- **Insertions**: 2,962

## Author Notes

This implementation provides a complete, production-ready invoice draft creation feature with:
- Clean, maintainable code structure
- Comprehensive test coverage
- Input validation at both frontend and backend
- Error handling and user feedback
- Responsive design for all devices
- Database integrity with foreign keys and indexes
- Soft delete support for audit trails

The feature is ready for code review and can be merged after approval.
