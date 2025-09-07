export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['<rootDir>/test/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/.migration_temp_*/', '<rootDir>/node_modules/'],
  testTimeout: 30000,
  collectCoverage: false,
  moduleFileExtensions: ['js', 'json'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  }
};