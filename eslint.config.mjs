export default [
  {
    ignores: ['node_modules/**'], // Ignore node_modules by default
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2021, // ES2021 features
      sourceType: 'module', // Enable ES module syntax
    },
    rules: {
      'indent': ['error', 2], // Enforces 2 spaces for indentation
      'quotes': ['error', 'single'], // Enforces single quotes
      'semi': ['error', 'always'], // Enforces semicolons
      'no-console': 'warn', // Allows console.log with a warning
      'eqeqeq': ['error', 'always'], // Enforce strict equality
      'no-var': 'error', // Disallow var, prefer let/const
      'prefer-const': 'error', // Prefer const over let where possible
      'arrow-spacing': ['error', { before: true, after: true }], // Enforce spacing around arrow functions
      'space-before-function-paren': ['error', 'never'], // No space before function parentheses
      'comma-dangle': ['error', 'never'], // No trailing commas
      'no-unused-vars': ['warn'], // Warn on unused variables
      'eol-last': ['error', 'always'], // Require newline at the end of files
      'no-multiple-empty-lines': ['error', { max: 1 }], // No more than 1 empty line
      'keyword-spacing': ['error', { before: true, after: true }] // Enforce spaces before and after keywords
    },
  },
];
