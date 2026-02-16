/**
 * Invoice Detail Page Component
 * 
 * Displays detailed view of a single invoice draft
 * Story: EPIC-1-001 - Create Invoice Draft
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/InvoiceDetail.css';

export default function InvoiceDetail() {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/invoices/${invoiceId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch invoice');
        }

        const data = await response.json();
        setInvoice(data.data.invoice);
        setClient(data.data.client);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };

    fetchInvoiceDetail();
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="invoice-detail-container">
        <div className="loading">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="invoice-detail-container">
        <div className="alert alert-error">
          {error || 'Invoice not found'}
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>
          Back to Invoices
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const statusColors = {
    'DRAFT': '#ffc107',
    'SENT': '#0dcaf0',
    'VIEWED': '#0d6efd',
    'PAID': '#198754',
    'CANCELLED': '#dc3545',
    'REFUNDED': '#6f42c1'
  };

  return (
    <div className="invoice-detail-container">
      <div className="invoice-detail-card">
        {/* Header */}
        <div className="invoice-header">
          <div className="header-content">
            <h1>Invoice {invoice.invoiceNumber}</h1>
            <span className="status-badge" style={{ backgroundColor: statusColors[invoice.status] }}>
              {invoice.status}
            </span>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate(`/invoices/${invoiceId}/edit`)}>
              Edit
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>
              Back
            </button>
          </div>
        </div>

        {/* Client Information */}
        {client && (
          <div className="section">
            <h2>Client Information</h2>
            <div className="client-info">
              <div className="info-item">
                <span className="label">Client Name:</span>
                <span className="value">{client.name}</span>
              </div>
              <div className="info-item">
                <span className="label">Email:</span>
                <span className="value">
                  <a href={`mailto:${client.email}`}>{client.email}</a>
                </span>
              </div>
              {client.phone && (
                <div className="info-item">
                  <span className="label">Phone:</span>
                  <span className="value">{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="info-item">
                  <span className="label">Address:</span>
                  <span className="value">
                    {client.address}
                    {client.city && `, ${client.postalCode} ${client.city}`}
                  </span>
                </div>
              )}
              {client.companyName && (
                <div className="info-item">
                  <span className="label">Company:</span>
                  <span className="value">{client.companyName}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Invoice Dates */}
        <div className="section">
          <h2>Invoice Dates</h2>
          <div className="dates-info">
            <div className="info-item">
              <span className="label">Invoice Date:</span>
              <span className="value">{formatDate(invoice.invoiceDate)}</span>
            </div>
            <div className="info-item">
              <span className="label">Due Date:</span>
              <span className="value">{formatDate(invoice.dueDate)}</span>
            </div>
            {invoice.paidDate && (
              <div className="info-item">
                <span className="label">Paid Date:</span>
                <span className="value">{formatDate(invoice.paidDate)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invoice Details */}
        {(invoice.description || invoice.notes) && (
          <div className="section">
            <h2>Invoice Details</h2>
            {invoice.description && (
              <div className="detail-item">
                <h3>Description</h3>
                <p>{invoice.description}</p>
              </div>
            )}
            {invoice.notes && (
              <div className="detail-item">
                <h3>Notes</h3>
                <p>{invoice.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Financial Summary */}
        <div className="section">
          <h2>Financial Summary</h2>
          <div className="financial-summary">
            <div className="summary-row">
              <span>Subtotal ({invoice.currency}):</span>
              <span className="amount">{parseFloat(invoice.subtotalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax ({invoice.taxRate}%):</span>
              <span className="amount">{parseFloat(invoice.taxAmount || 0).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total ({invoice.currency}):</span>
              <span className="amount">{parseFloat(invoice.totalAmount || 0).toFixed(2)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <div className="summary-row">
                <span>Paid Amount:</span>
                <span className="amount">{parseFloat(invoice.paidAmount || 0).toFixed(2)}</span>
              </div>
            )}
            {invoice.totalAmount > invoice.paidAmount && (
              <div className="summary-row balance">
                <span>Outstanding Balance:</span>
                <span className="amount">{(parseFloat(invoice.totalAmount || 0) - parseFloat(invoice.paidAmount || 0)).toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        {(invoice.paymentTerms || invoice.paymentInstructions) && (
          <div className="section">
            <h2>Payment Information</h2>
            {invoice.paymentTerms && (
              <div className="detail-item">
                <h3>Payment Terms</h3>
                <p>{invoice.paymentTerms}</p>
              </div>
            )}
            {invoice.paymentInstructions && (
              <div className="detail-item">
                <h3>Payment Instructions</h3>
                <p>{invoice.paymentInstructions}</p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="actions">
          {invoice.status === 'DRAFT' && (
            <>
              <button className="btn btn-primary btn-lg" onClick={() => navigate(`/invoices/${invoiceId}/edit`)}>
                Edit Invoice
              </button>
              <button className="btn btn-secondary btn-lg" onClick={() => navigate(`/invoices/${invoiceId}/send`)}>
                Send to Client
              </button>
            </>
          )}
          <button className="btn btn-secondary btn-lg" onClick={() => navigate('/invoices')}>
            Back to List
          </button>
        </div>
      </div>
    </div>
  );
}
