/**
 * Line Items Routes Tests
 * 
 * Story: EPIC-1-002/003 - Line Items & Tax Calculations
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server.js';
import User from '../../src/models/user.js';
import Client from '../../src/models/client.js';
import Invoice from '../../src/models/invoice.js';
import LineItem from '../../src/models/lineItem.js';
import db from '../../src/database/db.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

describe('Line Items Routes', () => {
  let testUser;
  let testClient;
  let testInvoice;
  let authToken;

  beforeAll(async () => {
    // Run migrations
    await db.migrate.latest();
  });

  afterAll(async () => {
    // Cleanup
    await db.destroy();
  });

  beforeEach(async () => {
    // Create test user
    testUser = await User.create({
      email: `test${uuidv4()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      password: 'TestPassword123!'
    });

    // Generate auth token
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '30d' }
    );

    // Create test client
    testClient = await Client.create(testUser.id, {
      name: 'Test Client',
      email: 'client@example.com',
      city: 'Paris'
    });

    // Create test invoice
    testInvoice = await Invoice.create(testUser.id, {
      clientId: testClient.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  });

  describe('POST /api/invoices/:invoiceId/line-items', () => {
    it('should create a new line item', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/line-items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Development Services',
          quantity: 10,
          unitPrice: 150,
          taxRate: 20,
          taxIncluded: false
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.lineItem).toBeDefined();
      expect(response.body.data.lineItem.description).toBe('Development Services');
      expect(response.body.data.lineItem.amount).toBe(1500);
      expect(response.body.data.lineItem.taxAmount).toBe(300);
      expect(response.body.data.lineItem.total).toBe(1800);
      expect(response.body.data.invoiceTotals).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/line-items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test',
          quantity: -5,
          unitPrice: 100
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/line-items`)
        .send({
          description: 'Test',
          quantity: 1,
          unitPrice: 100
        });

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .post(`/api/invoices/${uuidv4()}/line-items`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test',
          quantity: 1,
          unitPrice: 100
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 for unauthorized invoice', async () => {
      // Create another user
      const otherUser = await User.create({
        email: `test${uuidv4()}@example.com`,
        firstName: 'Other',
        lastName: 'User',
        password: 'TestPassword123!'
      });

      const otherToken = jwt.sign(
        { id: otherUser.id, email: otherUser.email },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '30d' }
      );

      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/line-items`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send({
          description: 'Test',
          quantity: 1,
          unitPrice: 100
        });

      expect(response.status).toBe(403);
    });
  });

  describe('GET /api/invoices/:invoiceId/line-items', () => {
    it('should get all line items for an invoice', async () => {
      // Create some line items
      await LineItem.create(testInvoice.id, {
        description: 'Item 1',
        quantity: 5,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });

      await LineItem.create(testInvoice.id, {
        description: 'Item 2',
        quantity: 3,
        unitPrice: 200,
        taxRate: 20,
        taxIncluded: false
      });

      const response = await request(app)
        .get(`/api/invoices/${testInvoice.id}/line-items`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.lineItems).toHaveLength(2);
      expect(response.body.data.totals).toBeDefined();
      expect(response.body.data.totals.subtotalAmount).toBe(1100);
      expect(response.body.data.totals.totalTaxAmount).toBe(220);
      expect(response.body.data.totals.totalAmount).toBe(1320);
    });

    it('should return empty array for invoice with no line items', async () => {
      const response = await request(app)
        .get(`/api/invoices/${testInvoice.id}/line-items`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.lineItems).toEqual([]);
    });
  });

  describe('PUT /api/invoices/:invoiceId/line-items/:lineItemId', () => {
    let lineItem;

    beforeEach(async () => {
      lineItem = await LineItem.create(testInvoice.id, {
        description: 'Original Item',
        quantity: 10,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });
    });

    it('should update a line item', async () => {
      const response = await request(app)
        .put(`/api/invoices/${testInvoice.id}/line-items/${lineItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Updated Item',
          quantity: 5
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.lineItem.description).toBe('Updated Item');
      expect(response.body.data.lineItem.quantity).toBe(5);
      expect(response.body.data.lineItem.amount).toBe(500);
    });

    it('should recalculate totals on update', async () => {
      await request(app)
        .put(`/api/invoices/${testInvoice.id}/line-items/${lineItem.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          unitPrice: 50
        });

      const response = await request(app)
        .get(`/api/invoices/${testInvoice.id}/line-items`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.totals.subtotalAmount).toBe(500);
      expect(response.body.data.totals.totalTaxAmount).toBe(100);
      expect(response.body.data.totals.totalAmount).toBe(600);
    });

    it('should return 404 for non-existent line item', async () => {
      const response = await request(app)
        .put(`/api/invoices/${testInvoice.id}/line-items/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          description: 'Test'
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/invoices/:invoiceId/line-items/:lineItemId', () => {
    let lineItem;

    beforeEach(async () => {
      lineItem = await LineItem.create(testInvoice.id, {
        description: 'Item to delete',
        quantity: 5,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });
    });

    it('should delete a line item', async () => {
      const response = await request(app)
        .delete(`/api/invoices/${testInvoice.id}/line-items/${lineItem.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify it's deleted
      const checkResponse = await request(app)
        .get(`/api/invoices/${testInvoice.id}/line-items`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(checkResponse.body.data.lineItems).toHaveLength(0);
    });

    it('should recalculate totals on delete', async () => {
      // Create another line item
      await LineItem.create(testInvoice.id, {
        description: 'Item 2',
        quantity: 5,
        unitPrice: 50,
        taxRate: 20,
        taxIncluded: false
      });

      // Delete first item
      await request(app)
        .delete(`/api/invoices/${testInvoice.id}/line-items/${lineItem.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      // Check totals
      const response = await request(app)
        .get(`/api/invoices/${testInvoice.id}/line-items`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.data.totals.subtotalAmount).toBe(250);
      expect(response.body.data.totals.totalTaxAmount).toBe(50);
      expect(response.body.data.totals.totalAmount).toBe(300);
    });
  });
});
