/**
 * Jest Configuration
 * 
 * Configuration for running unit and integration tests
 */

export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'pages.*test', // Skip React component tests for now
    'hooks.*test'  // Skip React hook tests for now
  ],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/database/db.js',
    '!src/pages/**',
    '!src/hooks/**',
    '!src/index.js'
  ],
  coverageThreshold: {
    global: {
      branches: 40,
      functions: 40,
      lines: 40,
      statements: 40
    }
  },
  testTimeout: 30000,
  verbose: true,
  transform: {},
  transformIgnorePatterns: []
};
