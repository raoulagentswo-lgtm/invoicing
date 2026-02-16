/**
 * Invoice Status Actions Component
 * 
 * Displays action buttons to transition invoice status
 * Includes confirmation dialogs for status changes
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import React, { useState } from 'react';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import '../styles/InvoiceStatusActions.css';

const ACTION_CONFIG = {
  DRAFT: {
    SEND: {
      label: 'Send Invoice',
      description: 'Send invoice to client',
      color: 'primary',
      icon: '📤'
    },
    CANCEL: {
      label: 'Cancel',
      description: 'Cancel this draft invoice',
      color: 'danger',
      icon: '❌'
    }
  },
  SENT: {
    MARK_PAID: {
      label: 'Mark as Paid',
      description: 'Record payment received',
      color: 'success',
      icon: '✅'
    },
    CANCEL: {
      label: 'Cancel',
      description: 'Cancel this invoice',
      color: 'danger',
      icon: '❌'
    }
  },
  OVERDUE: {
    MARK_PAID: {
      label: 'Mark as Paid',
      description: 'Record payment received',
      color: 'success',
      icon: '✅'
    },
    SEND_REMINDER: {
      label: 'Send Reminder',
      description: 'Send payment reminder to client',
      color: 'warning',
      icon: '🔔'
    },
    CANCEL: {
      label: 'Cancel',
      description: 'Cancel this invoice',
      color: 'danger',
      icon: '❌'
    }
  },
  PAID: {
    CANCEL: {
      label: 'Reverse',
      description: 'Reverse this payment',
      color: 'danger',
      icon: '↩️'
    }
  }
};

const InvoiceStatusActions = ({
  invoice,
  onStatusChange,
  onError,
  disabled = false,
  loading = false
}) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmationReason, setConfirmationReason] = useState('');

  const currentStatus = invoice?.status || 'DRAFT';
  const actions = ACTION_CONFIG[currentStatus] || {};

  const handleActionClick = (actionKey, action) => {
    setConfirmAction({
      key: actionKey,
      action: action,
      newStatus: getNewStatus(actionKey)
    });
    setShowConfirmation(true);
  };

  const getNewStatus = (actionKey) => {
    const statusMap = {
      SEND: 'SENT',
      MARK_PAID: 'PAID',
      CANCEL: 'CANCELLED',
      SEND_REMINDER: 'SENT' // Not an actual status change, just a notification
    };
    return statusMap[actionKey] || null;
  };

  const handleConfirm = async () => {
    if (!confirmAction || !confirmAction.newStatus) {
      return;
    }

    try {
      await onStatusChange(confirmAction.newStatus, confirmationReason);
      setShowConfirmation(false);
      setConfirmAction(null);
      setConfirmationReason('');
    } catch (error) {
      onError?.(error);
    }
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setConfirmAction(null);
    setConfirmationReason('');
  };

  return (
    <div className="invoice-status-actions">
      {/* Current Status Badge */}
      <div className="current-status">
        <label className="status-label">Status:</label>
        <InvoiceStatusBadge
          status={currentStatus}
          size="medium"
          showDescription={false}
        />
      </div>

      {/* Action Buttons */}
      {Object.entries(actions).length > 0 ? (
        <div className="action-buttons">
          <label className="actions-label">Actions:</label>
          <div className="buttons-grid">
            {Object.entries(actions).map(([actionKey, action]) => (
              <button
                key={actionKey}
                className={`action-button action-${actionKey.toLowerCase()} color-${action.color}`}
                onClick={() => handleActionClick(actionKey, action)}
                disabled={disabled || loading}
                title={action.description}
              >
                <span className="button-icon">{action.icon}</span>
                <span className="button-label">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-actions">
          <p>No actions available for {currentStatus} invoices</p>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmation && confirmAction && (
        <div className="confirmation-overlay" onClick={handleCancel}>
          <div className="confirmation-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="confirmation-header">
              <h3>Confirm Action</h3>
              <button
                className="close-button"
                onClick={handleCancel}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="confirmation-body">
              <p className="confirmation-message">
                {`Are you sure you want to ${confirmAction.action.label.toLowerCase()}?`}
              </p>
              <p className="confirmation-description">
                {confirmAction.action.description}
              </p>

              {/* Optional Reason Field */}
              {['CANCEL', 'MARK_PAID'].includes(confirmAction.key) && (
                <div className="reason-field">
                  <label htmlFor="confirmation-reason">Reason (optional):</label>
                  <textarea
                    id="confirmation-reason"
                    className="reason-input"
                    placeholder="Enter reason for this action..."
                    value={confirmationReason}
                    onChange={(e) => setConfirmationReason(e.target.value)}
                    maxLength={500}
                    rows={3}
                  />
                  <div className="char-count">
                    {confirmationReason.length}/500
                  </div>
                </div>
              )}

              {/* Status Transition Preview */}
              <div className="status-preview">
                <div className="status-arrow">
                  <InvoiceStatusBadge status={currentStatus} size="small" />
                  <span className="arrow">→</span>
                  <InvoiceStatusBadge
                    status={confirmAction.newStatus}
                    size="small"
                  />
                </div>
              </div>
            </div>

            <div className="confirmation-footer">
              <button
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={`btn btn-${confirmAction.action.color}`}
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceStatusActions;
