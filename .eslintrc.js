module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard',
    'airbnb-base',
  ],
  ignorePatterns: [
    '**/node_modules/**',
    '**/dist/**',
    '**/@/**',
    '**/*.d.ts',
  ],
  rules: {
    'import/no-unresolved': 'off',
    'import/extensions': 'off',
    'arrow-parens': 0,
    'no-else-return': 0,
    'prefer-regex-literals': 'off',
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: ['state', 'config', 'args'],
    }],
  },
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        'no-undef': 'off',
      },
    },
  ],
};
