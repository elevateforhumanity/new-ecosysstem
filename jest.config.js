export default {
  preset: 'jest-environment-node',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  transform: {},
  moduleNameMapping: {},
  testMatch: ['<rootDir>/test/**/*.test.js'],
  testPathIgnorePatterns: ['<rootDir>/.migration_temp_*/', '<rootDir>/node_modules/'],
  setupFilesAfterEnv: [],
  testTimeout: 30000
};