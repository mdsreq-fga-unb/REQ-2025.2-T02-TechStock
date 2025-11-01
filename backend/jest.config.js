/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src/tests'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/**/index.js',
    '!src/config/swagger.js'
  ],
  coverageDirectory: 'coverage',
  verbose: false,
};
