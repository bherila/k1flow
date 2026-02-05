module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: {
    // Remove unused imports automatically
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': ['warn', { vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_' }],
    // Sort imports and exports
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    // Let unused-imports handle unused vars
    '@typescript-eslint/no-unused-vars': 'off',
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
