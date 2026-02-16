# Invoice Status Components - Usage Guide

**Story:** EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)

This guide explains how to use the invoice status management components in your React application.

---

## Quick Start

### 1. Display Current Status

```jsx
import InvoiceStatusBadge from './components/InvoiceStatusBadge';

function MyComponent() {
  return <InvoiceStatusBadge status="SENT" size="medium" />;
}
```

### 2. Handle Status Changes

```jsx
import InvoiceStatusActions from './components/InvoiceStatusActions';

function MyComponent() {
  const handleStatusChange = async (newStatus, reason) => {
    const response = await fetch(`/api/invoices/inv-123/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, reason })
    });
  };

  return (
    <InvoiceStatusActions
      invoice={{ id: 'inv-123', status: 'DRAFT' }}
      onStatusChange={handleStatusChange}
    />
  );
}
```

### 3. Use Custom Hook

```jsx
import useInvoiceStatus from './hooks/useInvoiceStatus';

function MyComponent() {
  const { status, changeStatus, markAsPaid } = useInvoiceStatus('inv-123');

  return (
    <button onClick={() => markAsPaid('Payment received')}>
      Mark as Paid
    </button>
  );
}
```

---

## Components

### InvoiceStatusBadge

Displays a colored badge with the invoice status.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `status` | string | 'DRAFT' | Invoice status (DRAFT, SENT, PAID, OVERDUE, CANCELLED) |
| `size` | string | 'medium' | Badge size: small, medium, or large |
| `showDescription` | boolean | false | Show tooltip with status description |
| `interactive` | boolean | false | Enable click behavior |
| `onClick` | function | null | Click handler (requires interactive={true}) |

#### Examples

```jsx
// Basic usage
<InvoiceStatusBadge status="SENT" />

// Large badge with description
<InvoiceStatusBadge status="PAID" size="large" showDescription />

// Interactive badge
<InvoiceStatusBadge
  status="DRAFT"
  interactive
  onClick={(status) => console.log('Status:', status)}
/>
```

#### Colors

- **DRAFT**: Blue (#0066cc)
- **SENT**: Yellow (#ffc107)
- **PAID**: Green (#28a745)
- **OVERDUE**: Red (#dc3545)
- **CANCELLED**: Grey (#6c757d)

---

### InvoiceStatusActions

Displays action buttons and a confirmation dialog for status transitions.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `invoice` | Object | required | Invoice object with id and status |
| `onStatusChange` | function | required | Callback: (newStatus, reason?) => Promise |
| `onError` | function | null | Callback on error: (error) => void |
| `disabled` | boolean | false | Disable all actions |
| `loading` | boolean | false | Show loading state |

#### Callback Signatures

```typescript
// onStatusChange callback
onStatusChange(newStatus: string, reason?: string): Promise<{
  success: boolean,
  error?: string
}>

