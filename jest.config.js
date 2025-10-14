export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['<rootDir>/test/**/*.test.js', '<rootDir>/src/**/*.test.*', '<rootDir>/backend/**/*.test.*'],
  testPathIgnorePatterns: ['<rootDir>/.migration_temp_*/', '<rootDir>/node_modules/'],
  testTimeout: 30000,
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};