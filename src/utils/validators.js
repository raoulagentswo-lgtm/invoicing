/**
 * Validation Utilities
 * 
 * Provides validation functions for common data types
 */

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate SIRET format (French business identification)
 * 
 * SIRET format: 14 digits
 * First 9 digits = SIREN
 * Last 5 digits = establishment number
 * 
 * @param {string} siret - SIRET to validate
 * @returns {boolean} True if SIRET format is valid
 */
export function isValidSIRET(siret) {
  if (!siret) return false;
  
  // Remove spaces
  const cleanSiret = siret.replace(/\s/g, '');
  
  // Must be exactly 14 digits
  if (!/^\d{14}$/.test(cleanSiret)) return false;
  
  // Luhn algorithm for SIRET validation
  return validateLuhnAlgorithm(cleanSiret);
}

/**
 * Luhn algorithm for number validation
 * 
 * @param {string} num - Number to validate
 * @returns {boolean} True if valid
 */
function validateLuhnAlgorithm(num) {
  let sum = 0;
  let isEven = false;

  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate phone number format (basic)
 * 
 * Allows international formats
 * 
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone format is valid
 */
export function isValidPhoneNumber(phone) {
  if (!phone) return false;
  
  // Remove common formatting characters
  const cleanPhone = phone.replace(/[\s\-()\.+]/g, '');
  
  // Must be between 7-15 digits
  return /^\d{7,15}$/.test(cleanPhone);
}

/**
 * Validate URL format
 * 
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 */
export function isValidUrl(url) {
  if (!url) return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate required string field
 * 
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {number} maxLength - Maximum length
 * @returns {boolean} True if valid
 */
export function isValidString(value, minLength = 1, maxLength = 255) {
  if (typeof value !== 'string') return false;
  return value.trim().length >= minLength && value.length <= maxLength;
}

/**
 * Sanitize email (lowercase, trim)
 * 
 * @param {string} email - Email to sanitize
 * @returns {string} Sanitized email
 */
export function sanitizeEmail(email) {
  return email.toLowerCase().trim();
}

/**
 * Sanitize string (trim, remove extra whitespace)
 * 
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Validate name field
 * 
 * @param {string} name - Name to validate
 * @returns {Object} Validation result
 */
export function validateName(name) {
  const errors = [];
  
  if (!isValidString(name, 2, 100)) {
    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }
    if (name && name.length > 100) {
      errors.push('Name must not exceed 100 characters');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
