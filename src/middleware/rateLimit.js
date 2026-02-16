/**
 * Rate Limiting Middleware
 * 
 * Implements rate limiting for API endpoints
 */

import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for registration endpoint
 * 
 * Max 5 attempts per minute per IP
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many registration attempts. Please try again later.',
    details: 'Maximum 5 attempts per minute'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for non-registration requests
    return req.path !== '/api/auth/register';
  }
});

/**
 * Rate limiter for login endpoint
 * 
 * Max 10 attempts per 15 minutes per IP
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests per 15 minutes
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many login attempts. Please try again later.',
    details: 'Maximum 10 attempts per 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for non-login requests
    return req.path !== '/api/auth/login';
  }
});

/**
 * Rate limiter for password reset endpoint
 * 
 * Max 3 attempts per 1 hour per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many password reset requests. Please try again later.',
    details: 'Maximum 3 attempts per hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for non-password-reset requests
    return req.path !== '/api/auth/reset-password';
  }
});

/**
 * General API rate limiter
 * 
 * Max 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests. Please try again later.',
    details: 'Maximum 100 requests per 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});
