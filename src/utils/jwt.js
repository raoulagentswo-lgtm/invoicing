/**
 * JWT Utility Functions
 * 
 * Handles JWT token creation and verification
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const { JWT_SECRET, JWT_EXPIRY = '30d' } = process.env;

if (!JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set in environment. Using default (INSECURE FOR PRODUCTION)');
}

/**
 * Generate a JWT access token
 * 
 * @param {Object} payload - Token payload
 * @param {string} expiresIn - Token expiry (e.g., '30d', '24h')
 * @returns {string} JWT token
 */
export function generateAccessToken(payload, expiresIn = JWT_EXPIRY) {
  return jwt.sign(payload, JWT_SECRET || 'default-secret-change-me', {
    expiresIn,
    algorithm: 'HS256'
  });
}

/**
 * Verify a JWT access token
 * 
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET || 'default-secret-change-me', {
      algorithms: ['HS256']
    });
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
}

/**
 * Decode a JWT token without verification (use with caution)
 * 
 * @param {string} token - JWT token
 * @returns {Object} Decoded payload
 */
export function decodeAccessToken(token) {
  return jwt.decode(token);
}

/**
 * Generate a random verification token
 * 
 * @returns {string} Random token
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random password reset token
 * 
   * @returns {string} Random token
 */
export function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if token is expired
 * 
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export function isTokenExpired(token) {
  try {
    const decoded = decodeAccessToken(token);
    if (!decoded || !decoded.exp) return true;
    
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch {
    return true;
  }
}
