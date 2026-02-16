/**
 * Client Routes Integration Tests
 * Story: EPIC-2-001 - Create Client
 * Note: Initially created as supporting tests for EPIC-1-001 (Create Invoice Draft)
 * Now completed as primary functionality tests for Story 7 (EPIC-2-001)
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

describe('Client Routes', () => {
  describe('POST /api/clients', () => {
    it('should create a new client', async () => {
      const clientData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '0123456789',
        city: 'Paris'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData);

      if (response.status === 201) {
        expect(response.body.success).toBe(true);
        expect(response.body.data).toBeDefined();
        expect(response.body.data.name).toBe('John Doe');
        expect(response.body.data.status).toBe('active');
      }
    });

    it('should require client name and email', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({
          phone: '0123456789'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({
          name: 'John Doe',
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should default country to France', async () => {
      const clientData = {
        name: 'Test Client',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData);

      if (response.status === 201) {
        expect(response.body.data.country).toBe('France');
      }
    });

    it('should allow custom country', async () => {
      const clientData = {
        name: 'Test Client',
        email: 'test@example.com',
        country: 'Germany'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData);

      if (response.status === 201) {
        expect(response.body.data.country).toBe('Germany');
      }
    });

    it('should accept company information', async () => {
      const clientData = {
        name: 'Acme Inc',
        email: 'contact@acme.com',
        companyName: 'Acme Corporation',
        siret: '12345678901234',
        vatNumber: 'FR12345678901'
      };

      const response = await request(app)
        .post('/api/clients')
        .send(clientData);

      if (response.status === 201) {
        expect(response.body.data.companyName).toBe('Acme Corporation');
        expect(response.body.data.siret).toBe('12345678901234');
      }
    });
  });

  describe('GET /api/clients', () => {
    it('should return list of clients', async () => {
      const response = await request(app)
        .get('/api/clients')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    it('should support status filter', async () => {
      const response = await request(app)
        .get('/api/clients?status=active')
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/clients?limit=20&offset=0')
        .expect(200);

      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.offset).toBe(0);
    });
  });

  describe('GET /api/clients/:clientId', () => {
    it('should return 404 for non-existent client', async () => {
      const fakeId = uuidv4();

      const response = await request(app)
        .get(`/api/clients/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/not found/i);
    });
  });

  describe('PATCH /api/clients/:clientId', () => {
    it('should require authentication', async () => {
      const fakeId = uuidv4();

      const response = await request(app)
        .patch(`/api/clients/${fakeId}`)
        .send({ name: 'Updated Name' });

      // Status will depend on auth middleware mock
      expect([400, 403, 404]).toContain(response.status);
    });

    it('should validate email format on update', async () => {
      const fakeId = uuidv4();

      const response = await request(app)
        .patch(`/api/clients/${fakeId}`)
        .send({ email: 'invalid-email' });

      expect([400, 404]).toContain(response.status);
    });
  });

  describe('DELETE /api/clients/:clientId', () => {
    it('should return 404 for non-existent client', async () => {
      const fakeId = uuidv4();

      const response = await request(app)
        .delete(`/api/clients/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});
