/**
 * Clients Routes Tests
 * 
 * Story: EPIC-2-005 - List Clients
 * Tests for GET /api/clients endpoint with search, filter, sort, and pagination
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/server.js';
import User from '../../src/models/user.js';
import Client from '../../src/models/client.js';
import db from '../../src/database/db.js';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

describe('Clients Routes', () => {
  let testUser;
  let authToken;
  let testClients = [];

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

    // Create test clients
    const clientNames = [
      { name: 'Alice Smith', email: 'alice@example.com', phone: '0611223344' },
      { name: 'Bob Johnson', email: 'bob@example.com', phone: '0622334455' },
      { name: 'Charlie Brown', email: 'charlie@example.com', phone: '0633445566' },
      { name: 'Diana Prince', email: 'diana@example.com', phone: '0644556677' },
      { name: 'Eve Wilson', email: 'eve@example.com', phone: '0655667788' }
    ];

    for (const clientData of clientNames) {
      const client = await Client.create(testUser.id, clientData);
      testClients.push(client);
    }
  });

  describe('POST /api/clients - Create Client', () => {
    it('should create a new client', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'New Client',
          email: 'newclient@example.com',
          phone: '0611111111'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Client');
      expect(response.body.data.email).toBe('newclient@example.com');
    });

    it('should reject duplicate emails', async () => {
      const response = await request(app)
        .post('/api/clients')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Duplicate Email',
          email: testClients[0].email
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/clients')
        .send({
          name: 'Test',
          email: 'test@example.com'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/clients - List Clients', () => {
    it('should return list of clients', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.total).toBe(5);
    });

    it('should support pagination with default limit (20)', async () => {
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.pagination.offset).toBe(0);
    });

    it('should support custom pagination limit', async () => {
      const response = await request(app)
        .get('/api/clients?limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.limit).toBe(2);
    });

    it('should enforce maximum limit of 100', async () => {
      const response = await request(app)
        .get('/api/clients?limit=200')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.limit).toBe(100);
    });

    it('should support pagination offset', async () => {
      const response = await request(app)
        .get('/api/clients?limit=2&offset=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(2);
      expect(response.body.pagination.offset).toBe(2);
    });

    it('should search by name', async () => {
      const response = await request(app)
        .get('/api/clients?search=alice')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toMatch(/alice/i);
    });

    it('should search by email', async () => {
      const response = await request(app)
        .get('/api/clients?search=bob@')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].email).toMatch(/bob/i);
    });

    it('should search by phone', async () => {
      const response = await request(app)
        .get('/api/clients?search=0611')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data[0].phone).toMatch(/0611/);
    });

    it('should perform case-insensitive search', async () => {
      const response = await request(app)
        .get('/api/clients?search=ALICE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].name).toMatch(/alice/i);
    });

    it('should sort by name ascending (default)', async () => {
      const response = await request(app)
        .get('/api/clients?sortBy=name&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const names = response.body.data.map(c => c.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should sort by name descending', async () => {
      const response = await request(app)
        .get('/api/clients?sortBy=name&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const names = response.body.data.map(c => c.name);
      const sorted = [...names].sort().reverse();
      expect(names).toEqual(sorted);
    });

    it('should sort by creation date', async () => {
      const response = await request(app)
        .get('/api/clients?sortBy=created_at&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      const dates = response.body.data.map(c => new Date(c.createdAt).getTime());
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sorted);
    });

    it('should sort by updated date', async () => {
      const response = await request(app)
        .get('/api/clients?sortBy=updated_at&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.filters.sortBy).toBe('updated_at');
    });

    it('should include pagination metadata', async () => {
      const response = await request(app)
        .get('/api/clients?limit=10&offset=0')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination).toEqual({
        limit: 10,
        offset: 0,
        total: 5,
        pages: 1
      });
    });

    it('should include filters in response', async () => {
      const response = await request(app)
        .get('/api/clients?search=alice&sortBy=name&sortOrder=desc&status=active')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.filters).toEqual({
        search: 'alice',
        sortBy: 'name',
        sortOrder: 'desc',
        status: 'active'
      });
    });

    it('should return empty list when search has no results', async () => {
      const response = await request(app)
        .get('/api/clients?search=nonexistent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.pagination.total).toBe(0);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/clients');

      expect(response.status).toBe(401);
    });

    it('should only return clients for authenticated user', async () => {
      // Create another user
      const otherUser = await User.create({
        email: `other${uuidv4()}@example.com`,
        firstName: 'Other',
        lastName: 'User',
        password: 'TestPassword123!'
      });

      // Create client for other user
      await Client.create(otherUser.id, {
        name: 'Other User Client',
        email: 'otheruser@example.com'
      });

      // Get clients for test user
      const response = await request(app)
        .get('/api/clients')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.total).toBe(5);
      const hasOtherUserClient = response.body.data.some(c => c.name === 'Other User Client');
      expect(hasOtherUserClient).toBe(false);
    });
  });

  describe('GET /api/clients/:clientId - Get Single Client', () => {
    it('should return a single client', async () => {
      const response = await request(app)
        .get(`/api/clients/${testClients[0].id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testClients[0].id);
    });

    it('should return 404 for non-existent client', async () => {
      const response = await request(app)
        .get(`/api/clients/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 for clients of other users', async () => {
      const otherUser = await User.create({
        email: `other${uuidv4()}@example.com`,
        firstName: 'Other',
        lastName: 'User',
        password: 'TestPassword123!'
      });

      const otherClient = await Client.create(otherUser.id, {
        name: 'Other User Client',
        email: 'otheruser@example.com'
      });

      const response = await request(app)
        .get(`/api/clients/${otherClient.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/clients/:clientId - Update Client', () => {
    it('should update a client', async () => {
      const response = await request(app)
        .patch(`/api/clients/${testClients[0].id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          phone: '0699999999'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
      expect(response.body.data.phone).toBe('0699999999');
    });

    it('should return 404 for non-existent client', async () => {
      const response = await request(app)
        .patch(`/api/clients/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/clients/:clientId - Delete Client', () => {
    it('should delete a client', async () => {
      const response = await request(app)
        .delete(`/api/clients/${testClients[0].id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify client is deleted (soft delete)
      const getResponse = await request(app)
        .get(`/api/clients/${testClients[0].id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 when deleting non-existent client', async () => {
      const response = await request(app)
        .delete(`/api/clients/${uuidv4()}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });
});
