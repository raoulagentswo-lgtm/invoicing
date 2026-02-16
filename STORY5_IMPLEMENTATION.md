# Story 5 Implementation: Line Items & Tax Calculations
**EPIC-1-002/003 - Line Items & Tax Calculations**

**Date:** 2026-02-16  
**Story Points:** 8  
**Status:** ✅ Completed  
**Branch:** `feature/EPIC-1-002-line-items-taxes`

---

## Overview

This implementation provides a complete line items management system for the invoicing application, with real-time tax calculations and totals. Users can add, edit, and delete line items from invoices, with automatic calculation of amounts and taxes.

---

## Acceptance Criteria - Status

All acceptance criteria are **✅ COMPLETED**:

- [x] POST /api/invoices/:id/line-items - Add line item to invoice
- [x] Line item: description, quantity, unit_price, tax_included (boolean)
- [x] Auto-calculate: amount = quantity × unit_price
- [x] Auto-calculate: tax amount = amount × tax_rate (if not included)
- [x] Auto-calculate: invoice total = sum(amounts) + sum(taxes)
- [x] GET /api/invoices/:id - Return invoice with line items + totals
- [x] PUT /api/invoices/:id/line-items/:lineId - Update line item
- [x] DELETE /api/invoices/:id/line-items/:lineId - Delete line item
- [x] Real-time calculations on frontend
- [x] Frontend line items editor (add/edit/delete rows)
- [x] Input validation (positive numbers, required fields)
- [x] Responsive table layout

---

## Implementation Details

### 1. Database Migration

**File:** `src/database/migrations/004_create_line_items_table.js`

Creates the `line_items` table with:
- `id` (UUID primary key)
- `invoice_id` (UUID foreign key to invoices table)
- `description` (text, required)
- `quantity` (decimal)
- `unit_price` (decimal)
- `tax_included` (boolean)
- Calculated fields: `amount`, `tax_amount`, `total`, `tax_rate`
- `line_order` (for maintaining order of items)
- Timestamps: `created_at`, `updated_at`, `deleted_at` (soft delete)

Indexes:
- `[invoice_id, created_at]` for fast querying
- `[invoice_id, deleted_at]` for filtering active items

### 2. Backend Implementation

#### LineItem Model

**File:** `src/models/lineItem.js`

Core methods:
- `calculateAmounts()` - Static method for tax and total calculations
- `create()` - Create new line item with auto-calculation
- `findById()` - Retrieve single line item
- `findByInvoiceId()` - Retrieve all line items for an invoice
- `update()` - Update line item with recalculation
- `delete()` - Soft delete line item
- `calculateInvoiceTotals()` - Sum all line items totals
- `formatLineItemResponse()` - Format database response for API

Features:
- Automatic amount calculation: `quantity × unit_price`
- Tax calculation logic supporting two modes:
  - Tax not included: `tax = amount × tax_rate / 100`
  - Tax included: `tax = 0` (price already includes tax)
- Rounding to 2 decimals for all currency values
- Maintains line order with `line_order` field

#### Line Items Routes

**File:** `src/routes/lineItems.js`

Endpoints:

1. **POST /api/invoices/:invoiceId/line-items**
   - Create new line item
   - Body validation with Zod schemas
   - Auto-recalculates invoice totals
   - Returns line item + updated invoice totals

2. **GET /api/invoices/:invoiceId/line-items**
   - Fetch all line items for invoice
   - Returns sorted by line_order
   - Includes calculated totals

3. **GET /api/invoices/:invoiceId/line-items/:lineItemId**
   - Fetch single line item
   - Returns full item details

4. **PUT /api/invoices/:invoiceId/line-items/:lineItemId**
   - Update line item
   - Recalculates amounts based on changes
   - Auto-updates invoice totals

5. **DELETE /api/invoices/:invoiceId/line-items/:lineItemId**
   - Soft delete line item
   - Auto-updates invoice totals

Security:
- Authentication required on all endpoints
- Invoice ownership verification
- Proper authorization checks

#### Invoice Model Updates

**File:** `src/models/invoice.js`

Changes:
- `findById()` now supports `includeLineItems` parameter
- When enabled, includes line items array and totals in response
- Maintains backward compatibility with optional parameter

#### Invoice Routes Updates

**File:** `src/routes/invoices.js`

Changes:
- GET /api/invoices/:invoiceId includes line items by default
- Query parameter ?includeLineItems=false to exclude
- Response includes invoice data, client info, and line items

### 3. Frontend Implementation

#### LineItemsEditor Component

**File:** `src/components/LineItemsEditor.jsx`

Features:
- Display all line items in responsive table
- Add new line items with form
- Edit existing line items inline
- Delete line items with confirmation
- Real-time calculation preview
- Invoice totals display
- Error and success messaging
- Loading states

Form Fields:
- `description` (required, max 500 chars)
- `quantity` (required, positive)
- `unitPrice` (required, positive)
- `taxRate` (optional, 0-100)
- `taxIncluded` (optional toggle)

