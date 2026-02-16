/**
 * Invoice Status History Model Tests
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import InvoiceStatusHistory from '../../src/models/invoiceStatusHistory.js';
import Invoice from '../../src/models/invoice.js';
import Client from '../../src/models/client.js';
import User from '../../src/models/user.js';
import db from '../../src/database/db.js';

describe('InvoiceStatusHistory Model', () => {
  let testUser;
  let testClient;
  let testInvoice;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      email: 'history-test@example.com',
      password: 'hashedPassword123',
      firstName: 'History',
      lastName: 'Tester'
    });

    // Create test client
    testClient = await Client.create(testUser.id, {
      name: 'History Test Client',
      email: 'client@example.com',
      phone: '123456789'
    });

    // Create test invoice
    testInvoice = await Invoice.create(testUser.id, {
      clientId: testClient.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  });

  afterAll(async () => {
    // Cleanup
    if (testInvoice) {
      await Invoice.delete(testInvoice.id);
    }
    if (testClient) {
      await Client.delete(testClient.id);
    }
    if (testUser) {
      await User.delete(testUser.id);
    }
    await db.destroy();
  });

  describe('recordTransition', () => {
    it('should record a status transition', async () => {
      const result = await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'SENT',
        'DRAFT',
        'Invoice sent to client',
        { method: 'email' }
      );

      expect(result).toBeDefined();
      expect(result.invoiceId).toBe(testInvoice.id);
      expect(result.userId).toBe(testUser.id);
      expect(result.toStatus).toBe('SENT');
      expect(result.fromStatus).toBe('DRAFT');
      expect(result.reason).toBe('Invoice sent to client');
      expect(result.metadata.method).toBe('email');
    });

    it('should record transition without from_status', async () => {
      const result = await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'DRAFT'
      );

      expect(result).toBeDefined();
      expect(result.fromStatus).toBeNull();
      expect(result.toStatus).toBe('DRAFT');
    });

    it('should record transition without reason', async () => {
      const result = await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'SENT'
      );

      expect(result).toBeDefined();
      expect(result.reason).toBeNull();
    });
  });

  describe('getInvoiceHistory', () => {
    beforeEach(async () => {
      // Record multiple transitions
      await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'SENT',
        'DRAFT'
      );
      await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'PAID',
        'SENT'
      );
    });

    it('should get all transitions for an invoice', async () => {
      const history = await InvoiceStatusHistory.getInvoiceHistory(testInvoice.id);

      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('should order by created_at descending by default', async () => {
      const history = await InvoiceStatusHistory.getInvoiceHistory(
        testInvoice.id,
        { orderDir: 'desc' }
      );

      expect(history.length).toBeGreaterThanOrEqual(1);
      for (let i = 0; i < history.length - 1; i++) {
        expect(new Date(history[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(history[i + 1].createdAt).getTime()
        );
      }
    });

    it('should respect limit option', async () => {
      const history = await InvoiceStatusHistory.getInvoiceHistory(
        testInvoice.id,
        { limit: 1 }
      );

      expect(history.length).toBeLessThanOrEqual(1);
    });

    it('should respect offset option', async () => {
      const historyFull = await InvoiceStatusHistory.getInvoiceHistory(
        testInvoice.id,
        { limit: 100, offset: 0 }
      );

      const historyOffset = await InvoiceStatusHistory.getInvoiceHistory(
        testInvoice.id,
        { limit: 100, offset: 1 }
      );

      expect(historyOffset.length).toBeLessThanOrEqual(historyFull.length - 1);
    });
  });

  describe('getUserHistory', () => {
    it('should get all transitions for a user', async () => {
      const history = await InvoiceStatusHistory.getUserHistory(testUser.id);

      expect(Array.isArray(history)).toBe(true);
    });

    it('should respect limit and offset for user history', async () => {
      const history = await InvoiceStatusHistory.getUserHistory(
        testUser.id,
        { limit: 5, offset: 0 }
      );

      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getRecentTransitions', () => {
    it('should get recent transitions for an invoice', async () => {
      const recent = await InvoiceStatusHistory.getRecentTransitions(
        testInvoice.id,
        5
      );

      expect(Array.isArray(recent)).toBe(true);
      expect(recent.length).toBeLessThanOrEqual(5);
    });

    it('should order by created_at descending', async () => {
      const recent = await InvoiceStatusHistory.getRecentTransitions(
        testInvoice.id,
        10
      );

      if (recent.length > 1) {
        for (let i = 0; i < recent.length - 1; i++) {
          expect(new Date(recent[i].createdAt).getTime()).toBeGreaterThanOrEqual(
            new Date(recent[i + 1].createdAt).getTime()
          );
        }
      }
    });
  });

  describe('hasBeenInStatus', () => {
    beforeEach(async () => {
      // Record a transition to SENT
      await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'SENT'
      );
    });

    it('should return true if invoice has been in status', async () => {
      const hasBeenSent = await InvoiceStatusHistory.hasBeenInStatus(
        testInvoice.id,
        'SENT'
      );

      expect(hasBeenSent).toBe(true);
    });

    it('should return false if invoice has not been in status', async () => {
      const hasBeenPaid = await InvoiceStatusHistory.hasBeenInStatus(
        testInvoice.id,
        'PAID'
      );

      expect(hasBeenPaid).toBe(false);
    });
  });

  describe('getLastTransitionToStatus', () => {
    it('should get the most recent transition to a status', async () => {
      // Record two transitions
      await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'SENT'
      );

      // Add small delay
      await new Promise(resolve => setTimeout(resolve, 10));

      await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'PAID'
      );

      const lastSentTransition = await InvoiceStatusHistory.getLastTransitionToStatus(
        testInvoice.id,
        'SENT'
      );

      expect(lastSentTransition).toBeDefined();
      expect(lastSentTransition.toStatus).toBe('SENT');
    });

    it('should return null if status never occurred', async () => {
      const lastTransition = await InvoiceStatusHistory.getLastTransitionToStatus(
        testInvoice.id,
        'NONEXISTENT'
      );

      expect(lastTransition).toBeNull();
    });
  });

  describe('formatHistoryResponse', () => {
    it('should format history record correctly', async () => {
      const record = await InvoiceStatusHistory.recordTransition(
        testInvoice.id,
        testUser.id,
        'SENT',
        'DRAFT',
        'Test reason'
      );

      expect(record.id).toBeDefined();
      expect(record.invoiceId).toBe(testInvoice.id);
      expect(record.userId).toBe(testUser.id);
      expect(record.fromStatus).toBe('DRAFT');
      expect(record.toStatus).toBe('SENT');
      expect(record.reason).toBe('Test reason');
      expect(record.createdAt).toBeDefined();
    });

    it('should return null for null input', () => {
      const result = InvoiceStatusHistory.formatHistoryResponse(null);
      expect(result).toBeNull();
    });
  });

  describe('Audit Trail Completeness', () => {
    it('should create complete audit trail for invoice workflow', async () => {
      const freshInvoice = await Invoice.create(testUser.id, {
        clientId: testClient.id,
        invoiceDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });

      // Record workflow
      await InvoiceStatusHistory.recordTransition(
        freshInvoice.id,
        testUser.id,
        'SENT',
        'DRAFT',
        'Initial send'
      );

      await InvoiceStatusHistory.recordTransition(
        freshInvoice.id,
        testUser.id,
        'PAID',
        'SENT',
        'Payment received'
      );

      // Get complete history
      const history = await InvoiceStatusHistory.getInvoiceHistory(freshInvoice.id);

      expect(history.length).toBeGreaterThanOrEqual(2);
      expect(history[history.length - 1].toStatus).toBe('SENT');
      expect(history[history.length - 2].toStatus).toBe('PAID');

      // Cleanup
      await Invoice.delete(freshInvoice.id);
    });
  });
});
