module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    tsconfigRootDir: '.',
    project: 'tsconfig.json',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint', 'import'],
  settings: { 'import/resolver': { typescript: {} } },
  rules: {
    'no-undef': 'off',
    "@typescript-eslint/indent": ["error", 2],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    '@typescript-eslint/member-ordering': 'off',
    'no-warning-comments': [
      'warn',
      {
        terms: ['TODO', 'FIXME'],
        location: 'anywhere',
      },
    ],
    'prefer-const': 'error',
    'no-var': 'error',
    curly: ['error', 'all'],
    'import/no-cycle': ['error', { maxDepth: Infinity }],
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    'import/no-duplicates': 'error',
  }
};
