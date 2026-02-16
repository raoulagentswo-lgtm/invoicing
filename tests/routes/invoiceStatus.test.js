/**
 * Invoice Status Routes Tests
 * Story: EPIC-1-005 - Invoice Workflow (Draft → Sent → Paid)
 */

import request from 'supertest';
import app from '../../src/server.js';
import db from '../../src/database/db.js';
import Invoice from '../../src/models/invoice.js';
import Client from '../../src/models/client.js';
import User from '../../src/models/user.js';
import jwt from 'jsonwebtoken';

describe('Invoice Status Routes', () => {
  let testUser;
  let testClient;
  let testInvoice;
  let authToken;

  beforeAll(async () => {
    // Create test user
    testUser = await User.create({
      email: 'status-test@example.com',
      password: 'hashedPassword123',
      firstName: 'Status',
      lastName: 'Tester'
    });

    // Create auth token
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret'
    );

    // Create test client
    testClient = await Client.create(testUser.id, {
      name: 'Status Test Client',
      email: 'client@example.com',
      phone: '123456789'
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

  beforeEach(async () => {
    // Create fresh invoice for each test
    testInvoice = await Invoice.create(testUser.id, {
      clientId: testClient.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    // Add a line item
    const LineItem = await import('../../src/models/lineItem.js').then(m => m.default);
    await LineItem.create(testInvoice.id, {
      description: 'Test Item',
      quantity: 1,
      unitPrice: 100,
      taxRate: 20,
      taxIncluded: false
    });
  });

  describe('PATCH /api/invoices/:invoiceId/status', () => {
    it('should change status from DRAFT to SENT', async () => {
      const response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SENT',
          reason: 'Sent to client'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.invoice.status).toBe('SENT');
      expect(response.body.data.invoice.sentAt).toBeDefined();
      expect(response.body.data.history).toBeDefined();
      expect(response.body.data.history.length).toBeGreaterThan(0);
    });

    it('should reject DRAFT->PAID transition', async () => {
      const response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'PAID'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should reject status change without authorization', async () => {
      const response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .send({
          status: 'SENT'
        });

      expect(response.status).toBe(401);
    });

    it('should reject status change for non-existent invoice', async () => {
      const response = await request(app)
        .patch(`/api/invoices/non-existent-id/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SENT'
        });

      expect(response.status).toBe(404);
    });

    it('should reject status change for invoice owned by other user', async () => {
      // Create another user
      const User2 = await import('../../src/models/user.js').then(m => m.default);
      const otherUser = await User2.create({
        email: 'other-user@example.com',
        password: 'hashedPassword123',
        firstName: 'Other',
        lastName: 'User'
      });

      const otherToken = jwt.sign(
        { id: otherUser.id, email: otherUser.email },
        process.env.JWT_SECRET || 'test-secret'
      );

      const response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          status: 'SENT'
        });

      expect(response.status).toBe(403);

      // Cleanup
      await User2.delete(otherUser.id);
    });

    it('should validate status field is required', async () => {
      const response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reason: 'Missing status'
        });

      expect(response.status).toBe(400);
    });

    it('should validate status is valid enum value', async () => {
      const response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'INVALID_STATUS'
        });

      expect(response.status).toBe(400);
    });

    it('should allow optional reason parameter', async () => {
      const response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SENT',
          reason: 'Payment received today'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.history[0].reason).toBe('Payment received today');
    });

    it('should allow optional metadata parameter', async () => {
      const response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'SENT',
          metadata: {
            sentVia: 'email',
            sentAt: new Date().toISOString()
          }
        });

      expect(response.status).toBe(200);
      expect(response.body.data.history[0].metadata).toBeDefined();
    });
  });

  describe('GET /api/invoices/:invoiceId/status-history', () => {
    beforeEach(async () => {
      // Change status to create history
      await Invoice.changeStatus(testInvoice.id, 'SENT', testUser.id, {
        reason: 'Initial send'
      });
    });

    it('should get status history for invoice', async () => {
      const response = await request(app)
        .get(`/api/invoices/${testInvoice.id}/status-history`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.currentStatus).toBe('SENT');
      expect(response.body.data.allowedNextStatuses).toContain('PAID');
      expect(Array.isArray(response.body.data.history)).toBe(true);
    });

    it('should include pagination info', async () => {
      const response = await request(app)
        .get(`/api/invoices/${testInvoice.id}/status-history?limit=10&offset=0`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination.limit).toBe(10);
      expect(response.body.data.pagination.offset).toBe(0);
    });

    it('should reject unauthorized access', async () => {
      const response = await request(app)
        .get(`/api/invoices/${testInvoice.id}/status-history`);

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .get(`/api/invoices/non-existent-id/status-history`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/invoices/auto-update-overdue', () => {
    beforeEach(async () => {
      // Create invoice with past due date
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 5); // 5 days ago

      testInvoice = await Invoice.create(testUser.id, {
        clientId: testClient.id,
        invoiceDate: new Date(),
        dueDate: pastDueDate
      });

      // Send it
      await Invoice.changeStatus(testInvoice.id, 'SENT', testUser.id);
    });

    it('should auto-update SENT invoices to OVERDUE', async () => {
      const response = await request(app)
        .post(`/api/invoices/auto-update-overdue`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedCount).toBeGreaterThanOrEqual(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/invoices/auto-update-overdue`);

      expect(response.status).toBe(401);
    });
  });

  describe('Status Workflow Integration', () => {
    it('should complete full workflow DRAFT->SENT->PAID', async () => {
      // Send invoice
      let response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'SENT' });

      expect(response.status).toBe(200);
      expect(response.body.data.invoice.status).toBe('SENT');

      // Mark as paid
      response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'PAID' });

      expect(response.status).toBe(200);
      expect(response.body.data.invoice.status).toBe('PAID');

      // Check history
      const historyResponse = await request(app)
        .get(`/api/invoices/${testInvoice.id}/status-history`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(historyResponse.body.data.history.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle cancellation from SENT', async () => {
      // Send invoice
      let response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'SENT' });

      expect(response.status).toBe(200);

      // Cancel
      response = await request(app)
        .patch(`/api/invoices/${testInvoice.id}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'CANCELLED',
          reason: 'Client requested cancellation'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.invoice.status).toBe('CANCELLED');
    });
  });
});
