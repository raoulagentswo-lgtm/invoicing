/**
 * useInvoiceStatus Hook
 * 
 * Custom React hook for managing invoice status transitions
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const useInvoiceStatus = (invoiceId, initialStatus = 'DRAFT') => {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  /**
   * Change invoice status
   */
  const changeStatus = useCallback(
    async (newStatus, reason = null, metadata = {}) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/invoices/${invoiceId}/status`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({
              status: newStatus,
              reason,
              metadata
            })
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to update status');
        }

        const data = await response.json();
        setStatus(data.data.invoice.status);
        setHistory(data.data.history);

        return {
          success: true,
          invoice: data.data.invoice,
          history: data.data.history
        };
      } catch (err) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      } finally {
        setLoading(false);
      }
    },
    [invoiceId]
  );

  /**
   * Fetch invoice status history
   */
  const fetchStatusHistory = useCallback(
    async (limit = 50, offset = 0) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/invoices/${invoiceId}/status-history?limit=${limit}&offset=${offset}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          }
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to fetch history');
        }

        const data = await response.json();
        setStatus(data.data.currentStatus);
        setHistory(data.data.history);

        return {
          success: true,
          currentStatus: data.data.currentStatus,
          allowedNextStatuses: data.data.allowedNextStatuses,
          history: data.data.history,
          pagination: data.data.pagination
        };
      } catch (err) {
        const errorMessage = err.message || 'An error occurred';
        setError(errorMessage);
        return {
          success: false,
          error: errorMessage
        };
      } finally {
        setLoading(false);
      }
    },
    [invoiceId]
  );

  /**
   * Send invoice (DRAFT -> SENT)
   */
  const sendInvoice = useCallback(
    async (reason = 'Invoice sent') => {
      return changeStatus('SENT', reason, {
        sentAt: new Date().toISOString()
      });
    },
    [changeStatus]
  );

  /**
   * Mark invoice as paid (SENT/OVERDUE -> PAID)
   */
  const markAsPaid = useCallback(
    async (reason = 'Payment received') => {
      return changeStatus('PAID', reason, {
        paidAt: new Date().toISOString()
      });
    },
    [changeStatus]
  );

  /**
   * Cancel invoice
   */
  const cancelInvoice = useCallback(
    async (reason = 'Invoice cancelled') => {
      return changeStatus('CANCELLED', reason, {
        cancelledAt: new Date().toISOString()
      });
    },
    [changeStatus]
  );

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    status,
    loading,
    error,
    history,
    changeStatus,
    fetchStatusHistory,
    sendInvoice,
    markAsPaid,
    cancelInvoice,
    clearError
  };
};

export default useInvoiceStatus;
