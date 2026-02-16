/**
 * Jest Configuration
 * 
 * Configuration for running unit and integration tests
 */

export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/database/db.js'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFiles: [],
  testTimeout: 30000,
  verbose: true,
  transform: {}
};
