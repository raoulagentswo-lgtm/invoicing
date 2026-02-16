/**
 * Status Transition Rules and Validation
 * 
 * Defines allowed transitions and validates business logic for invoice status changes
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import LineItem from '../models/lineItem.js';

/**
 * Allowed status transitions
 * Maps from current status to array of allowed next statuses
 */
export const ALLOWED_TRANSITIONS = {
  DRAFT: ['SENT', 'CANCELLED'],
  SENT: ['PAID', 'CANCELLED', 'OVERDUE'],
  PAID: ['CANCELLED'],
  OVERDUE: ['PAID', 'CANCELLED'],
  CANCELLED: []
};

/**
 * Status order (for determining if transitions make sense)
 */
export const STATUS_ORDER = {
  DRAFT: 1,
  SENT: 2,
  OVERDUE: 3,
  PAID: 4,
  CANCELLED: 0
};

/**
 * Required validations for each status transition
 */
export const TRANSITION_REQUIREMENTS = {
  'DRAFT->SENT': {
    description: 'Sending invoice',
    validations: ['hasLineItems'],
    setsTimestamp: 'sent_at'
  },
  'SENT->PAID': {
    description: 'Marking invoice as paid',
    validations: ['isOverdueCheckable'],
    setsTimestamp: 'paid_at'
  },
  'SENT->OVERDUE': {
    description: 'Auto-marking invoice as overdue',
    validations: ['isDueDatePassed'],
    automatic: true
  },
  'OVERDUE->PAID': {
    description: 'Marking overdue invoice as paid',
    validations: [],
    setsTimestamp: 'paid_at'
  },
  'DRAFT->CANCELLED': {
    description: 'Cancelling draft invoice',
    validations: [],
    setsTimestamp: null
  },
  'SENT->CANCELLED': {
    description: 'Cancelling sent invoice',
    validations: [],
    setsTimestamp: null
  },
  'PAID->CANCELLED': {
    description: 'Cancelling paid invoice (reversal)',
    validations: [],
    setsTimestamp: null
  },
  'OVERDUE->CANCELLED': {
    description: 'Cancelling overdue invoice',
    validations: [],
    setsTimestamp: null
  }
};

/**
 * Validate if a status transition is allowed
 * 
 * @param {string} currentStatus - Current invoice status
 * @param {string} newStatus - Desired new status
 * @param {Object} invoice - Invoice object with all details
 * @returns {Promise<{allowed: boolean, errors: Array<string>}>}
 */
export async function validateStatusTransition(currentStatus, newStatus, invoice) {
  const errors = [];

  // Check if transition is in allowed list
  const allowedStatuses = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
    errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`);
    return { allowed: false, errors };
  }

  // Get transition key and requirements
  const transitionKey = `${currentStatus}->${newStatus}`;
  const requirements = TRANSITION_REQUIREMENTS[transitionKey];

  if (!requirements) {
    errors.push(`Transition rules not defined for ${transitionKey}`);
    return { allowed: false, errors };
  }

  // Run validations
  for (const validation of requirements.validations) {
    const validationResult = await runValidation(validation, invoice);
    if (!validationResult.valid) {
      errors.push(...validationResult.errors);
    }
  }

  return {
    allowed: errors.length === 0,
    errors,
    requirements
  };
}

/**
 * Run a specific validation
 * 
 * @param {string} validationName - Name of validation to run
 * @param {Object} invoice - Invoice object
 * @returns {Promise<{valid: boolean, errors: Array<string>}>}
 */
async function runValidation(validationName, invoice) {
  const errors = [];

  switch (validationName) {
    case 'hasLineItems':
      // Check if invoice has line items
      const lineItems = await LineItem.findByInvoiceId(invoice.id);
      if (!lineItems || lineItems.length === 0) {
        errors.push('Invoice must have at least one line item to be sent');
      }
      break;

    case 'isDueDatePassed':
      // Check if due date has passed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dueDate = new Date(invoice.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate >= today) {
        errors.push('Invoice is not overdue yet');
      }
      break;

    case 'isOverdueCheckable':
      // Check if invoice can be marked as paid (no additional validation)
      break;

    default:
      errors.push(`Unknown validation: ${validationName}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Check if invoice is overdue based on current date
 * 
 * @param {Object} invoice - Invoice object
 * @returns {boolean} True if invoice is overdue
 */
export function isInvoiceOverdue(invoice) {
  if (invoice.status === 'PAID' || invoice.status === 'CANCELLED') {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

/**
 * Get human-readable description of status transition
 * 
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status
 * @returns {string} Description of transition
 */
export function getTransitionDescription(currentStatus, newStatus) {
  const key = `${currentStatus}->${newStatus}`;
  const requirement = TRANSITION_REQUIREMENTS[key];
  return requirement ? requirement.description : `Transition from ${currentStatus} to ${newStatus}`;
}

/**
 * Get all allowed next statuses for current status
 * 
 * @param {string} currentStatus - Current status
 * @returns {Array<string>} Array of allowed next statuses
 */
export function getAllowedNextStatuses(currentStatus) {
  return ALLOWED_TRANSITIONS[currentStatus] || [];
}

/**
 * Check if status transition requires a timestamp update
 * 
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status
 * @returns {string|null} Timestamp field to update or null
 */
export function getTimestampToSet(currentStatus, newStatus) {
  const key = `${currentStatus}->${newStatus}`;
  const requirement = TRANSITION_REQUIREMENTS[key];
  return requirement ? requirement.setsTimestamp : null;
}

/**
 * Check if status transition is automatic (system-driven)
 * 
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status
 * @returns {boolean} True if transition is automatic
 */
export function isAutomaticTransition(currentStatus, newStatus) {
  const key = `${currentStatus}->${newStatus}`;
  const requirement = TRANSITION_REQUIREMENTS[key];
  return requirement ? requirement.automatic || false : false;
}
