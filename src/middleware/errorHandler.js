/**
 * Error Handler Middleware
 * 
 * Centralized error handling for Express
 */

import { z } from 'zod';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, code, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

/**
 * Error handler middleware
 * 
 * Should be registered after all other middleware and routes
 * 
 * @param {Error} error - Error object
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next
 */
export function errorHandler(error, req, res, next) {
  console.error('Error:', {
    name: error.name,
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Zod validation errors
  if (error instanceof z.ZodError) {
    const fieldErrors = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      fieldErrors[path] = err.message;
    });

    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: fieldErrors
    });
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      code: error.code,
      message: error.message,
      details: error.details
    });
  }

  // Database errors
  if (error.code === '23505') {
    // Unique constraint violation
    const field = error.constraint?.match(/unique_(.*?)_idx|uk_(.*)/)?.[1] || 'field';
    return res.status(400).json({
      code: 'UNIQUE_CONSTRAINT_VIOLATION',
      message: `${field} already exists`,
      details: `A record with this ${field} already exists`
    });
  }

  if (error.code === '23502') {
    // Not null constraint violation
    return res.status(400).json({
      code: 'NOT_NULL_CONSTRAINT_VIOLATION',
      message: 'Required field is missing',
      details: 'Please provide all required fields'
    });
  }

  // Default error response
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    code,
    message,
    details: process.env.NODE_ENV === 'development' ? error.stack : null
  });
}

/**
 * 404 Not Found middleware
 * 
 * Should be registered after all routes
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: 'Endpoint not found',
    details: `${req.method} ${req.path}`
  });
}
