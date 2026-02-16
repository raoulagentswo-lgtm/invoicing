/**
 * Status Transitions Utility Tests
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import {
  ALLOWED_TRANSITIONS,
  TRANSITION_REQUIREMENTS,
  STATUS_ORDER,
  validateStatusTransition,
  isInvoiceOverdue,
  getTransitionDescription,
  getAllowedNextStatuses,
  getTimestampToSet,
  isAutomaticTransition
} from '../../src/utils/statusTransitions.js';
import LineItem from '../../src/models/lineItem.js';

// Mock LineItem model
jest.mock('../../src/models/lineItem.js');

describe('Status Transitions Utility', () => {
  describe('ALLOWED_TRANSITIONS', () => {
    it('should define transitions for all statuses', () => {
      expect(ALLOWED_TRANSITIONS).toHaveProperty('DRAFT');
      expect(ALLOWED_TRANSITIONS).toHaveProperty('SENT');
      expect(ALLOWED_TRANSITIONS).toHaveProperty('PAID');
      expect(ALLOWED_TRANSITIONS).toHaveProperty('OVERDUE');
      expect(ALLOWED_TRANSITIONS).toHaveProperty('CANCELLED');
    });

    it('should allow DRAFT to transition to SENT and CANCELLED', () => {
      expect(ALLOWED_TRANSITIONS.DRAFT).toContain('SENT');
      expect(ALLOWED_TRANSITIONS.DRAFT).toContain('CANCELLED');
    });

    it('should prevent DRAFT from transitioning to PAID', () => {
      expect(ALLOWED_TRANSITIONS.DRAFT).not.toContain('PAID');
    });

    it('should allow SENT to transition to PAID, CANCELLED, and OVERDUE', () => {
      expect(ALLOWED_TRANSITIONS.SENT).toContain('PAID');
      expect(ALLOWED_TRANSITIONS.SENT).toContain('CANCELLED');
      expect(ALLOWED_TRANSITIONS.SENT).toContain('OVERDUE');
    });

    it('should not allow transitions from PAID (except CANCELLED)', () => {
      expect(ALLOWED_TRANSITIONS.PAID).toEqual(['CANCELLED']);
    });

    it('should not allow transitions from CANCELLED', () => {
      expect(ALLOWED_TRANSITIONS.CANCELLED).toEqual([]);
    });
  });

  describe('TRANSITION_REQUIREMENTS', () => {
    it('should define requirements for all transition keys', () => {
      expect(TRANSITION_REQUIREMENTS).toHaveProperty('DRAFT->SENT');
      expect(TRANSITION_REQUIREMENTS).toHaveProperty('SENT->PAID');
      expect(TRANSITION_REQUIREMENTS).toHaveProperty('SENT->OVERDUE');
    });

    it('should require line items for DRAFT->SENT', () => {
      const req = TRANSITION_REQUIREMENTS['DRAFT->SENT'];
      expect(req.validations).toContain('hasLineItems');
      expect(req.setsTimestamp).toBe('sent_at');
    });

    it('should set paid_at timestamp for SENT->PAID', () => {
      const req = TRANSITION_REQUIREMENTS['SENT->PAID'];
      expect(req.setsTimestamp).toBe('paid_at');
    });
  });

  describe('validateStatusTransition', () => {
    it('should allow valid transition DRAFT->SENT with line items', async () => {
      const invoice = {
        id: 'inv-123',
        status: 'DRAFT',
        dueDate: new Date(),
        userId: 'user-123'
      };

      LineItem.findByInvoiceId.mockResolvedValue([
        { id: 'item-1', quantity: 1, unitPrice: 100 }
      ]);

      const result = await validateStatusTransition('DRAFT', 'SENT', invoice);

      expect(result.allowed).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject DRAFT->SENT without line items', async () => {
      const invoice = {
        id: 'inv-123',
        status: 'DRAFT',
        dueDate: new Date()
      };

      LineItem.findByInvoiceId.mockResolvedValue([]);

      const result = await validateStatusTransition('DRAFT', 'SENT', invoice);

      expect(result.allowed).toBe(false);
      expect(result.errors).toContain('Invoice must have at least one line item to be sent');
    });

    it('should reject invalid transition DRAFT->PAID', async () => {
      const invoice = { status: 'DRAFT' };

      const result = await validateStatusTransition('DRAFT', 'PAID', invoice);

      expect(result.allowed).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should allow SENT->PAID transition', async () => {
      const invoice = {
        id: 'inv-123',
        status: 'SENT',
        dueDate: new Date()
      };

      const result = await validateStatusTransition('SENT', 'PAID', invoice);

      expect(result.allowed).toBe(true);
    });

    it('should allow OVERDUE->PAID transition', async () => {
      const invoice = {
        id: 'inv-123',
        status: 'OVERDUE',
        dueDate: new Date(Date.now() - 86400000) // Past date
      };

      const result = await validateStatusTransition('OVERDUE', 'PAID', invoice);

      expect(result.allowed).toBe(true);
    });
  });

  describe('isInvoiceOverdue', () => {
    it('should return true when due date is in the past', () => {
      const invoice = {
        status: 'SENT',
        dueDate: new Date(Date.now() - 86400000) // Yesterday
      };

      expect(isInvoiceOverdue(invoice)).toBe(true);
    });

    it('should return false when due date is in the future', () => {
      const invoice = {
        status: 'SENT',
        dueDate: new Date(Date.now() + 86400000) // Tomorrow
      };

      expect(isInvoiceOverdue(invoice)).toBe(false);
    });

    it('should return false for PAID invoices regardless of due date', () => {
      const invoice = {
        status: 'PAID',
        dueDate: new Date(Date.now() - 86400000)
      };

      expect(isInvoiceOverdue(invoice)).toBe(false);
    });

    it('should return false for CANCELLED invoices', () => {
      const invoice = {
        status: 'CANCELLED',
        dueDate: new Date(Date.now() - 86400000)
      };

      expect(isInvoiceOverdue(invoice)).toBe(false);
    });
  });

  describe('getTransitionDescription', () => {
    it('should return description for DRAFT->SENT', () => {
      const desc = getTransitionDescription('DRAFT', 'SENT');
      expect(desc).toBe('Sending invoice');
    });

    it('should return description for SENT->PAID', () => {
      const desc = getTransitionDescription('SENT', 'PAID');
      expect(desc).toBe('Marking invoice as paid');
    });

    it('should return generic description for unknown transition', () => {
      const desc = getTransitionDescription('UNKNOWN', 'STATUS');
      expect(desc).toContain('Transition from');
    });
  });

  describe('getAllowedNextStatuses', () => {
    it('should return allowed statuses for DRAFT', () => {
      const statuses = getAllowedNextStatuses('DRAFT');
      expect(statuses).toEqual(['SENT', 'CANCELLED']);
    });

    it('should return allowed statuses for SENT', () => {
      const statuses = getAllowedNextStatuses('SENT');
      expect(statuses).toContain('PAID');
      expect(statuses).toContain('CANCELLED');
      expect(statuses).toContain('OVERDUE');
    });

    it('should return empty array for CANCELLED', () => {
      const statuses = getAllowedNextStatuses('CANCELLED');
      expect(statuses).toEqual([]);
    });
  });

  describe('getTimestampToSet', () => {
    it('should return sent_at for DRAFT->SENT', () => {
      const field = getTimestampToSet('DRAFT', 'SENT');
      expect(field).toBe('sent_at');
    });

    it('should return paid_at for SENT->PAID', () => {
      const field = getTimestampToSet('SENT', 'PAID');
      expect(field).toBe('paid_at');
    });

    it('should return null for DRAFT->CANCELLED', () => {
      const field = getTimestampToSet('DRAFT', 'CANCELLED');
      expect(field).toBeNull();
    });
  });

  describe('isAutomaticTransition', () => {
    it('should return true for SENT->OVERDUE', () => {
      const automatic = isAutomaticTransition('SENT', 'OVERDUE');
      expect(automatic).toBe(true);
    });

    it('should return false for DRAFT->SENT', () => {
      const automatic = isAutomaticTransition('DRAFT', 'SENT');
      expect(automatic).toBe(false);
    });
  });

  describe('STATUS_ORDER', () => {
    it('should define order for all statuses', () => {
      expect(STATUS_ORDER).toHaveProperty('DRAFT');
      expect(STATUS_ORDER).toHaveProperty('SENT');
      expect(STATUS_ORDER).toHaveProperty('PAID');
      expect(STATUS_ORDER).toHaveProperty('OVERDUE');
      expect(STATUS_ORDER).toHaveProperty('CANCELLED');
    });

    it('should have DRAFT with order 1', () => {
      expect(STATUS_ORDER.DRAFT).toBe(1);
    });

    it('should have PAID with order 4', () => {
      expect(STATUS_ORDER.PAID).toBe(4);
    });
  });
});
