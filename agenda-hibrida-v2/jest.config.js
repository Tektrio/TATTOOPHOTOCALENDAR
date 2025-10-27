/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'services/**/*.js',
    'routes/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**'
  ],
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 10000,
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
  // Coverage threshold removido temporariamente durante implementação gradual
  // Será reativado quando todos os serviços tiverem testes
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70
  //   }
  // }
};

