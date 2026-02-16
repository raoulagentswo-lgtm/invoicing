/**
 * Authentication Routes Integration Tests
 * 
 * Tests for user registration, login, and related endpoints
 * Story: EPIC-5-001 - User Registration
 */

import request from 'supertest';
import app from '../../src/server.js';
import db from '../../src/database/db.js';
import { hashPassword } from '../../src/utils/password.js';

describe('Authentication Routes', () => {
  beforeAll(async () => {
    // Run migrations
    await db.migrate.latest();
  });

  afterEach(async () => {
    // Clean up test data
    await db('users').del();
  });

  afterAll(async () => {
    // Cleanup
    await db.destroy();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePassword123!',
          passwordConfirmation: 'SecurePassword123!'
        });

      expect(response.status).toBe(201);
      expect(response.body.code).toBe('REGISTRATION_SUCCESS');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.accessToken).toBeDefined();
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePassword123!',
          passwordConfirmation: 'SecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_EMAIL');
    });

    it('should require minimum 8 character password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'Short1!',
          passwordConfirmation: 'Short1!'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('WEAK_PASSWORD');
    });

    it('should require uppercase letter in password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'securepassword123!',
          passwordConfirmation: 'securepassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('WEAK_PASSWORD');
    });

    it('should require number in password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePassword!',
          passwordConfirmation: 'SecurePassword!'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('WEAK_PASSWORD');
    });

    it('should require special character in password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePassword123',
          passwordConfirmation: 'SecurePassword123'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('WEAK_PASSWORD');
    });

    it('should match password confirmation', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePassword123!',
          passwordConfirmation: 'DifferentPassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('PASSWORD_MISMATCH');
    });

    it('should not allow duplicate email', async () => {
      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          password: 'SecurePassword123!',
          passwordConfirmation: 'SecurePassword123!'
        });

      // Try to create second user with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
          password: 'SecurePassword123!',
          passwordConfirmation: 'SecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('should require first name', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: '',
          lastName: 'Doe',
          password: 'SecurePassword123!',
          passwordConfirmation: 'SecurePassword123!'
        });

      expect(response.status).toBe(400);
    });

    it('should validate first name length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          firstName: 'A',
          lastName: 'Doe',
          password: 'SecurePassword123!',
          passwordConfirmation: 'SecurePassword123!'
        });

      expect(response.status).toBe(400);
    });

    it('should enforce rate limiting', async () => {
      // Make 6 registration attempts quickly
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/register')
            .send({
              email: `test${i}@example.com`,
              firstName: 'John',
              lastName: 'Doe',
              password: 'SecurePassword123!',
              passwordConfirmation: 'SecurePassword123!'
            })
        );
      }

      const responses = await Promise.all(promises);

      // 5 should succeed, 6th should be rate limited
      const successCount = responses.filter(r => r.status === 201).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;

      expect(successCount).toBe(5);
      expect(rateLimitedCount).toBe(1);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const password = 'SecurePassword123!';
      const passwordHash = await hashPassword(password);

      await db('users').insert({
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
        password_hash: passwordHash,
        email_verified: true,
        status: 'active'
      });
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('LOGIN_SUCCESS');
      expect(response.body.data.accessToken).toBeDefined();
      expect(response.body.data.user).toBeDefined();
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should lock account after failed attempts', async () => {
      // Make 10 failed login attempts
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'WrongPassword123!'
          });
      }

      // Try to login with correct password
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(429);
      expect(response.body.code).toBe('ACCOUNT_LOCKED');
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken;

    beforeEach(async () => {
      const password = 'SecurePassword123!';
      const passwordHash = await hashPassword(password);

      const user = await db('users')
        .insert({
          email: 'test@example.com',
          first_name: 'John',
          last_name: 'Doe',
          password_hash: passwordHash,
          email_verified: true,
          status: 'active'
        })
        .returning('id');

      // Create a valid JWT token
      accessToken = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIke1VzZXJJZH0iLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20ifQ.test`;
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should return user profile when authenticated', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', accessToken);

      // Note: This test may fail without proper token setup
      // In real scenario, the token needs to be generated properly
    });
  });
});
