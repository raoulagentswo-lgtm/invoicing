/**
 * User Model
 * 
 * Handles all database operations for the User entity
 * Story: EPIC-5-001 - User Registration
 */

import db from '../database/db.js';

const TABLE_NAME = 'users';

class User {
  /**
   * Create a new user
   * 
   * @param {Object} userData - User data
   * @param {string} userData.email - User email (unique)
   * @param {string} userData.firstName - User first name
   * @param {string} userData.lastName - User last name
   * @param {string} userData.passwordHash - Hashed password (bcrypt)
   * @returns {Promise<Object>} Created user object
   */
  static async create(userData) {
    const user = {
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      password_hash: userData.passwordHash,
      email_verified: false,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    const [createdUser] = await db(TABLE_NAME).insert(user).returning('*');

    return this.formatUserResponse(createdUser);
  }

  /**
   * Find user by email
   * 
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmail(email) {
    const user = await db(TABLE_NAME)
      .where('email', email.toLowerCase())
      .where('status', '!=', 'deleted')
      .first();

    return user ? this.formatUserResponse(user) : null;
  }

  /**
   * Find user by ID
   * 
   * @param {string} userId - User ID (UUID)
   * @returns {Promise<Object|null>} User object or null
   */
  static async findById(userId) {
    const user = await db(TABLE_NAME)
      .where('id', userId)
      .where('status', '!=', 'deleted')
      .first();

    return user ? this.formatUserResponse(user) : null;
  }

  /**
   * Update user
   * 
   * @param {string} userId - User ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated user object
   */
  static async update(userId, updateData) {
    const cleanData = {};
    
    if (updateData.email) cleanData.email = updateData.email.toLowerCase();
    if (updateData.firstName) cleanData.first_name = updateData.firstName;
    if (updateData.lastName) cleanData.last_name = updateData.lastName;
    if (updateData.passwordHash) cleanData.password_hash = updateData.passwordHash;
    if (updateData.emailVerified !== undefined) cleanData.email_verified = updateData.emailVerified;
    if (updateData.emailVerifiedAt) cleanData.email_verified_at = updateData.emailVerifiedAt;
    if (updateData.companyName !== undefined) cleanData.company_name = updateData.companyName;
    if (updateData.siret !== undefined) cleanData.siret = updateData.siret;
    if (updateData.logoUrl !== undefined) cleanData.logo_url = updateData.logoUrl;
    if (updateData.phone !== undefined) cleanData.company_phone = updateData.phone;
    if (updateData.bankName !== undefined) cleanData.bank_name = updateData.bankName;
    if (updateData.iban !== undefined) cleanData.iban = updateData.iban;
    if (updateData.bic !== undefined) cleanData.bic = updateData.bic;

    cleanData.updated_at = new Date();

    await db(TABLE_NAME)
      .where('id', userId)
      .update(cleanData);

    return this.findById(userId);
  }

  /**
   * Verify email
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated user object
   */
  static async verifyEmail(userId) {
    await db(TABLE_NAME)
      .where('id', userId)
      .update({
        email_verified: true,
        email_verified_at: new Date(),
        email_verification_token: null,
        verification_token_expires_at: null,
        updated_at: new Date()
      });

    return this.findById(userId);
  }

  /**
   * Set email verification token
   * 
   * @param {string} userId - User ID
   * @param {string} token - Verification token
   * @param {number} expiryHours - Token expiry hours
   * @returns {Promise<void>}
   */
  static async setEmailVerificationToken(userId, token, expiryHours = 24) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);

