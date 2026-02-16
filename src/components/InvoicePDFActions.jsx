/**
 * Invoice PDF Actions Component
 * 
 * Provides PDF download and email sending functionality
 * Story: EPIC-4-001 - Generate PDF
 */

import React, { useState } from 'react';
import axios from 'axios';
import '../styles/InvoicePDFActions.css';

export default function InvoicePDFActions({ invoiceId, invoiceNumber, clientEmail }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState(clientEmail || '');

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  /**
   * Download PDF invoice
   */
  const handleDownloadPDF = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/invoices/${invoiceId}/pdf`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob'
        }
      );

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceNumber || invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('PDF downloaded successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError(err.response?.data?.message || 'Failed to download PDF');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send invoice via email
   */
  const handleSendEmail = async () => {
    try {
      if (!recipientEmail || !recipientEmail.includes('@')) {
        setError('Please enter a valid email address');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `/api/invoices/${invoiceId}/send`,
        {
          recipientEmail
        },
        {
          headers: getAuthHeader()
        }
      );

      if (response.data.success) {
        setSuccess(`Invoice sent successfully to ${recipientEmail}`);
        setEmailDialogOpen(false);
        setRecipientEmail('');
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.data.message || 'Failed to send email');
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invoice-pdf-actions">
      {/* Download PDF Button */}
      <button
        className="btn btn-primary pdf-action-btn"
        onClick={handleDownloadPDF}
        disabled={loading}
        title="Download invoice as PDF"
      >
        {loading ? (
          <>
            <span className="spinner"></span> Generating...
          </>
        ) : (
          <>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M19 14v5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-5" strokeWidth="2" />
              <polyline points="7 10 12 15 17 10" strokeWidth="2" />
              <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
            </svg>
            Download PDF
          </>
        )}
      </button>

      {/* Send Email Button */}
      <button
        className="btn btn-secondary pdf-action-btn"
        onClick={() => setEmailDialogOpen(true)}
        disabled={loading}
        title="Send invoice via email"
      >
        {loading ? (
          <>
            <span className="spinner"></span> Sending...
          </>
        ) : (
          <>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth="2" />
              <path d="m22 7-10 5L2 7" strokeWidth="2" />
            </svg>
            Send Email
          </>
        )}
      </button>

      {/* Email Dialog */}
      {emailDialogOpen && (
        <div className="email-dialog-overlay">
          <div className="email-dialog">
            <div className="dialog-header">
              <h3>Send Invoice via Email</h3>
              <button
                className="close-btn"
                onClick={() => setEmailDialogOpen(false)}
                disabled={loading}
              >
                ✕
              </button>
            </div>

            <div className="dialog-content">
              <div className="form-group">
                <label htmlFor="recipient-email">Recipient Email</label>
                <input
                  id="recipient-email"
                  type="email"
                  className="form-control"
                  placeholder="client@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="dialog-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setEmailDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSendEmail}
                disabled={loading || !recipientEmail}
              >
                {loading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button className="close-btn" onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success">
          {success}
          <button className="close-btn" onClick={() => setSuccess(null)}>✕</button>
        </div>
      )}
    </div>
  );
}
