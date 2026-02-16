/**
 * Client Model Unit Tests
 * Story: EPIC-1-001 - Create Invoice Draft
 */

import Client from '../../../src/models/client.js';
import db from '../../../src/database/db.js';
import { v4 as uuidv4 } from 'uuid';

// Mock the database module
jest.mock('../../../src/database/db.js');

describe('Client Model', () => {
  let mockUserId;
  let mockClientId;

  beforeEach(() => {
    mockUserId = uuidv4();
    mockClientId = uuidv4();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a client with required fields', async () => {
      const insertMock = jest.fn().mockResolvedValue(undefined);
      db.mockReturnValue({
        insert: insertMock
      });

      const clientData = {
        name: 'John Doe',
        email: 'john@example.com'
      };

      const result = await Client.create(mockUserId, clientData);

      expect(result).toBeDefined();
      expect(result.name).toBe('John Doe');
      expect(result.email).toBe('john@example.com');
      expect(result.userId).toBe(mockUserId);
      expect(result.status).toBe('active');
      expect(insertMock).toHaveBeenCalled();
    });

    it('should create a client with all fields', async () => {
      const insertMock = jest.fn().mockResolvedValue(undefined);
      db.mockReturnValue({
        insert: insertMock
      });

      const clientData = {
        name: 'Acme Inc',
        email: 'contact@acme.com',
        phone: '01234567890',
        address: '123 Main St',
        postalCode: '75001',
        city: 'Paris',
        country: 'France',
        companyName: 'Acme Inc',
        siret: '12345678901234',
        vatNumber: 'FR12345678901'
      };

      const result = await Client.create(mockUserId, clientData);

      expect(result.name).toBe('Acme Inc');
      expect(result.companyName).toBe('Acme Inc');
      expect(result.siret).toBe('12345678901234');
      expect(result.country).toBe('France');
    });

    it('should default country to France', async () => {
      const insertMock = jest.fn().mockResolvedValue(undefined);
      db.mockReturnValue({
        insert: insertMock
      });

      const clientData = {
        name: 'Test Client',
        email: 'test@example.com'
      };

      const result = await Client.create(mockUserId, clientData);

      expect(result.country).toBe('France');
    });
  });

  describe('findById', () => {
    it('should return null if client not found', async () => {
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const result = await Client.findById(uuidv4());

      expect(result).toBeNull();
    });

    it('should return formatted client if found', async () => {
      const mockClient = {
        id: mockClientId,
        user_id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '01234567890',
        address: '123 Main St',
        postal_code: '75001',
        city: 'Paris',
        country: 'France',
        company_name: 'John Doe LLC',
        siret: null,
        vat_number: null,
        contact_person: null,
        contact_phone: null,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
      };

      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockClient)
      });

      const result = await Client.findById(mockClientId);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockClientId);
      expect(result.userId).toBe(mockUserId);
      expect(result.name).toBe('John Doe');
      expect(result.city).toBe('Paris');
    });

    it('should exclude archived clients', async () => {
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      await Client.findById(mockClientId);

      const chainedCalls = db().where.mock.results;
      expect(chainedCalls[1].value.where).toHaveBeenCalledWith('status', '!=', 'archived');
    });
  });

  describe('findByUserId', () => {
    it('should return all active clients for user', async () => {
      const mockClients = [
        {
          id: uuidv4(),
          user_id: mockUserId,
          name: 'Client 1',
          email: 'client1@example.com',
          status: 'active'
        },
        {
          id: uuidv4(),
          user_id: mockUserId,
          name: 'Client 2',
          email: 'client2@example.com',
          status: 'active'
        }
      ];

      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        offset: jest.fn().mockResolvedValue(mockClients)
      });

      const result = await Client.findByUserId(mockUserId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });

    it('should support pagination options', async () => {
      const limitMock = jest.fn().mockReturnThis();
      const offsetMock = jest.fn().mockResolvedValue([]);

      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: limitMock,
        offset: offsetMock
      });

      await Client.findByUserId(mockUserId, { limit: 20, offset: 40 });

      expect(limitMock).toHaveBeenCalledWith(20);
      expect(offsetMock).toHaveBeenCalledWith(40);
    });
  });

  describe('findByEmailAndUserId', () => {
    it('should find client by email and user ID', async () => {
      const mockClient = {
        id: mockClientId,
        user_id: mockUserId,
        email: 'test@example.com',
        name: 'Test Client'
      };

      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockClient)
      });

      const result = await Client.findByEmailAndUserId(mockUserId, 'test@example.com');

      expect(result).toBeDefined();
      expect(result.email).toBe('test@example.com');
    });

    it('should return null if email not found', async () => {
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const result = await Client.findByEmailAndUserId(mockUserId, 'notfound@example.com');

      expect(result).toBeNull();
    });
  });

  describe('emailExistsForUser', () => {
    it('should return true if email exists for user', async () => {
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ id: mockClientId })
      });

      const result = await Client.emailExistsForUser(mockUserId, 'test@example.com');

      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const result = await Client.emailExistsForUser(mockUserId, 'notfound@example.com');

      expect(result).toBe(false);
    });

    it('should exclude specified client when checking', async () => {
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const excludeId = uuidv4();
      await Client.emailExistsForUser(mockUserId, 'test@example.com', excludeId);

      // Verify the where chain includes the exclude
      const whereCalls = db().where.mock.calls;
      expect(whereCalls.length).toBeGreaterThan(0);
    });
  });

  describe('formatClientResponse', () => {
    it('should format client response correctly', () => {
      const mockClient = {
        id: mockClientId,
        user_id: mockUserId,
        name: 'John Doe',
        email: 'john@example.com',
        phone: '01234567890',
        address: '123 Main St',
        postal_code: '75001',
        city: 'Paris',
        country: 'France',
        company_name: 'John Doe LLC',
        siret: '12345678901234',
        vat_number: 'FR12345678901',
        contact_person: 'Jane Doe',
        contact_phone: '09876543210',
        status: 'active',
        created_at: new Date('2024-02-16'),
        updated_at: new Date('2024-02-16')
      };

      const result = Client.formatClientResponse(mockClient);

      expect(result.userId).toBe(mockUserId);
      expect(result.postalCode).toBe('75001');
      expect(result.companyName).toBe('John Doe LLC');
      expect(result.siret).toBe('12345678901234');
    });

    it('should return null for null input', () => {
      const result = Client.formatClientResponse(null);
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update client fields', async () => {
      const updateMock = jest.fn().mockReturnThis();
      const findByIdSpy = jest.spyOn(Client, 'findById').mockResolvedValue({
        id: mockClientId,
        name: 'Updated Name'
      });

      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        update: updateMock
      });

      await Client.update(mockClientId, { name: 'Updated Name' });

      expect(updateMock).toHaveBeenCalled();
      findByIdSpy.mockRestore();
    });
  });

  describe('delete', () => {
    it('should soft delete client', async () => {
      const updateMock = jest.fn().mockReturnThis();

      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        update: updateMock
      });

      await Client.delete(mockClientId);

      expect(updateMock).toHaveBeenCalled();
      const updateCall = updateMock.mock.calls[0][0];
      expect(updateCall.status).toBe('archived');
    });
  });
});
