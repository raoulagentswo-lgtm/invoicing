/**
 * LineItem Model Tests
 * 
 * Story: EPIC-1-002/003 - Line Items & Tax Calculations
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import LineItem from '../../src/models/lineItem.js';
import Invoice from '../../src/models/invoice.js';
import User from '../../src/models/user.js';
import Client from '../../src/models/client.js';
import db from '../../src/database/db.js';
import { v4 as uuidv4 } from 'uuid';

describe('LineItem Model', () => {
  let testUser;
  let testClient;
  let testInvoice;
  let testLineItem;

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

  describe('calculateAmounts', () => {
    it('should calculate amounts without tax included', () => {
      const result = LineItem.calculateAmounts(10, 100, 20, false);
      expect(result.amount).toBe(1000);
      expect(result.taxAmount).toBe(200);
      expect(result.total).toBe(1200);
    });

    it('should calculate amounts with tax included', () => {
      const result = LineItem.calculateAmounts(10, 100, 20, true);
      expect(result.amount).toBe(1000);
      expect(result.taxAmount).toBe(0);
      expect(result.total).toBe(1000);
    });

    it('should handle decimal quantities', () => {
      const result = LineItem.calculateAmounts(2.5, 50, 20, false);
      expect(result.amount).toBe(125);
      expect(result.taxAmount).toBe(25);
      expect(result.total).toBe(150);
    });

    it('should handle different tax rates', () => {
      const result = LineItem.calculateAmounts(10, 100, 5.5, false);
      expect(result.amount).toBe(1000);
      expect(result.taxAmount).toBe(55);
      expect(result.total).toBe(1055);
    });

    it('should round to 2 decimals', () => {
      const result = LineItem.calculateAmounts(3, 33.33, 20, false);
      expect(result.amount).toBe(99.99);
      expect(result.taxAmount).toBe(19.98);
      expect(result.total).toBe(119.97);
    });
  });

  describe('create', () => {
    it('should create a new line item', async () => {
      const lineItem = await LineItem.create(testInvoice.id, {
        description: 'Test Line Item',
        quantity: 5,
        unitPrice: 50,
        taxRate: 20,
        taxIncluded: false
      });

      expect(lineItem).toBeDefined();
      expect(lineItem.id).toBeDefined();
      expect(lineItem.description).toBe('Test Line Item');
      expect(lineItem.quantity).toBe(5);
      expect(lineItem.unitPrice).toBe(50);
      expect(lineItem.amount).toBe(250);
      expect(lineItem.taxAmount).toBe(50);
      expect(lineItem.total).toBe(300);
      expect(lineItem.lineOrder).toBe(0);
    });

    it('should increment line order for multiple items', async () => {
      const item1 = await LineItem.create(testInvoice.id, {
        description: 'Item 1',
        quantity: 1,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });

      const item2 = await LineItem.create(testInvoice.id, {
        description: 'Item 2',
        quantity: 1,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });

      expect(item1.lineOrder).toBe(0);
      expect(item2.lineOrder).toBe(1);
    });
  });

  describe('findById', () => {
    it('should find a line item by ID', async () => {
      const created = await LineItem.create(testInvoice.id, {
        description: 'Test Item',
        quantity: 1,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });

      const found = await LineItem.findById(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.description).toBe('Test Item');
    });

    it('should return null for non-existent line item', async () => {
      const found = await LineItem.findById(uuidv4());
      expect(found).toBeNull();
    });
  });

  describe('findByInvoiceId', () => {
    it('should find all line items for an invoice', async () => {
      await LineItem.create(testInvoice.id, {
        description: 'Item 1',
        quantity: 1,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });

      await LineItem.create(testInvoice.id, {
        description: 'Item 2',
        quantity: 2,
        unitPrice: 50,
        taxRate: 20,
        taxIncluded: false
      });

      const items = await LineItem.findByInvoiceId(testInvoice.id);

      expect(items).toHaveLength(2);
      expect(items[0].description).toBe('Item 1');
      expect(items[1].description).toBe('Item 2');
    });

    it('should return empty array for invoice with no line items', async () => {
      const items = await LineItem.findByInvoiceId(testInvoice.id);
      expect(items).toEqual([]);
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      testLineItem = await LineItem.create(testInvoice.id, {
        description: 'Original Item',
        quantity: 10,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });
    });

    it('should update line item description', async () => {
      const updated = await LineItem.update(testLineItem.id, {
        description: 'Updated Item'
      });

      expect(updated.description).toBe('Updated Item');
    });

    it('should recalculate amounts on quantity change', async () => {
      const updated = await LineItem.update(testLineItem.id, {
        quantity: 5
      });

      expect(updated.quantity).toBe(5);
      expect(updated.amount).toBe(500);
      expect(updated.taxAmount).toBe(100);
      expect(updated.total).toBe(600);
    });

    it('should recalculate amounts on unit price change', async () => {
      const updated = await LineItem.update(testLineItem.id, {
        unitPrice: 50
      });

      expect(updated.unitPrice).toBe(50);
      expect(updated.amount).toBe(500);
      expect(updated.taxAmount).toBe(100);
      expect(updated.total).toBe(600);
    });

    it('should recalculate amounts on tax rate change', async () => {
      const updated = await LineItem.update(testLineItem.id, {
        taxRate: 10
      });

      expect(updated.taxRate).toBe(10);
      expect(updated.amount).toBe(1000);
      expect(updated.taxAmount).toBe(100);
      expect(updated.total).toBe(1100);
    });

    it('should handle tax included change', async () => {
      const updated = await LineItem.update(testLineItem.id, {
        taxIncluded: true
      });

      expect(updated.taxIncluded).toBe(true);
      expect(updated.taxAmount).toBe(0);
      expect(updated.total).toBe(1000);
    });
  });

  describe('delete', () => {
    it('should soft delete a line item', async () => {
      const created = await LineItem.create(testInvoice.id, {
        description: 'Item to delete',
        quantity: 1,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });

      await LineItem.delete(created.id);

      const found = await LineItem.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe('calculateInvoiceTotals', () => {
    it('should calculate totals for all line items', async () => {
      await LineItem.create(testInvoice.id, {
        description: 'Item 1',
        quantity: 10,
        unitPrice: 100,
        taxRate: 20,
        taxIncluded: false
      });

      await LineItem.create(testInvoice.id, {
        description: 'Item 2',
        quantity: 5,
        unitPrice: 200,
        taxRate: 20,
        taxIncluded: false
      });

      const totals = await LineItem.calculateInvoiceTotals(testInvoice.id);

      expect(totals.subtotalAmount).toBe(2000);
      expect(totals.totalTaxAmount).toBe(400);
      expect(totals.totalAmount).toBe(2400);
    });

    it('should return zero totals for invoice with no line items', async () => {
      const totals = await LineItem.calculateInvoiceTotals(testInvoice.id);

      expect(totals.subtotalAmount).toBe(0);
      expect(totals.totalTaxAmount).toBe(0);
      expect(totals.totalAmount).toBe(0);
    });
  });
});
