/**
 * User Model Unit Tests
 * 
 * Tests for User model database operations
 */

import User from '../../../src/models/user.js';
import db from '../../../src/database/db.js';

describe('User Model', () => {
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

  describe('create', () => {
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      const user = await User.create(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.firstName).toBe('John');
      expect(user.lastName).toBe('Doe');
      expect(user.id).toBeDefined();
      expect(user.emailVerified).toBe(false);
    });

    it('should not include password_hash in response', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      const user = await User.create(userData);

      expect(user.password_hash).toBeUndefined();
      expect(user.passwordHash).toBeUndefined();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      await User.create(userData);
      const user = await User.findByEmail('test@example.com');

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should return null for non-existent email', async () => {
      const user = await User.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });

    it('should handle email case-insensitivity', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      await User.create(userData);
      const user = await User.findByEmail('TEST@EXAMPLE.COM');

      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });
  });

  describe('findById', () => {
    it('should find user by ID', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      const createdUser = await User.create(userData);
      const user = await User.findById(createdUser.id);

      expect(user).toBeDefined();
      expect(user.id).toBe(createdUser.id);
    });

    it('should return null for non-existent ID', async () => {
      const user = await User.findById('00000000-0000-0000-0000-000000000000');

      expect(user).toBeNull();
    });
  });

  describe('emailExists', () => {
    it('should return true if email exists', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      await User.create(userData);
      const exists = await User.emailExists('test@example.com');

      expect(exists).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      const exists = await User.emailExists('nonexistent@example.com');

      expect(exists).toBe(false);
    });

    it('should exclude specified user when checking', async () => {
      const userData1 = {
        email: 'test1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      const userData2 = {
        email: 'test2@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      const user1 = await User.create(userData1);
      await User.create(userData2);

      const exists = await User.emailExists('test1@example.com', user1.id);

      expect(exists).toBe(false);
    });
  });

  describe('verifyEmail', () => {
    it('should verify user email', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      const user = await User.create(userData);
      expect(user.emailVerified).toBe(false);

      const verifiedUser = await User.verifyEmail(user.id);

      expect(verifiedUser.emailVerified).toBe(true);
      expect(verifiedUser.emailVerifiedAt).toBeDefined();
    });
  });

  describe('setPasswordResetToken', () => {
    it('should set password reset token', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      const user = await User.create(userData);
      const token = 'reset_token_12345';

      await User.setPasswordResetToken(user.id, token, 24);

      const updatedUser = await User.findById(user.id);
      // Note: We can't see the token in the returned user object for security
      // but we can verify it was set by checking the raw DB
      const dbUser = await db('users').where('id', user.id).first();
      expect(dbUser.password_reset_token).toBe(token);
    });
  });

  describe('recordFailedLogin', () => {
    it('should record failed login attempt', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      await User.create(userData);

      const updatedUser = await User.recordFailedLogin('test@example.com');

      expect(updatedUser).toBeDefined();
      const dbUser = await db('users').where('id', updatedUser.id).first();
      expect(dbUser.failed_login_attempts).toBe(1);
    });

    it('should lock account after max failed attempts', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      await User.create(userData);

      // Record 5 failed attempts
      for (let i = 0; i < 5; i++) {
        await User.recordFailedLogin('test@example.com', 5, 15);
      }

      const dbUser = await db('users').where('email', 'test@example.com').first();
      expect(dbUser.locked_until).toBeDefined();
      expect(dbUser.locked_until > new Date()).toBe(true);
    });
  });

  describe('clearFailedLoginAttempts', () => {
    it('should clear failed login attempts', async () => {
      const userData = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        passwordHash: '$2b$12$hashed_password'
      };

      const user = await User.create(userData);

      // Record failed attempts
      for (let i = 0; i < 3; i++) {
        await User.recordFailedLogin('test@example.com');
      }

      let dbUser = await db('users').where('id', user.id).first();
      expect(dbUser.failed_login_attempts).toBe(3);

      // Clear failed attempts
      await User.clearFailedLoginAttempts(user.id);

      dbUser = await db('users').where('id', user.id).first();
      expect(dbUser.failed_login_attempts).toBe(0);
      expect(dbUser.locked_until).toBeNull();
    });
  });
});
