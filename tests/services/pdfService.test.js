/**
 * PDF Service Unit Tests
 * 
 * Tests for PDF generation service
 * Story: EPIC-4-001 - Generate PDF
 */

import { generateInvoicePDF } from '../../src/services/pdfService.js';

describe('PDF Service', () => {
  const mockInvoice = {
    id: 'test-invoice-123',
    invoiceNumber: 'INV-001',
    invoiceDate: new Date('2026-02-16'),
    dueDate: new Date('2026-03-18'),
    taxRate: 20,
    paymentTerms: 'Net 30',
    paymentInstructions: 'Bank transfer'
  };

  const mockClient = {
    id: 'test-client-123',
    name: 'Test Client Company',
    email: 'client@test.com',
    address: '123 Test Street',
    city: 'Test City',
    zipCode: '75000',
    country: 'France',
    phone: '+33123456789'
  };

  const mockUser = {
    id: 'test-user-123',
    email: 'user@test.com',
    companyName: 'My Company',
    bankName: 'Example Bank',
    iban: 'FR1420041010050500013M02606'
  };

  const mockLineItems = [
    {
      id: 'item-1',
      description: 'Service 1',
      quantity: 1,
      unitPrice: 500
    },
    {
      id: 'item-2',
      description: 'Service 2',
      quantity: 2,
      unitPrice: 250
    }
  ];

  describe('generateInvoicePDF', () => {
    test('should generate a PDF buffer', async () => {
      const pdfBuffer = await generateInvoicePDF(
        mockInvoice,
        mockClient,
        mockUser,
        mockLineItems
      );

      expect(pdfBuffer).toBeDefined();
      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    test('should generate valid PDF structure', async () => {
      const pdfBuffer = await generateInvoicePDF(
        mockInvoice,
        mockClient,
        mockUser,
        mockLineItems
      );

      const pdfString = pdfBuffer.toString('utf8', 0, 10);
      expect(pdfString).toContain('%PDF');
    });

    test('should handle empty line items', async () => {
      const pdfBuffer = await generateInvoicePDF(
        mockInvoice,
        mockClient,
        mockUser,
        []
      );

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    test('should handle missing optional fields', async () => {
      const minimalInvoice = {
        id: 'test-invoice-minimal',
        invoiceDate: new Date(),
        dueDate: new Date()
      };

      const minimalClient = {
        id: 'test-client',
        name: 'Test Client',
        email: 'test@test.com'
      };

      const minimalUser = {
        id: 'test-user',
        companyName: 'My Company'
      };

      const pdfBuffer = await generateInvoicePDF(
        minimalInvoice,
        minimalClient,
        minimalUser,
        []
      );

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    test('should generate PDF with different tax rates', async () => {
      const invoiceWithTax = {
        ...mockInvoice,
        taxRate: 5.5
      };

      const pdfBuffer = await generateInvoicePDF(
        invoiceWithTax,
        mockClient,
        mockUser,
        mockLineItems
      );

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    test('should handle multiple line items', async () => {
      const manyLineItems = Array.from({ length: 10 }, (_, i) => ({
        id: `item-${i}`,
        description: `Item ${i + 1}`,
        quantity: i + 1,
        unitPrice: 100 * (i + 1)
      }));

      const pdfBuffer = await generateInvoicePDF(
        mockInvoice,
        mockClient,
        mockUser,
        manyLineItems
      );

      expect(Buffer.isBuffer(pdfBuffer)).toBe(true);
      expect(pdfBuffer.length).toBeGreaterThan(0);
    });

    test('should throw error on invalid parameters', async () => {
      await expect(
        generateInvoicePDF(null, mockClient, mockUser, mockLineItems)
      ).rejects.toThrow();
    });
  });
});
