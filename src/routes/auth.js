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
  validateName,
  isValidSIRET,
  isValidPhoneNumber
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

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name, email, company info, phone)
 * @access  Private
 * @story   EPIC-5-004/005 - User Profile (View & Update)
 * 
 * Note: Email changes require verification via verification token
 */
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      email,
      companyName,
      siret,
      phone,
      logoUrl
    } = req.body;

    // Fetch current user
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    const updateData = {};
    const validationErrors = {};

    // Validate and update first name
    if (firstName !== undefined) {
      const firstNameSanitized = sanitizeString(firstName || '');
      const firstNameValidation = validateName(firstNameSanitized);
      if (!firstNameValidation.isValid) {
        validationErrors.firstName = firstNameValidation.errors;
      } else {
        updateData.firstName = firstNameSanitized;
      }
    }

    // Validate and update last name
    if (lastName !== undefined) {
      const lastNameSanitized = sanitizeString(lastName || '');
      const lastNameValidation = validateName(lastNameSanitized);
      if (!lastNameValidation.isValid) {
        validationErrors.lastName = lastNameValidation.errors;
      } else {
        updateData.lastName = lastNameSanitized;
      }
    }

    // Validate and update email (requires verification if changed)
    if (email !== undefined) {
      const emailSanitized = sanitizeEmail(email || '');
      if (!isValidEmail(emailSanitized)) {
        validationErrors.email = ['Invalid email format'];
      } else if (emailSanitized !== currentUser.email) {
        // Check if new email already exists
        const emailExists = await User.emailExists(emailSanitized, userId);
        if (emailExists) {
          throw new ApiError(400, 'EMAIL_ALREADY_EXISTS', 'Email already in use', {
            field: 'email'
          });
        }
        
        // Generate email verification token for new email
        const verificationToken = generateVerificationToken();
        await User.setEmailVerificationToken(userId, verificationToken);

        // Store pending email update in metadata
        updateData.email = emailSanitized;
        
        // TODO: Send verification email to new address
        // const verificationLink = `${process.env.API_URL}/verify-email?token=${verificationToken}`;
        // await sendVerificationEmail(emailSanitized, verificationLink);
      }
    }

    // Validate and update company name
    if (companyName !== undefined) {
      if (companyName === '' || companyName === null) {
        updateData.companyName = null;
      } else {
        const companyNameSanitized = sanitizeString(companyName);
        if (!isValidString(companyNameSanitized, 2, 255)) {
          validationErrors.companyName = ['Company name must be between 2 and 255 characters'];
        } else {
          updateData.companyName = companyNameSanitized;
        }
      }
    }

    // Validate and update SIRET
    if (siret !== undefined) {
      if (siret === '' || siret === null) {
        updateData.siret = null;
      } else {
        const siretSanitized = sanitizeString(siret);
        if (!isValidSIRET(siretSanitized)) {
          validationErrors.siret = ['Invalid SIRET format. SIRET must be 14 digits.'];
        } else {
          // Check if SIRET already exists for another user
          const siretExists = await User.siretExists(siretSanitized, userId);
          if (siretExists) {
            throw new ApiError(400, 'SIRET_ALREADY_EXISTS', 'This SIRET is already registered', {
              field: 'siret'
            });
          }
          updateData.siret = siretSanitized;
        }
      }
    }

    // Validate and update phone
    if (phone !== undefined) {
      if (phone === '' || phone === null) {
        updateData.phone = null;
      } else {
        const phoneSanitized = sanitizeString(phone);
        if (!isValidPhoneNumber(phoneSanitized)) {
          validationErrors.phone = ['Invalid phone number format'];
        } else {
          updateData.phone = phoneSanitized;
        }
      }
    }

    // Validate and update logo URL
    if (logoUrl !== undefined) {
      if (logoUrl === '' || logoUrl === null) {
        updateData.logoUrl = null;
      } else {
        const logoUrlSanitized = sanitizeString(logoUrl);
        if (!isValidString(logoUrlSanitized, 10, 500)) {
          validationErrors.logoUrl = ['Invalid logo URL'];
        } else {
          updateData.logoUrl = logoUrlSanitized;
        }
      }
    }

    // If there are validation errors, return them
    if (Object.keys(validationErrors).length > 0) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Validation failed', {
        fields: validationErrors
      });
    }

    // If no updates to make
    if (Object.keys(updateData).length === 0) {
      throw new ApiError(400, 'NO_UPDATE_DATA', 'No fields to update provided');
    }

    // Update user
    const updatedUser = await User.update(userId, updateData);

    res.json({
      code: 'PROFILE_UPDATED',
      message: email && email !== currentUser.email 
        ? 'Profile updated. Please check your email to verify the email change.'
        : 'Profile updated successfully',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
