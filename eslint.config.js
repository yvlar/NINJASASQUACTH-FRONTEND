import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Le code des Edge Functions Supabase tourne sous Deno (globals Deno,
  // imports `npm:`/URL) : hors périmètre ESLint côté navigateur. La logique
  // PURE (logic.ts) reste couverte par les tests Vitest.
  globalIgnores(['dist', 'dist-ssr', 'supabase/functions']),
  // Migration TypeScript terminée (item 7.5) : ce bloc ne couvre plus que
  // les fichiers JS de configuration à la racine (eslint.config.js).
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Même convention que côté JS : les identifiants capitalisés non
      // utilisés (constantes SCREAMING_CASE) ne déclenchent pas la règle.
      '@typescript-eslint/no-unused-vars': [
        'error',
        { varsIgnorePattern: '^[A-Z_]' },
      ],
    },
  },
  // Entrées de build/SSR (pré-rendu) : ce ne sont pas des modules de composants
  // soumis au Fast Refresh — elles exportent volontairement des fonctions.
  {
    files: ['src/entry-server.tsx', 'src/entry-prerender.tsx'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // Scripts Node du dépôt (pré-rendu) : globals Node, pas de règles React.
  {
    files: ['scripts/**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
])
