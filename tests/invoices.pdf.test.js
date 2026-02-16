/**
 * Invoice PDF Generation Tests
 * 
 * Tests for POST /api/invoices/:id/pdf and POST /api/invoices/:id/send
 * Story: EPIC-4-001 - Generate PDF
 */

import request from 'supertest';
import app from '../src/server.js';
import User from '../src/models/user.js';
import Client from '../src/models/client.js';
import Invoice from '../src/models/invoice.js';
import LineItem from '../src/models/lineItem.js';
import db from '../src/database/db.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { hashPassword } from '../src/utils/password.js';

describe('Invoice PDF Generation', () => {
  let testUser;
  let testClient;
  let testInvoice;
  let accessToken;
  const testEmail = 'pdf@test.com';
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Clean up before tests
    await db('invoices').delete();
    await db('clients').delete();
    await db('users').delete();
  });

  afterAll(async () => {
    // Clean up after tests
    await db('invoices').delete();
    await db('clients').delete();
    await db('users').delete();
  });

  beforeEach(async () => {
    // Create a test user
    const passwordHash = await hashPassword(testPassword);
    testUser = await User.create({
      email: testEmail,
      firstName: 'John',
      lastName: 'Doe',
      passwordHash,
      companyName: 'Acme Corp',
      bankName: 'Example Bank',
      iban: 'FR1420041010050500013M02606'
    });

    accessToken = generateAccessToken({
      userId: testUser.id,
      email: testUser.email
    });

    // Create a test client
    testClient = await Client.create(testUser.id, {
      name: 'Client Test',
      email: 'client@test.com',
      address: '123 Test Street',
      city: 'Test City',
      zipCode: '75000',
      country: 'France',
      phone: '+33123456789'
    });

    // Create a test invoice
    testInvoice = await Invoice.create(testUser.id, {
      clientId: testClient.id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      description: 'Services',
      currency: 'EUR',
      taxRate: 20,
      subtotalAmount: 1000,
      paymentTerms: 'Net 30',
      paymentInstructions: 'Bank transfer'
    });

    // Add line items
    await LineItem.create({
      invoiceId: testInvoice.id,
      description: 'Service 1',
      quantity: 1,
      unitPrice: 500
    });

    await LineItem.create({
      invoiceId: testInvoice.id,
      description: 'Service 2',
      quantity: 2,
      unitPrice: 250
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await db('line_items').delete();
    await db('invoices').delete();
    await db('clients').delete();
    await db('users').delete();
  });

  describe('POST /api/invoices/:id/pdf', () => {
    test('should generate PDF for valid invoice', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/pdf`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toContain('attachment');
      expect(response.body).toBeDefined();
      expect(Buffer.isBuffer(response.body)).toBe(true);
    });

    test('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .post('/api/invoices/00000000-0000-0000-0000-000000000000/pdf')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    test('should return 403 for unauthorized user', async () => {
      // Create another user
      const otherUser = await User.create({
        email: 'other@test.com',
        firstName: 'Other',
        lastName: 'User',
        passwordHash: await hashPassword('OtherPassword123!')
      });

      const otherAccessToken = generateAccessToken({
        userId: otherUser.id,
        email: otherUser.email
      });

      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/pdf`)
        .set('Authorization', `Bearer ${otherAccessToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Unauthorized');

      // Clean up
      await db('users').where('id', otherUser.id).delete();
    });

    test('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/pdf`);

      expect(response.status).toBe(401);
    });

    test('PDF should include invoice details', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/pdf`)
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      
      // PDF is binary, but we can check for basic structure
      const pdfString = response.body.toString('utf8', 0, 100);
      expect(pdfString).toContain('%PDF'); // PDF signature
    });
  });

  describe('POST /api/invoices/:id/send', () => {
    test('should send invoice email with valid recipient', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/send`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          recipientEmail: 'recipient@test.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.recipientEmail).toBe('recipient@test.com');
      expect(response.body.data.invoiceId).toBe(testInvoice.id);
    });

    test('should return 400 for invalid email', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/send`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          recipientEmail: 'invalid-email'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 400 for missing email', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/send`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should return 404 for non-existent invoice', async () => {
      const response = await request(app)
        .post('/api/invoices/00000000-0000-0000-0000-000000000000/send')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          recipientEmail: 'test@test.com'
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });

    test('should return 403 for unauthorized user', async () => {
      // Create another user
      const otherUser = await User.create({
        email: 'other@test.com',
        firstName: 'Other',
        lastName: 'User',
        passwordHash: await hashPassword('OtherPassword123!')
      });

      const otherAccessToken = generateAccessToken({
        userId: otherUser.id,
        email: otherUser.email
      });

      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/send`)
        .set('Authorization', `Bearer ${otherAccessToken}`)
        .send({
          recipientEmail: 'recipient@test.com'
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);

      // Clean up
      await db('users').where('id', otherUser.id).delete();
    });

    test('should return 401 if not authenticated', async () => {
      const response = await request(app)
        .post(`/api/invoices/${testInvoice.id}/send`)
        .send({
          recipientEmail: 'test@test.com'
        });

      expect(response.status).toBe(401);
    });
  });
});
