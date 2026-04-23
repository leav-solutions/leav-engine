require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    env: {browser: true, node: true, es6: true},
    ignorePatterns: ['**/_gqlTypes/*.ts', '**/dist/*', '**/plugins/*', '**/__generated__/**', '.eslintrc.js'],
    parser: '@typescript-eslint/parser',
    parserOptions: {tsconfigRootDir: __dirname, project: './tsconfig.json'},
    plugins: ['@typescript-eslint', 'react-refresh', 'no-only-tests'],
    settings: {react: {version: 'latest'}},
    extends: ['plugin:@aristid/recommended'],
    rules: {
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': ['error', {default: 'array-simple', readonly: 'array-simple'}],
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    Object: {message: 'Avoid using the `Object` type. Did you mean `object`?'},
                    Function: {
                        message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
                    },
                    Boolean: {message: 'Avoid using the `Boolean` type. Did you mean `boolean`?'},
                    Number: {message: 'Avoid using the `Number` type. Did you mean `number`?'},
                    String: {message: 'Avoid using the `String` type. Did you mean `string`?'},
                    Symbol: {message: 'Avoid using the `Symbol` type. Did you mean `symbol`?'},
                },
                extendDefaults: false,
            },
        ],
        '@typescript-eslint/consistent-type-assertions': [
            'error',
            {assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter'},
        ],
        '@typescript-eslint/explicit-member-accessibility': ['warn', {accessibility: 'explicit'}],
        '@typescript-eslint/indent': 'off',
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
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {multiline: {delimiter: 'semi', requireLast: true}, singleline: {delimiter: 'semi', requireLast: false}},
        ],
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-namespace': ['error', {allowDeclarations: true}],
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/quotes': ['error', 'single', {avoidEscape: true}],
        '@typescript-eslint/return-await': 'error',
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/triple-slash-reference': 'error',
        'comma-dangle': ['error', 'always-multiline'],
        complexity: 'off',
        'constructor-super': 'error',
        curly: 'error',
        'dot-notation': 'error',
        'eol-last': 'off',
        eqeqeq: ['warn', 'always', {null: 'ignore'}],
        'guard-for-in': 'error',
        'id-match': 'error',
        'import/no-extraneous-dependencies': 'off',
        'import/no-internal-modules': 'off',
        'import/order': 'off',
        'linebreak-style': ['error', 'unix'],
        'max-classes-per-file': ['error', 1],
        'max-len': 'off',
        'new-parens': 'off',
        'newline-per-chained-call': 'off',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-console': 'error',
        'no-debugger': 'error',
        'no-duplicate-case': 'error',
        'no-duplicate-imports': 'error',
        'no-empty': 'error',
        'no-eval': 'error',
        'no-extra-bind': 'error',
        'no-extra-semi': 'off',
        'no-fallthrough': 'off',
        'no-invalid-this': 'off',
        'no-irregular-whitespace': 'off',
        'no-multiple-empty-lines': 'error',
        'no-new-func': 'error',
        'no-new-wrappers': 'error',
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': ['error'],
        'no-sequences': 'error',
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': ['error'],
        'no-sparse-arrays': 'error',
        'no-template-curly-in-string': 'error',
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'error',
        'no-undef-init': 'error',
        'no-unsafe-finally': 'error',
        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': ['error', {allowShortCircuit: true}],
        'no-unused-labels': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'one-var': ['error', 'never'],
        'prefer-arrow/prefer-arrow-functions': 'off',
        'prefer-const': 'error',
        'prefer-object-spread': 'error',
        'quote-props': 'off',
        radix: 'error',
        'space-before-function-paren': 'off',
        'space-in-parens': ['off', 'never'],
        'use-isnan': 'error',
        'valid-typeof': 'off',
        'array-bracket-spacing': [
            'error',
            'never',
            {singleValue: false, objectsInArrays: false, arraysInArrays: false},
        ],
        'brace-style': ['error', '1tbs'],
        'object-curly-spacing': ['error', 'never'],
        'func-call-spacing': ['error', 'never'],
        'react-refresh/only-export-components': [
            'error',
            {allowConstantExport: true}, // recommended for Vite
        ],
    },
    overrides: [
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
    ],
};
