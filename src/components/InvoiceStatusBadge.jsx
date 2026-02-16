/**
 * Invoice Status Badge Component
 * 
 * Displays the current status of an invoice with appropriate color and styling
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import React from 'react';
import '../styles/InvoiceStatusBadge.css';

const STATUS_CONFIG = {
  DRAFT: {
    label: 'Draft',
    className: 'status-draft',
    icon: '📝',
    description: 'Invoice is in draft state and not yet sent'
  },
  SENT: {
    label: 'Sent',
    className: 'status-sent',
    icon: '📤',
    description: 'Invoice has been sent to client'
  },
  PAID: {
    label: 'Paid',
    className: 'status-paid',
    icon: '✅',
    description: 'Invoice has been paid'
  },
  OVERDUE: {
    label: 'Overdue',
    className: 'status-overdue',
    icon: '⚠️',
    description: 'Invoice is overdue and not yet paid'
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'status-cancelled',
    icon: '❌',
    description: 'Invoice has been cancelled'
  }
};

const InvoiceStatusBadge = ({
  status = 'DRAFT',
  size = 'medium',
  showDescription = false,
  onClick = null,
  interactive = false
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

  const handleClick = () => {
    if (interactive && onClick) {
      onClick(status);
    }
  };

  return (
    <div
      className={`status-badge ${config.className} size-${size} ${interactive ? 'interactive' : ''}`}
      onClick={handleClick}
      title={config.description}
      role={interactive ? 'button' : 'status'}
      tabIndex={interactive ? 0 : -1}
      onKeyPress={(e) => {
        if (interactive && (e.key === 'Enter' || e.key === ' ')) {
          handleClick();
        }
      }}
    >
      <span className="status-icon">{config.icon}</span>
      <span className="status-label">{config.label}</span>
      {showDescription && (
        <div className="status-description">{config.description}</div>
      )}
    </div>
  );
};

export default InvoiceStatusBadge;
