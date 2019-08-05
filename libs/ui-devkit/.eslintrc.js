module.exports = {
  root: true,
  extends: ['../../.eslintrc.js', 'plugin:react/recommended'],
  env: {
    node: false,
    browser: true,
    'shared-node-browser': true,
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
    jsx: true,
    useJSXTextNode: true,
  },
  plugins: ['react', 'react-hooks'],
  settings: { react: { version: 'detect' } },
  rules: {
    'react/prop-types': 'off',
    'react/display-name': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
  },
};