Calculations (Real-time):
- Amount = quantity × unitPrice
- Tax = amount × taxRate / 100 (if not included)
- Total = amount + tax

API Integration:
- Fetch line items on component mount
- Create line item: POST request with validation
- Update line item: PUT request with validation
- Delete line item: DELETE request with confirmation
- Automatic refresh after operations

#### Styling

**File:** `src/styles/LineItemsEditor.css`

Features:
- Responsive design for mobile, tablet, desktop
- Modern form layout with proper spacing
- Table styling with hover effects
- Calculation preview with clear formatting
- Success/error alerts with colors
- Accessible color scheme
- Mobile-optimized table layout

Responsive Breakpoints:
- Desktop: Full table with all columns
- Tablet (768px): Adjusted padding and font sizes
- Mobile (480px): Smaller fonts and optimized spacing

### 4. Testing

#### Unit Tests

**File:** `tests/models/lineItem.test.js`

Tests for LineItem model:
- `calculateAmounts()` with various tax rates and modes
- Decimal quantity and price handling
- Line item creation with auto-calculated fields
- Finding by ID and by invoice ID
- Update operations with recalculation
- Soft delete functionality
- Invoice totals calculation

#### Integration Tests

**File:** `tests/routes/lineItems.test.js`

Tests for API endpoints:
- POST endpoint with validation
- GET endpoints for fetching items
- PUT endpoint with updates and recalculation
- DELETE endpoint with cascade updates
- Authentication and authorization
- Error handling and validation errors
- Real-time total updates

---

## Commits

1. ✅ **Migration & Model** - Create line_items table and LineItem model
2. ✅ **API Endpoints** - Implement CRUD routes with validation
3. ✅ **Invoice Integration** - Update Invoice model and routes
4. ✅ **Tests** - Add comprehensive unit and integration tests
5. ✅ **Frontend** - Create LineItemsEditor component and styles
6. ✅ **Documentation** - Story implementation details

---

## API Response Examples

### Create Line Item

```bash
POST /api/invoices/{invoiceId}/line-items
Content-Type: application/json

{
  "description": "Development Services",
  "quantity": 10,
  "unitPrice": 150,
  "taxRate": 20,
  "taxIncluded": false
}
```

Response:
```json
{
  "success": true,
  "message": "Line item added successfully",
  "data": {
    "lineItem": {
      "id": "uuid-123",
      "invoiceId": "uuid-invoice",
      "description": "Development Services",
      "quantity": 10,
      "unitPrice": 150,
      "amount": 1500,
      "taxRate": 20,
      "taxAmount": 300,
      "total": 1800,
      "taxIncluded": false,
      "lineOrder": 0,
      "createdAt": "2026-02-16T10:00:00Z",
      "updatedAt": "2026-02-16T10:00:00Z"
    },
    "invoiceTotals": {
      "subtotalAmount": 1500,
      "totalTaxAmount": 300,
      "totalAmount": 1800
    }
  }
}
```

### Get Invoice with Line Items

```bash
GET /api/invoices/{invoiceId}?includeLineItems=true
```

Response:
```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": "uuid-invoice",
      "invoiceNumber": "INV-202602-00001",
      "status": "DRAFT",
      "subtotalAmount": 1500,
      "totalAmount": 1800,
      "lineItems": [
        { ... line item 1 ... },
        { ... line item 2 ... }
      ],
      "totals": {
        "subtotalAmount": 1500,
        "totalTaxAmount": 300,
        "totalAmount": 1800
      }
    },
    "client": { ... }
  }
}
```

---

## Usage

### Backend

1. Apply migrations:
```bash
npm run migrate:latest
```

2. Create line items via API:
```bash
curl -X POST http://localhost:3000/api/invoices/{id}/line-items \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Service",
    "quantity": 1,
    "unitPrice": 100,
    "taxRate": 20,
    "taxIncluded": false
  }'
```

### Frontend

1. Import component:
```jsx
import LineItemsEditor from '../components/LineItemsEditor';
```

2. Use in page:
```jsx
<LineItemsEditor invoiceId={invoiceId} />
```

---

## Notes

- All calculations are performed in JavaScript (frontend) and backend (Node.js)
- Tax calculations support both inclusive and exclusive tax modes
- Line items maintain order via `line_order` field
- Soft deletes allow for audit trails and restoration
- Invoice totals automatically sync with line items
- Real-time calculation provides instant feedback to users
- All amounts are rounded to 2 decimal places for currency
- Frontend validation prevents invalid submissions
- Backend validation ensures data integrity

---

## Next Steps (Future Enhancements)

1. **Bulk operations** - Import/export line items from CSV
2. **Templates** - Save and reuse line item templates
3. **Discounts** - Add line-level and invoice-level discounts
4. **Custom fields** - Allow custom metadata per line item
5. **Calculation modes** - Different tax calculation strategies
6. **Recurring items** - Templates for recurring invoices
7. **PDF generation** - Include line items in generated PDFs

---

**Status:** ✅ Ready for code review and testing  
**Branch:** `feature/EPIC-1-002-line-items-taxes`
