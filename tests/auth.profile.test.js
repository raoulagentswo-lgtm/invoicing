/**
 * Authentication API Tests - Profile Endpoints
 * 
 * Tests for GET /api/auth/me and PUT /api/auth/profile
 * Story: EPIC-5-004/005 - User Profile (View & Update)
 */

import request from 'supertest';
import app from '../src/server.js';
import User from '../src/models/user.js';
import db from '../src/database/db.js';
import { generateAccessToken } from '../src/utils/jwt.js';
import { hashPassword } from '../src/utils/password.js';

describe('Authentication - Profile Endpoints', () => {
  let testUser;
  let accessToken;
  const testEmail = 'profile@test.com';
  const testPassword = 'TestPassword123!';

  beforeAll(async () => {
    // Clean up before tests
    await db('users').delete();
  });

  afterAll(async () => {
    // Clean up after tests
    await db('users').delete();
  });

  beforeEach(async () => {
    // Create a test user before each test
    const passwordHash = await hashPassword(testPassword);
    testUser = await User.create({
      email: testEmail,
      firstName: 'John',
      lastName: 'Doe',
      passwordHash
    });

    // Generate access token
    accessToken = generateAccessToken({
      userId: testUser.id,
      email: testUser.email
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await db('users').delete();
  });

  describe('GET /api/auth/me - Fetch user profile', () => {
    it('should fetch user profile successfully with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('PROFILE_FETCHED');
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.id).toBe(testUser.id);
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.firstName).toBe('John');
      expect(res.body.data.user.lastName).toBe('Doe');
    });

    it('should return 401 without authorization header', async () => {
      const res = await request(app)
        .get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('should return 404 for non-existent user', async () => {
      const fakeToken = generateAccessToken({
        userId: '00000000-0000-0000-0000-000000000000',
        email: 'fake@test.com'
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${fakeToken}`);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('PUT /api/auth/profile - Update user profile', () => {
    it('should update first name successfully', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Johnny'
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('PROFILE_UPDATED');
      expect(res.body.data.user.firstName).toBe('Johnny');
      expect(res.body.data.user.lastName).toBe('Doe'); // Unchanged
    });

    it('should update last name successfully', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          lastName: 'Smith'
        });

      expect(res.status).toBe(200);
      expect(res.body.code).toBe('PROFILE_UPDATED');
      expect(res.body.data.user.lastName).toBe('Smith');
    });

    it('should update company information successfully', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          companyName: 'ACME Corp',
          siret: '12345678901234',
          phone: '+33123456789'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.companyName).toBe('ACME Corp');
      expect(res.body.data.user.siret).toBe('12345678901234');
      expect(res.body.data.user.phone).toBe('+33123456789');
    });

    it('should reject invalid first name (too short)', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'J'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.data.fields.firstName).toBeDefined();
    });

    it('should reject invalid last name (too long)', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          lastName: 'A'.repeat(101)
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.data.fields.lastName).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: 'invalid-email'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.data.fields.email).toBeDefined();
    });

    it('should reject email already in use', async () => {
      // Create another user
      const anotherEmail = 'another@test.com';
      const passwordHash = await hashPassword(testPassword);
      await User.create({
        email: anotherEmail,
        firstName: 'Jane',
        lastName: 'Doe',
        passwordHash
      });

      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: anotherEmail
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should generate verification token when email changes', async () => {
      const newEmail = 'newemail@test.com';
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          email: newEmail
        });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('Please check your email');

      // Verify token was set
      const updatedUser = await db('users').where('id', testUser.id).first();
      expect(updatedUser.email_verification_token).toBeDefined();
      expect(updatedUser.verification_token_expires_at).toBeDefined();
    });

    it('should reject invalid SIRET format', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          siret: 'invalid'
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.data.fields.siret).toBeDefined();
    });

    it('should reject SIRET already in use', async () => {
      const siret = '12345678901234';

      // First, update current user with SIRET
      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ siret });

      // Create another user
      const anotherEmail = 'another@test.com';
      const passwordHash = await hashPassword(testPassword);
      const anotherUser = await User.create({
        email: anotherEmail,
        firstName: 'Jane',
        lastName: 'Doe',
        passwordHash
      });

      const anotherToken = generateAccessToken({
        userId: anotherUser.id,
        email: anotherUser.email
      });

      // Try to use same SIRET
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${anotherToken}`)
        .send({ siret });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SIRET_ALREADY_EXISTS');
    });

    it('should reject invalid phone number', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          phone: '123' // Too short
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
      expect(res.body.data.fields.phone).toBeDefined();
    });

    it('should allow clearing optional fields', async () => {
      // First set company info
      await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          companyName: 'ACME Corp',
          siret: '12345678901234',
          phone: '+33123456789'
        });

      // Then clear them
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          companyName: null,
          siret: null,
          phone: null
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.companyName).toBeNull();
      expect(res.body.data.user.siret).toBeNull();
      expect(res.body.data.user.phone).toBeNull();
    });

    it('should return 400 when no fields to update', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('NO_UPDATE_DATA');
    });

    it('should return 401 without authorization', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .send({
          firstName: 'Jane'
        });

      expect(res.status).toBe(401);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('should update multiple fields at once', async () => {
      const res = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          companyName: 'Tech Solutions',
          siret: '98765432109876',
          phone: '+33987654321'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.firstName).toBe('Jane');
      expect(res.body.data.user.lastName).toBe('Smith');
      expect(res.body.data.user.companyName).toBe('Tech Solutions');
      expect(res.body.data.user.siret).toBe('98765432109876');
      expect(res.body.data.user.phone).toBe('+33987654321');
    });
  });
});