    await db(TABLE_NAME)
      .where('id', userId)
      .update({
        email_verification_token: token,
        verification_token_expires_at: expiryDate,
        updated_at: new Date()
      });
  }

  /**
   * Find user by email verification token
   * 
   * @param {string} token - Verification token
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByEmailVerificationToken(token) {
    const user = await db(TABLE_NAME)
      .where('email_verification_token', token)
      .where('verification_token_expires_at', '>', new Date())
      .first();

    return user ? this.formatUserResponse(user) : null;
  }

  /**
   * Set password reset token
   * 
   * @param {string} userId - User ID
   * @param {string} token - Reset token
   * @param {number} expiryHours - Token expiry hours
   * @returns {Promise<void>}
   */
  static async setPasswordResetToken(userId, token, expiryHours = 24) {
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + expiryHours);

    await db(TABLE_NAME)
      .where('id', userId)
      .update({
        password_reset_token: token,
        password_reset_expires_at: expiryDate,
        updated_at: new Date()
      });
  }

  /**
   * Find user by password reset token
   * 
   * @param {string} token - Reset token
   * @returns {Promise<Object|null>} User object or null
   */
  static async findByPasswordResetToken(token) {
    const user = await db(TABLE_NAME)
      .where('password_reset_token', token)
      .where('password_reset_expires_at', '>', new Date())
      .first();

    return user ? this.formatUserResponse(user) : null;
  }

  /**
   * Clear password reset token
   * 
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async clearPasswordResetToken(userId) {
    await db(TABLE_NAME)
      .where('id', userId)
      .update({
        password_reset_token: null,
        password_reset_expires_at: null,
        updated_at: new Date()
      });
  }

  /**
   * Update failed login attempts and lock account if needed
   * 
   * @param {string} email - User email
   * @param {number} maxAttempts - Max failed attempts before lock
   * @param {number} lockoutMinutes - Minutes to lock account
   * @returns {Promise<Object>} Updated user object
   */
  static async recordFailedLogin(email, maxAttempts = 5, lockoutMinutes = 15) {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const attempts = (user.failed_login_attempts || 0) + 1;
    const updateData = {
      failed_login_attempts: attempts,
      last_failed_login_at: new Date(),
      updated_at: new Date()
    };

    if (attempts >= maxAttempts) {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + lockoutMinutes);
      updateData.locked_until = lockedUntil;
    }

    await db(TABLE_NAME)
      .where('id', user.id)
      .update(updateData);

    return this.findById(user.id);
  }

  /**
   * Clear failed login attempts
   * 
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  static async clearFailedLoginAttempts(userId) {
    await db(TABLE_NAME)
      .where('id', userId)
      .update({
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date(),
        updated_at: new Date()
      });
  }

  /**
   * Check if user account is locked
   * 
   * @param {string} email - User email
   * @returns {Promise<boolean>} True if account is locked
   */
  static async isAccountLocked(email) {
    const user = await db(TABLE_NAME)
      .where('email', email.toLowerCase())
      .where('status', '!=', 'deleted')
      .first();

    if (!user) return false;

    if (user.locked_until && user.locked_until > new Date()) {
      return true;
    }

    if (user.locked_until && user.locked_until <= new Date()) {
      await db(TABLE_NAME)
        .where('id', user.id)
        .update({
          locked_until: null,
          failed_login_attempts: 0,
          updated_at: new Date()
        });
    }

    return false;
  }

  /**
   * Check if email exists
   * 
   * @param {string} email - Email to check
   * @param {string} excludeUserId - User ID to exclude (for updates)
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExists(email, excludeUserId = null) {
    let query = db(TABLE_NAME)
      .where('email', email.toLowerCase())
      .where('status', '!=', 'deleted');

    if (excludeUserId) {
      query = query.where('id', '!=', excludeUserId);
    }

    const user = await query.first();
    return !!user;
  }

  /**
   * Check if SIRET exists
   * 
   * @param {string} siret - SIRET to check
   * @param {string} excludeUserId - User ID to exclude (for updates)
   * @returns {Promise<boolean>} True if SIRET exists
   */
  static async siretExists(siret, excludeUserId = null) {
    let query = db(TABLE_NAME)
      .where('siret', siret)
      .where('status', '!=', 'deleted');

    if (excludeUserId) {
      query = query.where('id', '!=', excludeUserId);
    }

    const user = await query.first();
    return !!user;
  }

  /**
   * Format user response (remove sensitive data)
   * 
   * @param {Object} user - Raw user object from database
   * @returns {Object} Formatted user object
   */
  static formatUserResponse(user) {
    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      emailVerified: user.email_verified,
      companyName: user.company_name,
      siret: user.siret,
      phone: user.company_phone,
      logoUrl: user.logo_url,
      bankName: user.bank_name,
      iban: user.iban,
      bic: user.bic,
      status: user.status,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at
    };
  }
}

export default User;
