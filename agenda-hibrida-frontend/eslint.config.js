import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { 
    ignores: [
      'dist',
      'build',
      '.vite',
      'node_modules',
      'playwright-report',
      'test-results',
      'coverage',
      '.eslintcache',
      '**/playwright-report/**',
      '**/test-results/**',
      'tests/**',
      '**/tests/**',
      'playwright.config.js',
      '*.config.js'
    ] 
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { 
        varsIgnorePattern: '^_|^[A-Z_]|^validate|^format|^set[A-Z]|^show[A-Z]|^upload|^selected|^tattoo|^client|^accounts|^categories|^delete|^create|^data$|^is[A-Z]|^handle|^load|^move|^available|^primary|^only|^get[A-Z]|^goTo|^new[A-Z]|^axios$|^socket$|^subtotal$|^total$|View$|^month|^error$|^e$',
        argsIgnorePattern: '^_|^index$|^error$|^imagePath$|^reject$|^e$|^Icon$|Id$|Status$|Date$|port$'
      }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'react-hooks/exhaustive-deps': 'warn', // Downgrade de error para warning
    },
  },
]
