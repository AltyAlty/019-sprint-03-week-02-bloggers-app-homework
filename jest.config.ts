module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/__tests__/{integration,unit-tests}/**/*.(test|spec).ts'],
  testPathIgnorePatterns: ['/node_modules/', '/__tests__/(utils|test-data|test-doubles)/'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup/jest.setup.ts'],

  transformIgnorePatterns: ['node_modules(?!.*(?:inversify|@inversifyjs))'],
  transform: {
    '\\.tsx?$': 'ts-jest',
    '\\.js$': [
      'babel-jest',
      {
        presets: ['@babel/preset-env'],
      },
    ],
  },
};
