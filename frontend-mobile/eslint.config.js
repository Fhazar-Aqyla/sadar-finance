import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    // Unused Velzon demo pages are kept as upstream reference templates.
    'src/pages/AuthenticationInner/{Errors,LockScreen,Login,Logout,PasswordCreate,PasswordReset,Register,SuccessMessage,TwoStepVerification}/**',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^[A-Z_]',
        caughtErrors: 'none',
        varsIgnorePattern: '^[A-Z_]|motion',
      }],
      'react-refresh/only-export-components': ['error', {
        allowConstantExport: true,
        extraHOCs: ['withRouter'],
      }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: globals.jest,
    },
  },
])
