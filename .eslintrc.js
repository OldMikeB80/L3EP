module.exports = {
  root: true,
  extends: ['@react-native-community'],
  plugins: ['react', 'react-hooks'],
  parserOptions: { ecmaVersion: 2022, sourceType: 'module' },
  rules: {
    'import/order': ['error', { 'newlines-between': 'always' }],
    'react-hooks/exhaustive-deps': 'warn',
    'import/no-unresolved': 'off', // Path aliases handled by TypeScript
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        moduleDirectory: ['node_modules', 'src'],
      },
    },
  },
};
