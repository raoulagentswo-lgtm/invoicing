/**
 * Invoice Model Unit Tests
 * Story: EPIC-1-001 - Create Invoice Draft
 */

import Invoice from '../../../src/models/invoice.js';
import db from '../../../src/database/db.js';
import { v4 as uuidv4 } from 'uuid';

// Mock the database module
jest.mock('../../../src/database/db.js');

describe('Invoice Model', () => {
  let mockUserId;
  let mockClientId;

  beforeEach(() => {
    mockUserId = uuidv4();
    mockClientId = uuidv4();
    jest.clearAllMocks();
  });

  describe('generateInvoiceNumber', () => {
    it('should generate a valid invoice number with format PREFIX-YYYYMM-SEQUENCE', async () => {
      const mockLastInvoice = { invoice_sequence: 5 };
      
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockLastInvoice)
      });

      const invoiceNumber = await Invoice.generateInvoiceNumber(mockUserId, 'INV');
      
      expect(invoiceNumber).toMatch(/^INV-\d{6}-\d{5}$/);
    });

    it('should increment sequence number correctly', async () => {
      const mockLastInvoice = { invoice_sequence: 10 };
      
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockLastInvoice)
      });

      const invoiceNumber = await Invoice.generateInvoiceNumber(mockUserId);
      
      expect(invoiceNumber).toMatch(/-00011$/);
    });

    it('should start sequence at 1 if no previous invoices exist', async () => {
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const invoiceNumber = await Invoice.generateInvoiceNumber(mockUserId);
      
      expect(invoiceNumber).toMatch(/-00001$/);
    });
  });

  describe('create', () => {
    it('should create an invoice with default values', async () => {
      const mockGenerateNumber = jest.spyOn(Invoice, 'generateInvoiceNumber')
        .mockResolvedValue('INV-202402-00001');

      const insertMock = jest.fn().mockResolvedValue(undefined);
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: 0 }),
        insert: insertMock,
        orderBy: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const invoiceData = {
        clientId: mockClientId
      };

      const result = await Invoice.create(mockUserId, invoiceData);

      expect(result).toBeDefined();
      expect(result.status).toBe('DRAFT');
      expect(result.currency).toBe('EUR');
      expect(result.taxRate).toBe(20);
      expect(insertMock).toHaveBeenCalled();

      mockGenerateNumber.mockRestore();
    });

    it('should calculate tax amount correctly', async () => {
      const mockGenerateNumber = jest.spyOn(Invoice, 'generateInvoiceNumber')
        .mockResolvedValue('INV-202402-00001');

      const insertMock = jest.fn().mockResolvedValue(undefined);
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: 0 }),
        insert: insertMock,
        orderBy: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const invoiceData = {
        clientId: mockClientId,
        subtotalAmount: 100,
        taxRate: 20
      };

      const result = await Invoice.create(mockUserId, invoiceData);

      expect(result.subtotalAmount).toBe(100);
      expect(result.taxAmount).toBe(20);
      expect(result.totalAmount).toBe(120);

      mockGenerateNumber.mockRestore();
    });

    it('should use custom currency and tax rate', async () => {
      const mockGenerateNumber = jest.spyOn(Invoice, 'generateInvoiceNumber')
        .mockResolvedValue('INV-202402-00001');

      const insertMock = jest.fn().mockResolvedValue(undefined);
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        count: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ count: 0 }),
        insert: insertMock,
        orderBy: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const invoiceData = {
        clientId: mockClientId,
        currency: 'USD',
        taxRate: 10
      };

      const result = await Invoice.create(mockUserId, invoiceData);

      expect(result.currency).toBe('USD');
      expect(result.taxRate).toBe(10);

      mockGenerateNumber.mockRestore();
    });
  });

  describe('findById', () => {
    it('should return null if invoice not found', async () => {
      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(null)
      });

      const result = await Invoice.findById(uuidv4());

      expect(result).toBeNull();
    });

    it('should return formatted invoice if found', async () => {
      const mockInvoice = {
        id: uuidv4(),
        user_id: mockUserId,
        client_id: mockClientId,
        invoice_number: 'INV-202402-00001',
        status: 'DRAFT',
        currency: 'EUR',
        tax_rate: 20,
        created_at: new Date(),
        updated_at: new Date()
      };

      db.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue(mockInvoice)
      });

      const result = await Invoice.findById(mockInvoice.id);

      expect(result).toBeDefined();
      expect(result.invoiceNumber).toBe('INV-202402-00001');
      expect(result.status).toBe('DRAFT');
    });
  });

  describe('formatInvoiceResponse', () => {
    it('should format invoice response correctly', () => {
      const mockInvoice = {
        id: uuidv4(),
        user_id: mockUserId,
        client_id: mockClientId,
        invoice_number: 'INV-202402-00001',
        invoice_date: new Date('2024-02-16'),
        due_date: new Date('2024-03-17'),
        paid_date: null,
        status: 'DRAFT',
        description: 'Test invoice',
        notes: 'Test notes',
        currency: 'EUR',
        tax_rate: 20,
        tax_amount: 20,
        subtotal_amount: 100,
        total_amount: 120,
        paid_amount: 0,
        payment_terms: 'Net 30',
        payment_instructions: 'Bank transfer',
        created_at: new Date('2024-02-16'),
        updated_at: new Date('2024-02-16')
      };

      const result = Invoice.formatInvoiceResponse(mockInvoice);

      expect(result.invoiceNumber).toBe('INV-202402-00001');
      expect(result.userId).toBe(mockUserId);
      expect(result.clientId).toBe(mockClientId);
      expect(result.taxRate).toBe(20);
      expect(result.paidAmount).toBe(0);
    });

    it('should return null for null input', () => {
      const result = Invoice.formatInvoiceResponse(null);
      expect(result).toBeNull();
    });
  });

  describe('getDefaultDueDate', () => {
    it('should return a date 30 days in the future', () => {
      const today = new Date();
      const expectedDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const result = Invoice.getDefaultDueDate();

      // Allow 1 second difference for test execution time
      expect(Math.abs(result.getTime() - expectedDate.getTime())).toBeLessThan(1000);
    });
  });
});
