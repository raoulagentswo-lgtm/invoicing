/**
 * Authentication Middleware
 * 
 * Handles JWT verification and user authentication
 */

import { verifyAccessToken } from '../utils/jwt.js';

/**
 * Require authentication middleware
 * 
 * Verifies JWT token from Authorization header
 * Sets req.user if token is valid
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'No token provided. Use Bearer <token> in Authorization header',
        details: null
      });
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
        details: error.message
      });
    }
  } catch (error) {
    return res.status(500).json({
      code: 'AUTH_ERROR',
      message: 'Authentication error',
      details: error.message
    });
  }
}

/**
 * Optional authentication middleware
 * 
 * Verifies JWT token if provided, but doesn't require it
 * Sets req.user if token is valid and present
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    
    try {
      const decoded = verifyAccessToken(token);
      req.user = decoded;
    } catch (error) {
      // Token invalid, but optional auth so continue
      console.warn('Optional auth: Invalid token', error.message);
    }
    
    next();
  } catch (error) {
    return res.status(500).json({
      code: 'AUTH_ERROR',
      message: 'Authentication error',
      details: error.message
    });
  }
}

/**
 * Get current user from request
 * 
 * @param {Object} req - Express request
 * @returns {Object|null} User object or null
 */
export function getCurrentUser(req) {
  return req.user || null;
}

/**
 * Get current user ID from request
 * 
 * @param {Object} req - Express request
 * @returns {string|null} User ID or null
 */
export function getCurrentUserId(req) {
  return req.user?.userId || req.user?.id || null;
}
