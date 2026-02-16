/**
 * Authentication Routes
 * 
 * Handles user registration, login, and password reset
 * Story: EPIC-5-001 - User Registration
 */

import express from 'express';
import { z } from 'zod';
import User from '../models/user.js';
import {
  hashPassword,
  comparePasswords,
  validatePasswordStrength
} from '../utils/password.js';
import {
  generateAccessToken,
  generateVerificationToken,
  generatePasswordResetToken,
  verifyAccessToken
} from '../utils/jwt.js';
import {
  isValidEmail,
  isValidString,
  sanitizeEmail,
  sanitizeString,
  validateName
} from '../utils/validators.js';
import { ApiError } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import {
  registrationLimiter,
  loginLimiter,
  passwordResetLimiter
} from '../middleware/rateLimit.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 * @limiter 5 requests per minute
 */
router.post('/register', registrationLimiter, async (req, res, next) => {
  try {
    const { email, firstName, lastName, password, passwordConfirmation } = req.body;

    // Validation: Email
    const emailSanitized = sanitizeEmail(email || '');
    if (!isValidEmail(emailSanitized)) {
      throw new ApiError(400, 'INVALID_EMAIL', 'Invalid email format');
    }

    // Validation: Names
    const firstNameSanitized = sanitizeString(firstName || '');
    const lastNameSanitized = sanitizeString(lastName || '');

    const firstNameValidation = validateName(firstNameSanitized);
    if (!firstNameValidation.isValid) {
      throw new ApiError(400, 'INVALID_FIRST_NAME', firstNameValidation.errors[0], {
        field: 'firstName',
        errors: firstNameValidation.errors
      });
    }

    const lastNameValidation = validateName(lastNameSanitized);
    if (!lastNameValidation.isValid) {
      throw new ApiError(400, 'INVALID_LAST_NAME', lastNameValidation.errors[0], {
        field: 'lastName',
        errors: lastNameValidation.errors
      });
    }

    // Validation: Password
    if (!password) {
      throw new ApiError(400, 'PASSWORD_REQUIRED', 'Password is required');
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new ApiError(400, 'WEAK_PASSWORD', 'Password does not meet requirements', {
        errors: passwordValidation.errors
      });
    }

    // Validation: Password confirmation
    if (password !== passwordConfirmation) {
      throw new ApiError(400, 'PASSWORD_MISMATCH', 'Passwords do not match', {
        field: 'passwordConfirmation'
      });
    }

    // Check if email already exists
    const emailExists = await User.emailExists(emailSanitized);
    if (emailExists) {
      throw new ApiError(400, 'EMAIL_ALREADY_EXISTS', 'Email already registered', {
        field: 'email'
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create({
      email: emailSanitized,
      firstName: firstNameSanitized,
      lastName: lastNameSanitized,
      passwordHash
    });

    // Generate email verification token
    const verificationToken = generateVerificationToken();
    await User.setEmailVerificationToken(user.id, verificationToken);

    // Generate JWT token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    });

    // TODO: Send verification email with token link
    // const verificationLink = `${process.env.API_URL}/verify-email?token=${verificationToken}`;
    // await sendVerificationEmail(user.email, verificationLink);

    res.status(201).json({
      code: 'REGISTRATION_SUCCESS',
      message: 'User registered successfully. Please verify your email.',
      data: {
        user,
        accessToken,
        expiresIn: '30d'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user with email and password
 * @access  Public
 * @limiter 10 requests per 15 minutes
 */
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    const emailSanitized = sanitizeEmail(email || '');
    if (!isValidEmail(emailSanitized)) {
      throw new ApiError(400, 'INVALID_EMAIL', 'Invalid email format');
    }

    if (!password || !isValidString(password, 1)) {
      throw new ApiError(400, 'PASSWORD_REQUIRED', 'Password is required');
    }

    // Check if account is locked
    const isLocked = await User.isAccountLocked(emailSanitized);
    if (isLocked) {
      throw new ApiError(429, 'ACCOUNT_LOCKED', 'Account temporarily locked due to multiple failed login attempts. Please try again later.', {
        field: 'email'
      });
    }

    // Find user by email
    const user = await User.findByEmail(emailSanitized);
    if (!user) {
      // Record failed login attempt
      await User.recordFailedLogin(emailSanitized);
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Verify password
    const passwordMatches = await comparePasswords(password, user.password_hash);
    if (!passwordMatches) {
      // Record failed login attempt
      await User.recordFailedLogin(emailSanitized);
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    // Clear failed login attempts
    await User.clearFailedLoginAttempts(user.id);

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email
    });

    res.json({
      code: 'LOGIN_SUCCESS',
      message: 'Login successful',
      data: {
        user,
        accessToken,
        expiresIn: '30d'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify user email with token
 * @access  Public
 */
router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new ApiError(400, 'TOKEN_REQUIRED', 'Verification token is required');
    }

    // Find user by email verification token
    const user = await User.findByEmailVerificationToken(token);
    if (!user) {
      throw new ApiError(400, 'INVALID_TOKEN', 'Invalid or expired verification token');
    }

    // Verify email
    const verifiedUser = await User.verifyEmail(user.id);

    res.json({
      code: 'EMAIL_VERIFIED',
      message: 'Email verified successfully',
      data: {
        user: verifiedUser
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (token-based, mostly client-side)
 * @access  Private
 */
router.post('/logout', requireAuth, async (req, res, next) => {
  try {
    res.json({
      code: 'LOGOUT_SUCCESS',
      message: 'Logout successful'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Private
 */
router.post('/refresh', requireAuth, async (req, res, next) => {
  try {
    const user = req.user;

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.userId,
      email: user.email
    });

    res.json({
      code: 'TOKEN_REFRESHED',
      message: 'Token refreshed successfully',
      data: {
        accessToken,
        expiresIn: '30d'
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Request password reset (send email with token)
 * @access  Public
 * @limiter 3 requests per hour
 */
router.post('/reset-password', passwordResetLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;

    const emailSanitized = sanitizeEmail(email || '');
    if (!isValidEmail(emailSanitized)) {
      throw new ApiError(400, 'INVALID_EMAIL', 'Invalid email format');
    }

    // Find user by email
    const user = await User.findByEmail(emailSanitized);
    if (!user) {
      // Don't reveal if email exists (security)
      throw new ApiError(404, 'USER_NOT_FOUND', 'User not found with this email');
    }

    // Generate password reset token
    const resetToken = generatePasswordResetToken();
    await User.setPasswordResetToken(user.id, resetToken);

    // TODO: Send password reset email with token link
    // const resetLink = `${process.env.API_URL}/reset-password?token=${resetToken}`;
    // await sendPasswordResetEmail(user.email, resetLink);

    res.json({
      code: 'RESET_EMAIL_SENT',
      message: 'Password reset email sent. Please check your inbox.',
      data: {
        email: emailSanitized
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/auth/reset-password/confirm
 * @desc    Confirm password reset with token and new password
 * @access  Public
 */
router.post('/reset-password/confirm', async (req, res, next) => {
  try {
    const { token, password, passwordConfirmation } = req.body;

    if (!token) {
      throw new ApiError(400, 'TOKEN_REQUIRED', 'Reset token is required');
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      throw new ApiError(400, 'WEAK_PASSWORD', 'Password does not meet requirements', {
        errors: passwordValidation.errors
      });
    }

    // Validate password confirmation
    if (password !== passwordConfirmation) {
      throw new ApiError(400, 'PASSWORD_MISMATCH', 'Passwords do not match');
    }

    // Find user by reset token
    const user = await User.findByPasswordResetToken(token);
    if (!user) {
      throw new ApiError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(password);

    // Update password and clear reset token
    await User.update(user.id, {
      passwordHash: newPasswordHash
    });
    await User.clearPasswordResetToken(user.id);

    res.json({
      code: 'PASSWORD_RESET_SUCCESS',
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    res.json({
      code: 'PROFILE_FETCHED',
      message: 'User profile retrieved successfully',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
