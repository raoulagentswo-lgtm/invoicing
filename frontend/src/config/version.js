/**
 * Application Version Configuration
 * This file centralizes version management for the application
 */

export const APP_VERSION = '1.0.2'

/**
 * Get the formatted version string
 * @returns {string} Version in format "v1.0.0"
 */
export const getFormattedVersion = () => {
  return `v${APP_VERSION}`
}
