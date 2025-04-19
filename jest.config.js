// jest.config.js
export default {
    testEnvironment: 'node',
    testMatch: [ "**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[jt]s?(x)" ],
    roots: ['<rootDir>/tests'],
    moduleFileExtensions: ["mjs", "js",  "cjs", "jsx", "ts", "tsx", "json", "node"],

    transform: {},
  };
  