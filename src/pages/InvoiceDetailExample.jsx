/**
 * Invoice Detail Page - Example Implementation
 * 
 * Shows how to integrate InvoiceStatusBadge and InvoiceStatusActions components
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import React, { useState, useEffect } from 'react';
import InvoiceStatusBadge from '../components/InvoiceStatusBadge';
import InvoiceStatusActions from '../components/InvoiceStatusActions';
import useInvoiceStatus from '../hooks/useInvoiceStatus';
import '../styles/InvoiceDetail.css';

export function InvoiceDetail({ invoiceId }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const {
    status,
    changeStatus,
    fetchStatusHistory,
    loading: statusLoading,
    error: statusError,
    clearError
  } = useInvoiceStatus(invoiceId);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/invoices/${invoiceId}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }

        const data = await response.json();
        setInvoice(data.data.invoice);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  // Handle status change
  const handleStatusChange = async (newStatus, reason = null) => {
    try {
      clearError();
      const result = await changeStatus(newStatus, reason, {
        changedAt: new Date().toISOString()
      });

      if (result.success) {
        setSuccessMessage(`Invoice status changed to ${newStatus}`);
        setInvoice({
          ...invoice,
          status: newStatus,
          sentAt: result.invoice.sentAt,
          paidAt: result.invoice.paidAt
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle error
  const handleError = (err) => {
    setError(err.message || 'An error occurred');
  };

  if (loading) {
    return (
      <div className="invoice-detail loading">
        <p>Loading invoice...</p>
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="invoice-detail error">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="invoice-detail not-found">
        <p>Invoice not found</p>
      </div>
    );
  }

  return (
    <div className="invoice-detail">
      {/* Header */}
      <div className="invoice-header">
        <h1>Invoice #{invoice.invoiceNumber}</h1>
        <InvoiceStatusBadge status={status} size="large" />
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="success-message">
          ✅ {successMessage}
        </div>
      )}

      {(error || statusError) && (
        <div className="error-message">
          ❌ {error || statusError}
          <button
            className="close-btn"
            onClick={() => {
              setError(null);
              clearError();
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="invoice-content">
        {/* Left Column - Invoice Details */}
        <div className="invoice-details">
          <section className="details-section">
            <h2>Invoice Information</h2>
            <div className="detail-row">
              <label>Date:</label>
              <span>{new Date(invoice.invoiceDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <label>Due Date:</label>
              <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="detail-row">
              <label>Amount:</label>
              <span>
                {invoice.currency} {(invoice.totalAmount || 0).toFixed(2)}
              </span>
            </div>
            {invoice.paidDate && (
              <div className="detail-row">
                <label>Paid On:</label>
                <span>{new Date(invoice.paidDate).toLocaleDateString()}</span>
              </div>
            )}
          </section>

          {/* Line Items */}
          {invoice.lineItems && invoice.lineItems.length > 0 && (
            <section className="details-section">
              <h2>Line Items</h2>
              <div className="line-items-table">
                <table>
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lineItems.map((item) => (
                      <tr key={item.id}>
                        <td>{item.description}</td>
                        <td className="number">{item.quantity}</td>
                        <td className="number">
                          {invoice.currency} {(item.unitPrice || 0).toFixed(2)}
                        </td>
                        <td className="number">
                          {invoice.currency} {(item.amount || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="totals">
                <div className="total-row">
                  <label>Subtotal:</label>
                  <span>
                    {invoice.currency} {(invoice.subtotalAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="total-row">
                  <label>Tax ({invoice.taxRate}%):</label>
                  <span>
                    {invoice.currency} {(invoice.taxAmount || 0).toFixed(2)}
                  </span>
                </div>
                <div className="total-row total">
                  <label>Total:</label>
                  <span>
                    {invoice.currency} {(invoice.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
                {invoice.paidAmount > 0 && (
                  <div className="total-row">
                    <label>Amount Paid:</label>
                    <span>
                      {invoice.currency} {(invoice.paidAmount || 0).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Right Column - Status Actions */}
        <aside className="invoice-actions">
          <InvoiceStatusActions
            invoice={{ id: invoiceId, status }}
            onStatusChange={handleStatusChange}
            onError={handleError}
            disabled={loading || statusLoading}
            loading={statusLoading}
          />

          {/* Client Information */}
          {invoice.client && (
            <section className="client-section">
              <h3>Client</h3>
              <div className="client-info">
                <p className="client-name">{invoice.client.name}</p>
                <p className="client-email">{invoice.client.email}</p>
                {invoice.client.phone && (
                  <p className="client-phone">{invoice.client.phone}</p>
                )}
              </div>
            </section>
          )}

          {/* Payment Terms */}
          {invoice.paymentTerms && (
            <section className="payment-section">
              <h3>Payment Terms</h3>
              <p>{invoice.paymentTerms}</p>
            </section>
          )}

          {/* Payment Instructions */}
          {invoice.paymentInstructions && (
            <section className="instructions-section">
              <h3>Payment Instructions</h3>
              <p>{invoice.paymentInstructions}</p>
            </section>
          )}
        </aside>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <section className="notes-section">
          <h2>Notes</h2>
          <p>{invoice.notes}</p>
        </section>
      )}
    </div>
  );
}

export default InvoiceDetail;
