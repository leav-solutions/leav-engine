import {defineConfig} from 'eslint/config';
import aristid from '@aristid/eslint-plugin';
import noOnlyTests from 'eslint-plugin-no-only-tests';

export default defineConfig([
    {
        ignores: [
            // Mirror the legacy, `--ext=ts,tsx` was not linting js sources.
            '**/*.{js,jsx,cjs,mjs}',
            '**/_gqlTypes/**',
            '**/dist/**',
            '**/plugins/**',
            '**/__generated__/**',
        ],
    },
    aristid,
    // Enable type-aware linting (required by @typescript-eslint/return-await).
    {
        languageOptions: {
            parserOptions: {
                project: './tsconfig.json',
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    /**
     * Step 1 of the ESLint 9 / @aristid/eslint-plugin v2 migration:
     * neutralize new aristid specific rules that would change hundreds of files
     * => to be deleted progressively in follow-up MRs.
     */
    {
        rules: {
            '@typescript-eslint/consistent-type-imports': 'off',
            'import/consistent-type-specifier-style': 'off',
            'import/no-duplicates': 'off',
            'import/newline-after-import': 'off',
            'import/extensions': 'off',
            'react/jsx-curly-brace-presence': 'off',
            'no-restricted-imports': 'off',
        },
    },
    /**
     * Step 2: Neutralize *recommended* presets of ESLint which are pulled by @aristid/eslint-plugin v2
     * => to be deleted progressively in follow-up MRs.
     */
    {
        rules: {
            // eslint / typescript-eslint recommended
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-empty-object-type': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-unnecessary-type-constraint': 'off',
            'no-extra-boolean-cast': 'off',
            'no-case-declarations': 'off',
            'no-async-promise-executor': 'off',
            'no-useless-escape': 'off',
            'no-constant-binary-expression': 'off',
            'no-prototype-builtins': 'off',
            'no-unsafe-optional-chaining': 'off',
            'no-empty-pattern': 'off',
            // react recommended
            'react/jsx-key': 'off',
            'react/jsx-no-target-blank': 'off',
            'react/no-children-prop': 'off',
            // jsx-a11y recommended
            'jsx-a11y/no-autofocus': 'off',
            'jsx-a11y/click-events-have-key-events': 'off',
            'jsx-a11y/no-static-element-interactions': 'off',
            'jsx-a11y/aria-role': 'off',
            'jsx-a11y/no-noninteractive-element-interactions': 'off',
            'jsx-a11y/interactive-supports-focus': 'off',
            'jsx-a11y/media-has-caption': 'off',
            'jsx-a11y/iframe-has-title': 'off',
            // react-hooks v7 (incl. the new React Compiler rules)
            'react-hooks/rules-of-hooks': 'off',
            'react-hooks/preserve-manual-memoization': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/purity': 'off',
            'react-hooks/globals': 'off',
            'react-hooks/static-components': 'off',
        },
    },
    /**
     * leav-engine rule set, keeped from the legacy .eslintrc.js to limits diff for now
     * => Step 3: may be either deleted or moved to @aristid/eslint-plugin
     * if we want to keep them and generalize them in other projects.
     */
    {
        plugins: {'no-only-tests': noOnlyTests},
        rules: {
            '@typescript-eslint/adjacent-overload-signatures': 'error',
            '@typescript-eslint/array-type': ['error', {default: 'array-simple', readonly: 'array-simple'}],
            '@typescript-eslint/consistent-type-assertions': [
                'error',
                {assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter'},
            ],
            '@typescript-eslint/explicit-member-accessibility': ['warn', {accessibility: 'explicit'}],
            '@typescript-eslint/naming-convention': [
                'error',
                // Classes and interfaces
                {selector: 'class', format: ['PascalCase']},
                {selector: 'interface', format: ['PascalCase'], custom: {regex: '^I[A-Z]', match: true}},

                // Enum
                {selector: 'enum', format: ['PascalCase']},
                {selector: 'enumMember', format: ['UPPER_CASE']},

                // Variables
                // React components and function variables: allow PascalCase for const variables, especially components.
                {
                    selector: 'variable',
                    modifiers: ['destructured'],
                    format: null,
                },
                {
                    selector: 'variable',
                    modifiers: ['exported'],
                    format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'forbid',
                },
                {
                    selector: 'variable',
                    modifiers: ['const'],
                    format: ['PascalCase', 'camelCase', 'UPPER_CASE'],
                    leadingUnderscore: 'allow',
                },

                // Functions
                {
                    selector: 'function',
                    modifiers: ['exported'],
                    format: ['camelCase', 'PascalCase'],
                    leadingUnderscore: 'forbid',
                },
                {selector: 'function', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow'},

                // Parameters
                {selector: 'parameter', modifiers: ['destructured'], format: null},
                {selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow'},

                // Types
                {selector: 'typeLike', format: ['PascalCase']},
            ],
            '@typescript-eslint/no-empty-function': 'error',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-namespace': ['error', {allowDeclarations: true}],
            '@typescript-eslint/no-require-imports': 'off',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/prefer-function-type': 'error',
            '@typescript-eslint/return-await': 'error',
            'constructor-super': 'error',
            curly: 'error',
            'dot-notation': 'error',
            eqeqeq: ['warn', 'always', {null: 'ignore'}],
            'guard-for-in': 'error',
            'id-match': 'error',
            'max-classes-per-file': ['error', 1],
            'no-bitwise': 'error',
            'no-caller': 'error',
            'no-console': 'error',
            'no-duplicate-imports': 'error',
            'no-eval': 'error',
            'no-extra-bind': 'error',
            'no-fallthrough': 'off',
            'no-irregular-whitespace': 'off',
            'no-new-func': 'error',
            'no-new-wrappers': 'error',
            '@typescript-eslint/no-redeclare': ['error'],
            'no-sequences': 'error',
            '@typescript-eslint/no-shadow': ['error'],
            'no-template-curly-in-string': 'error',
            'no-throw-literal': 'error',
            'no-undef-init': 'error',
            '@typescript-eslint/no-unused-expressions': ['error', {allowShortCircuit: true}],
            'object-shorthand': 'error',
            'one-var': ['error', 'never'],
            'prefer-object-spread': 'error',
            radix: 'error',
            'valid-typeof': 'off',
            // Downgraded to warn for the migration: react-refresh 0.5.0 is stricter
            // Restore to 'error' after cleanup.
            'react-refresh/only-export-components': [
                'warn',
                {allowConstantExport: true}, // recommended for Vite
            ],
        },
    },
    {
        files: ['**/*.test.ts', '**/*.spec.ts', '**/*.test.tsx', '**/*.spec.tsx', '**/__tests__/**'],
        rules: {
            'no-only-tests/no-only-tests': 'error',
            'no-console': 'off',
            '@typescript-eslint/consistent-type-assertions': 'off',
        },
    },
    {
        files: [
            'libs/ui/**',
            'apps/admin/**',
            'apps/app-studio/**',
            'apps/data-studio/**',
            'apps/login/**',
            'apps/portal/**',
            'test-apps/**',
        ],
        rules: {
            'no-console': ['error', {allow: ['warn', 'error', 'info']}],
        },
    },
    {
        files: ['apps/core/src/**/*.ts'],
        rules: {
            'no-restricted-imports': [
                'error',
                {
                    patterns: [
                        // Forbid @leav/core/* import in leav core, temporary for https://aristid.atlassian.net/browse/LEAVC-812
                        {
                            group: ['@leav/core/*'],
                            message: "Don't use @leav/core imports in core : use relative imports instead",
                        },
                    ],
                },
            ],
        },
    },
]);
