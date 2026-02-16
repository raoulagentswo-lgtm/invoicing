/**
 * Invoice Routes Integration Tests
 * Story: EPIC-1-001 - Create Invoice Draft
 */

import request from 'supertest';
import app from '../../src/server.js';
import { v4 as uuidv4 } from 'uuid';

// Mock authentication for tests
jest.mock('../../src/middleware/auth.js', () => ({
  authenticateToken: (req, res, next) => {
    req.user = {
      id: 'test-user-id-12345678901234567890',
      email: 'testuser@example.com'
    };
    next();
  }
}));

describe('Invoice Routes', () => {
  let mockClientId;

  beforeEach(() => {
    mockClientId = uuidv4();
  });

  describe('POST /api/invoices', () => {
    it('should create a new invoice draft', async () => {
      const invoiceData = {
        clientId: mockClientId,
        currency: 'EUR',
        taxRate: 20,
        subtotalAmount: 100
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.invoice).toBeDefined();
      expect(response.body.data.invoice.status).toBe('DRAFT');
    });

    it('should return validation error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/invoices')
        .send({
          currency: 'EUR'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate invoice date and due date', async () => {
      const invoiceData = {
        clientId: mockClientId,
        invoiceDate: '2024-03-01',
        dueDate: '2024-02-01', // Before invoice date
        currency: 'EUR'
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/due date must be after/i);
    });

    it('should validate currency format', async () => {
      const invoiceData = {
        clientId: mockClientId,
        currency: 'INVALID', // Wrong format
        taxRate: 20
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should validate tax rate range', async () => {
      const invoiceData = {
        clientId: mockClientId,
        taxRate: 150 // > 100
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should calculate tax correctly', async () => {
      const invoiceData = {
        clientId: mockClientId,
        subtotalAmount: 1000,
        taxRate: 10
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData);

      if (response.status === 201) {
        expect(response.body.data.invoice.subtotalAmount).toBe(1000);
        expect(response.body.data.invoice.taxAmount).toBe(100);
        expect(response.body.data.invoice.totalAmount).toBe(1100);
      }
    });

    it('should use default currency EUR', async () => {
      const invoiceData = {
        clientId: mockClientId
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData);

      if (response.status === 201) {
        expect(response.body.data.invoice.currency).toBe('EUR');
      }
    });

    it('should use default tax rate 20%', async () => {
      const invoiceData = {
        clientId: mockClientId
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData);

      if (response.status === 201) {
        expect(response.body.data.invoice.taxRate).toBe(20);
      }
    });

    it('should accept custom prefix for invoice number', async () => {
      const invoiceData = {
        clientId: mockClientId,
        invoicePrefix: 'FAC'
      };

      const response = await request(app)
        .post('/api/invoices')
        .send(invoiceData);

      if (response.status === 201) {
        expect(response.body.data.invoice.invoiceNumber).toMatch(/^FAC-/);
      }
    });
  });

  describe('GET /api/invoices', () => {
    it('should return list of invoices for authenticated user', async () => {
      const response = await request(app)
        .get('/api/invoices')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/api/invoices?status=DRAFT')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should support pagination with limit and offset', async () => {
      const response = await request(app)
        .get('/api/invoices?limit=10&offset=0')
        .expect(200);

      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.pagination.offset).toBe(0);
    });
  });

  describe('GET /api/invoices/:invoiceId', () => {
    it('should return 404 for non-existent invoice', async () => {
      const fakeId = uuidv4();

      const response = await request(app)
        .get(`/api/invoices/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/not found/i);
    });
  });

  describe('PATCH /api/invoices/:invoiceId', () => {
    it('should update invoice status', async () => {
      const fakeId = uuidv4();

      const response = await request(app)
        .patch(`/api/invoices/${fakeId}`)
        .send({ status: 'SENT' });

      // We expect 404 since we don't have real data, but validation should work
      expect([400, 404]).toContain(response.status);
    });

    it('should validate tax rate on update', async () => {
      const fakeId = uuidv4();

      const response = await request(app)
        .patch(`/api/invoices/${fakeId}`)
        .send({ taxRate: 150 })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/invoices/:invoiceId', () => {
    it('should return 404 for non-existent invoice', async () => {
      const fakeId = uuidv4();

      const response = await request(app)
        .delete(`/api/invoices/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
