/**
 * Client Model Tests
 * 
 * Story: EPIC-2-005 - List Clients
 * Tests for Client model with search, sort, and pagination
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import User from '../../src/models/user.js';
import Client from '../../src/models/client.js';
import db from '../../src/database/db.js';
import { v4 as uuidv4 } from 'uuid';

describe('Client Model', () => {
  let testUser;
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

    // Create test clients with varied data for search testing
    const clientData = [
      { name: 'Alice Smith', email: 'alice.smith@example.com', phone: '0611223344' },
      { name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '0622334455' },
      { name: 'Charlie Brown', email: 'charlie.brown@example.com', phone: '0633445566' },
      { name: 'Diana Prince', email: 'diana.prince@example.com', phone: '0644556677' },
      { name: 'Eve Wilson', email: 'eve.wilson@example.com', phone: '0655667788' }
    ];

    for (const data of clientData) {
      const client = await Client.create(testUser.id, data);
      testClients.push(client);
      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  });

  describe('create', () => {
    it('should create a new client', async () => {
      const clientData = {
        name: 'New Client',
        email: 'newclient@example.com',
        phone: '0611111111'
      };

      const client = await Client.create(testUser.id, clientData);

      expect(client.id).toBeDefined();
      expect(client.name).toBe('New Client');
      expect(client.email).toBe('newclient@example.com');
      expect(client.phone).toBe('0611111111');
      expect(client.status).toBe('active');
      expect(client.createdAt).toBeDefined();
    });

    it('should set default country to France', async () => {
      const client = await Client.create(testUser.id, {
        name: 'Test Client',
        email: 'test@example.com'
      });

      expect(client.country).toBe('France');
    });

    it('should store user relationship', async () => {
      const client = await Client.create(testUser.id, {
        name: 'Test Client',
        email: 'test@example.com'
      });

      expect(client.userId).toBe(testUser.id);
    });
  });

  describe('findByUserId', () => {
    it('should return all clients for user', async () => {
      const result = await Client.findByUserId(testUser.id);

      expect(result.clients.length).toBe(5);
      expect(result.total).toBe(5);
    });

    it('should support pagination with limit and offset', async () => {
      const result = await Client.findByUserId(testUser.id, {
        limit: 2,
        offset: 0
      });

      expect(result.clients.length).toBe(2);
      expect(result.total).toBe(5);
    });

    it('should apply offset correctly', async () => {
      const result1 = await Client.findByUserId(testUser.id, {
        limit: 2,
        offset: 0,
        sortBy: 'name'
      });

      const result2 = await Client.findByUserId(testUser.id, {
        limit: 2,
        offset: 2,
        sortBy: 'name'
      });

      expect(result1.clients[0].name).not.toBe(result2.clients[0].name);
    });

    it('should search by name', async () => {
      const result = await Client.findByUserId(testUser.id, {
        search: 'Alice'
      });

      expect(result.total).toBe(1);
      expect(result.clients[0].name).toBe('Alice Smith');
    });

    it('should search by email', async () => {
      const result = await Client.findByUserId(testUser.id, {
        search: 'bob.johnson'
      });

      expect(result.total).toBe(1);
      expect(result.clients[0].email).toMatch(/bob.johnson/);
    });

    it('should search by phone', async () => {
      const result = await Client.findByUserId(testUser.id, {
        search: '0633'
      });

      expect(result.total).toBe(1);
      expect(result.clients[0].phone).toMatch(/0633/);
    });

    it('should perform case-insensitive search', async () => {
      const result = await Client.findByUserId(testUser.id, {
        search: 'ALICE'
      });

      expect(result.total).toBe(1);
      expect(result.clients[0].name).toMatch(/alice/i);
    });

    it('should search with partial match', async () => {
      const result = await Client.findByUserId(testUser.id, {
        search: 'son'
      });

      expect(result.total).toBeGreaterThan(0);
      const hasMatch = result.clients.some(c => 
        c.name.toLowerCase().includes('son') || 
        c.email.toLowerCase().includes('son')
      );
      expect(hasMatch).toBe(true);
    });

    it('should return empty results for non-matching search', async () => {
      const result = await Client.findByUserId(testUser.id, {
        search: 'nonexistent'
      });

      expect(result.total).toBe(0);
      expect(result.clients).toEqual([]);
    });

    it('should sort by name ascending', async () => {
      const result = await Client.findByUserId(testUser.id, {
        sortBy: 'name',
        sortOrder: 'asc'
      });

      const names = result.clients.map(c => c.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should sort by name descending', async () => {
      const result = await Client.findByUserId(testUser.id, {
        sortBy: 'name',
        sortOrder: 'desc'
      });

      const names = result.clients.map(c => c.name);
      const sorted = [...names].sort().reverse();
      expect(names).toEqual(sorted);
    });

    it('should sort by creation date ascending', async () => {
      const result = await Client.findByUserId(testUser.id, {
        sortBy: 'created_at',
        sortOrder: 'asc'
      });

      const dates = result.clients.map(c => new Date(c.createdAt).getTime());
      const sorted = [...dates].sort((a, b) => a - b);
      expect(dates).toEqual(sorted);
    });

    it('should sort by creation date descending', async () => {
      const result = await Client.findByUserId(testUser.id, {
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      const dates = result.clients.map(c => new Date(c.createdAt).getTime());
      const sorted = [...dates].sort((a, b) => b - a);
      expect(dates).toEqual(sorted);
    });

    it('should default to sorting by name', async () => {
      const result = await Client.findByUserId(testUser.id, {});

      const names = result.clients.map(c => c.name);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should default to limit 20', async () => {
      const result = await Client.findByUserId(testUser.id);

      expect(result.clients.length).toBeLessThanOrEqual(20);
    });

    it('should return total count with pagination', async () => {
      const result = await Client.findByUserId(testUser.id, {
        limit: 2,
        offset: 0
      });

      expect(result.total).toBe(5);
      expect(result.clients.length).toBe(2);
    });

    it('should filter by active status', async () => {
      const result = await Client.findByUserId(testUser.id, {
        status: 'active'
      });

      expect(result.clients.every(c => c.status === 'active')).toBe(true);
    });

    it('should combine search and sort', async () => {
      const result = await Client.findByUserId(testUser.id, {
        search: 'son',
        sortBy: 'name',
        sortOrder: 'desc'
      });

      expect(result.total).toBeGreaterThan(0);
      const names = result.clients.map(c => c.name);
      const sorted = [...names].sort().reverse();
      expect(names).toEqual(sorted);
    });

    it('should only return non-archived clients', async () => {
      // Archive one client
      await Client.delete(testClients[0].id);

      const result = await Client.findByUserId(testUser.id, {
        status: 'active'
      });

      const hasArchived = result.clients.some(c => c.id === testClients[0].id);
      expect(hasArchived).toBe(false);
      expect(result.total).toBe(4);
    });

    it('should not return clients from other users', async () => {
      const otherUser = await User.create({
        email: `other${uuidv4()}@example.com`,
        firstName: 'Other',
        lastName: 'User',
        password: 'TestPassword123!'
      });

      await Client.create(otherUser.id, {
        name: 'Other User Client',
        email: 'otheruser@example.com'
      });

      const result = await Client.findByUserId(testUser.id);

      const hasOtherClient = result.clients.some(c => c.name === 'Other User Client');
      expect(hasOtherClient).toBe(false);
      expect(result.total).toBe(5);
    });
  });

  describe('findById', () => {
    it('should find client by ID', async () => {
      const client = await Client.findById(testClients[0].id);

      expect(client).toBeDefined();
      expect(client.id).toBe(testClients[0].id);
      expect(client.name).toBe(testClients[0].name);
    });

    it('should return null for non-existent client', async () => {
      const client = await Client.findById(uuidv4());

      expect(client).toBeNull();
    });
  });

  describe('update', () => {
    it('should update client fields', async () => {
      const updated = await Client.update(testClients[0].id, {
        name: 'Updated Name',
        phone: '0699999999'
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.phone).toBe('0699999999');
      expect(updated.email).toBe(testClients[0].email);
    });

    it('should update updatedAt timestamp', async () => {
      const originalClient = await Client.findById(testClients[0].id);
      const originalUpdatedAt = new Date(originalClient.updatedAt).getTime();

      await new Promise(resolve => setTimeout(resolve, 100));

      const updated = await Client.update(testClients[0].id, {
        name: 'Updated'
      });

      const newUpdatedAt = new Date(updated.updatedAt).getTime();
      expect(newUpdatedAt).toBeGreaterThan(originalUpdatedAt);
    });
  });

  describe('delete', () => {
    it('should soft delete client', async () => {
      const clientId = testClients[0].id;

      await Client.delete(clientId);

      const deleted = await Client.findById(clientId);
      expect(deleted).toBeNull();
    });

    it('should set deleted_at timestamp', async () => {
      const clientId = testClients[0].id;

      await Client.delete(clientId);

      const raw = await db('clients').where('id', clientId).first();
      expect(raw.deleted_at).toBeDefined();
    });

    it('should mark as archived', async () => {
      const clientId = testClients[0].id;

      await Client.delete(clientId);

      const raw = await db('clients').where('id', clientId).first();
      expect(raw.status).toBe('archived');
    });
  });

  describe('emailExistsForUser', () => {
    it('should return true if email exists for user', async () => {
      const exists = await Client.emailExistsForUser(
        testUser.id,
        testClients[0].email
      );

      expect(exists).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const exists = await Client.emailExistsForUser(
        testUser.id,
        'nonexistent@example.com'
      );

      expect(exists).toBe(false);
    });

    it('should exclude specified client on update', async () => {
      const exists = await Client.emailExistsForUser(
        testUser.id,
        testClients[0].email,
        testClients[0].id
      );

      expect(exists).toBe(false);
    });
  });

  describe('formatClientResponse', () => {
    it('should format client data correctly', async () => {
      const client = await Client.findById(testClients[0].id);

      expect(client.id).toBeDefined();
      expect(client.userId).toBeDefined();
      expect(client.name).toBeDefined();
      expect(client.email).toBeDefined();
      expect(client.createdAt).toBeDefined();
      expect(client.updatedAt).toBeDefined();
    });
  });
});
