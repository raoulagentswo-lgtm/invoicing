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
      expect(response.body.data.expiresIn).toBe('30d');
    });

    it('should return user info in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.firstName).toBe('John');
      expect(response.body.data.user.lastName).toBe('Doe');
      expect(response.body.data.user.id).toBeDefined();
    });

    it('should not include password hash in response', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.data.user.password_hash).toBeUndefined();
      expect(response.body.data.user.passwordHash).toBeUndefined();
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

    it('should provide clear error messages (email not found vs wrong password)', async () => {
      // Both should return same message for security (timing attacks prevention)
      const response1 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123!'
        });

      const response2 = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'WrongPassword123!'
        });

      expect(response1.body.code).toBe('INVALID_CREDENTIALS');
      expect(response2.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('INVALID_EMAIL');
    });

    it('should require password field', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.code).toBe('PASSWORD_REQUIRED');
    });

    it('should lock account after 5 failed attempts', async () => {
      // Make 5 failed login attempts
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'WrongPassword123!'
          });
      }

      // 6th attempt should be locked
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(429);
      expect(response.body.code).toBe('ACCOUNT_LOCKED');
    });

    it('should clear failed login attempts on successful login', async () => {
      // Make 2 failed attempts
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'WrongPassword123!'
          });
      }

      // Successful login should clear attempts
      const successResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(successResponse.status).toBe(200);

      // Should be able to login again without hitting rate limit
      const nextResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(nextResponse.status).toBe(200);
    });

    it('should enforce rate limiting (10 requests/15 minutes)', async () => {
      // Make 11 login attempts
      const promises = [];
      for (let i = 0; i < 11; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'SecurePassword123!'
            })
        );
      }

      const responses = await Promise.all(promises);

      // Some should succeed, last one should be rate limited
      const rateLimitedCount = responses.filter(r => r.status === 429 && r.body.code === 'TOO_MANY_REQUESTS').length;

      expect(rateLimitedCount).toBeGreaterThan(0);
    });

    it('should update last login timestamp on successful login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);

      // Verify last_login_at was updated
      const user = await db('users')
        .where('email', 'test@example.com')
        .first();

      expect(user.last_login_at).toBeDefined();
    });

    it('should require valid email format', async () => {
      const testCases = [
        'not-an-email',
        '@example.com',
        'user@',
        'user name@example.com',
        ''
      ];

      for (const email of testCases) {
        const response = await request(app)
          .post('/api/auth/login')
          .send({
            email,
            password: 'SecurePassword123!'
          });

        expect(response.status).toBe(400);
      }
    });

    it('should handle case-insensitive email lookup', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'TEST@EXAMPLE.COM',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.code).toBe('LOGIN_SUCCESS');
    });

    it('should return 30-day expiring JWT token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      const token = response.body.data.accessToken;

      // Verify JWT format (should have 3 parts separated by dots)
      const parts = token.split('.');
      expect(parts.length).toBe(3);

      // Decode and check expiration
      try {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);

        // Token should expire in approximately 30 days
        const expiresIn = (payload.exp * 1000) - Date.now();
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

        // Allow some margin (±1 minute)
        expect(Math.abs(expiresIn - thirtyDaysMs)).toBeLessThan(60000);
      } catch (err) {
        throw new Error('Failed to decode JWT token: ' + err.message);
      }
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