// onError callback
onError(error: Error): void
```

#### Examples

```jsx
// Basic usage
<InvoiceStatusActions
  invoice={invoice}
  onStatusChange={(status, reason) => {
    return fetch(`/api/invoices/${invoice.id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason })
    });
  }}
/>

// With error handling
<InvoiceStatusActions
  invoice={invoice}
  onStatusChange={handleStatusChange}
  onError={(error) => showNotification(error.message, 'error')}
  disabled={isProcessing}
  loading={isChangingStatus}
/>
```

#### Available Actions by Status

| Status | Actions |
|--------|---------|
| DRAFT | Send, Cancel |
| SENT | Mark as Paid, Send Reminder, Cancel |
| OVERDUE | Mark as Paid, Send Reminder, Cancel |
| PAID | Reverse |
| CANCELLED | (None) |

---

### useInvoiceStatus Hook

Custom React hook for managing invoice status transitions.

#### Hook Return

```javascript
{
  status: string,                    // Current status
  loading: boolean,                  // Loading state
  error: string | null,              // Error message
  history: Array,                    // Status history
  changeStatus: function,            // Change status
  fetchStatusHistory: function,      // Fetch history
  sendInvoice: function,            // Send invoice (DRAFT->SENT)
  markAsPaid: function,             // Mark as paid
  cancelInvoice: function,          // Cancel invoice
  clearError: function              // Clear error state
}
```

#### Methods

##### changeStatus(newStatus, reason?, metadata?)
Change invoice status to new status.

```javascript
const result = await changeStatus('SENT', 'Sent to client', {
  sentVia: 'email'
});

if (result.success) {
  console.log('Invoice updated:', result.invoice);
  console.log('History:', result.history);
} else {
  console.error('Error:', result.error);
}
```

##### fetchStatusHistory(limit?, offset?)
Fetch status history for the invoice.

```javascript
const result = await fetchStatusHistory(50, 0);

if (result.success) {
  console.log('Current status:', result.currentStatus);
  console.log('Allowed transitions:', result.allowedNextStatuses);
  console.log('History:', result.history);
}
```

##### sendInvoice(reason?)
Transition from DRAFT to SENT.

```javascript
const result = await sendInvoice('Sent to client');
```

##### markAsPaid(reason?)
Transition to PAID status.

```javascript
const result = await markAsPaid('Payment received via bank transfer');
```

##### cancelInvoice(reason?)
Transition to CANCELLED status.

```javascript
const result = await cancelInvoice('Client requested cancellation');
```

##### clearError()
Clear the current error message.

```javascript
clearError();
```

#### Examples

```jsx
import useInvoiceStatus from './hooks/useInvoiceStatus';

function InvoiceStatusManager({ invoiceId }) {
  const {
    status,
    loading,
    error,
    changeStatus,
    markAsPaid,
    clearError
  } = useInvoiceStatus(invoiceId);

  const handleMarkAsPaid = async () => {
    const result = await markAsPaid('Payment received');
    if (result.success) {
      showNotification('Invoice marked as paid');
    } else {
      showNotification(result.error, 'error');
    }
  };

  if (error) {
    return (
      <div className="error">
        {error}
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }

  return (
    <div>
      <p>Status: {status}</p>
      <button
        onClick={handleMarkAsPaid}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Mark as Paid'}
      </button>
    </div>
  );
}

export default InvoiceStatusManager;
```

---

## Complete Example

```jsx
import React, { useState, useEffect } from 'react';
import InvoiceStatusBadge from './components/InvoiceStatusBadge';
import InvoiceStatusActions from './components/InvoiceStatusActions';
import useInvoiceStatus from './hooks/useInvoiceStatus';

function InvoicePage({ invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const { status, changeStatus, loading } = useInvoiceStatus(invoiceId);

  // Fetch invoice details
  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setInvoice(data.data.invoice);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (newStatus, reason) => {
    try {
      const result = await changeStatus(newStatus, reason);
      if (result.success) {
        setSuccess(`Status changed to ${newStatus}`);
        setInvoice({ ...invoice, status: newStatus });
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (!invoice) return <div>Loading...</div>;

  return (
    <div className="invoice-page">
      <header>
        <h1>Invoice {invoice.invoiceNumber}</h1>
        <InvoiceStatusBadge status={status} size="large" />
      </header>

      {error && (
        <div className="error-alert">
          {error}
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {success && (
        <div className="success-alert">{success}</div>
      )}

      <div className="invoice-body">
        <main>
          {/* Invoice details */}
          <section>
            <h2>Invoice Details</h2>
            <p>Amount: {invoice.totalAmount}</p>
            <p>Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
          </section>
        </main>

        <aside>
          <InvoiceStatusActions
            invoice={{ id: invoiceId, status }}
            onStatusChange={handleStatusChange}
            loading={loading}
            onError={(error) => setError(error.message)}
          />
        </aside>
      </div>
    </div>
  );
}

export default InvoicePage;
```

---

## API Integration

### Status Change Request

```http
PATCH /api/invoices/:invoiceId/status
Authorization: Bearer {authToken}
Content-Type: application/json

{
  "status": "SENT",
  "reason": "Sent to client",
  "metadata": {
    "sentVia": "email",
    "sentAt": "2026-02-16T10:20:00Z"
  }
}
```

### Response

```json
{
  "success": true,
  "message": "Invoice status updated successfully",
  "data": {
    "invoice": {
      "id": "inv-123",
      "status": "SENT",
      "sentAt": "2026-02-16T10:20:00Z",
      "updatedAt": "2026-02-16T10:20:00Z"
    },
    "history": [
      {
        "id": "hist-456",
        "invoiceId": "inv-123",
        "fromStatus": "DRAFT",
        "toStatus": "SENT",
        "reason": "Sent to client",
        "createdAt": "2026-02-16T10:20:00Z"
      }
    ]
  }
}
```

---

## Status Transitions

### Valid Transitions

```
DRAFT
  ├─ SEND → SENT (requires line items)
  └─ CANCEL → CANCELLED

SENT
  ├─ MARK PAID → PAID
  ├─ SEND REMINDER (stays SENT)
  └─ CANCEL → CANCELLED

PAID
  └─ REVERSE → CANCELLED

OVERDUE
  ├─ MARK PAID → PAID
  └─ CANCEL → CANCELLED

CANCELLED
  └─ (no transitions)
```

### Invalid Transitions

- DRAFT → PAID (must be SENT first)
- PAID → SENT (cannot go back)
- CANCELLED → anything (final state)

---

## Styling

### CSS Classes

The components use these CSS classes you can customize:

```css
/* Badge */
.status-badge
.status-badge.status-draft
.status-badge.status-sent
.status-badge.status-paid
.status-badge.status-overdue
.status-badge.status-cancelled

/* Actions */
.invoice-status-actions
.action-button
.confirmation-dialog
.confirmation-overlay
```

### Customizing Colors

Override in your CSS:

```css
.status-badge.status-draft {
  background-color: #your-color;
  color: #your-text-color;
  border-color: #your-border-color;
}
```

---

## Error Handling

### Common Errors

```javascript
// Line items required for DRAFT→SENT
{
  success: false,
  message: "Status transition not allowed",
  errors: ["Invoice must have at least one line item to be sent"]
}

// Invalid status
{
  success: false,
  message: "Validation error",
  errors: [{ field: "status", message: "Invalid enum value" }]
}

// Unauthorized
{
  success: false,
  message: "Unauthorized"
}
```

### Error Handling Pattern

```jsx
const handleStatusChange = async (newStatus, reason) => {
  try {
    const result = await changeStatus(newStatus, reason);
    
    if (!result.success) {
      // Handle specific errors
      if (result.error.includes('line items')) {
        showNotification('Please add line items first', 'warning');
      } else {
        showNotification(result.error, 'error');
      }
      return;
    }
    
    // Success
    showNotification('Status updated successfully', 'success');
  } catch (error) {
    showNotification('Network error: ' + error.message, 'error');
  }
};
```

---

## Testing

### Testing Components

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import InvoiceStatusBadge from './InvoiceStatusBadge';

describe('InvoiceStatusBadge', () => {
  it('should display status', () => {
    render(<InvoiceStatusBadge status="SENT" />);
    expect(screen.getByText('Sent')).toBeInTheDocument();
  });

  it('should handle click when interactive', () => {
    const onClick = jest.fn();
    const { container } = render(
      <InvoiceStatusBadge
        status="DRAFT"
        interactive
        onClick={onClick}
      />
    );
    fireEvent.click(container.querySelector('.status-badge'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Testing Hook

```jsx
import { renderHook, act } from '@testing-library/react';
import useInvoiceStatus from './useInvoiceStatus';

describe('useInvoiceStatus', () => {
  it('should change status', async () => {
    const { result } = renderHook(() => useInvoiceStatus('inv-123'));

    await act(async () => {
      const response = await result.current.changeStatus('SENT', 'Test');
      expect(response.success).toBe(true);
    });

    expect(result.current.status).toBe('SENT');
  });
});
```

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Accessibility

The components include:
- ✅ ARIA labels and roles
- ✅ Keyboard navigation
- ✅ Color contrast compliance
- ✅ Screen reader support
- ✅ Focus management

---

## Performance Tips

1. **Memoize invoice object** to prevent unnecessary re-renders
2. **Use status hook** instead of fetching status separately
3. **Lazy load** history for large datasets
4. **Debounce** status changes if triggered by user input

```jsx
// Example with memoization
import { useMemo } from 'react';

function MyComponent({ invoice }) {
  const invoiceData = useMemo(() => invoice, [invoice.id, invoice.status]);
  
  return <InvoiceStatusActions invoice={invoiceData} />;
}
```

---

## Support

For issues or questions:
1. Check this guide
2. See `STORY6_IMPLEMENTATION.md` for technical details
3. Review `STORY6_SUMMARY.md` for quick reference

---

**Last Updated:** 2026-02-16  
**Status:** ✅ Ready for use
