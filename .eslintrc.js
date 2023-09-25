require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    env: {browser: true, node: true, es6: true},
    ignorePatterns: ['**/_gqlTypes/*.ts', '**/dist/*'],
    parser: '@typescript-eslint/parser',
    parserOptions: {tsconfigRootDir: __dirname},
    plugins: ['@typescript-eslint', 'react-app', 'react-refresh'],
    settings: {react: {version: 'latest'}},
    rules: {
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': ['error', {default: 'array-simple', readonly: 'array-simple'}],
        '@typescript-eslint/ban-types': [
            'error',
            {
                types: {
                    Object: {message: 'Avoid using the `Object` type. Did you mean `object`?'},
                    Function: {
                        message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.'
                    },
                    Boolean: {message: 'Avoid using the `Boolean` type. Did you mean `boolean`?'},
                    Number: {message: 'Avoid using the `Number` type. Did you mean `number`?'},
                    String: {message: 'Avoid using the `String` type. Did you mean `string`?'},
                    Symbol: {message: 'Avoid using the `Symbol` type. Did you mean `symbol`?'}
                },
                extendDefaults: false
            }
        ],
        '@typescript-eslint/consistent-type-assertions': [
            'error',
            {assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter'}
        ],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/explicit-member-accessibility': ['warn', {accessibility: 'explicit'}],
        '@typescript-eslint/indent': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            {selector: 'interface', format: ['PascalCase'], custom: {regex: '^I[A-Z]', match: true}}
        ],
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {multiline: {delimiter: 'semi', requireLast: true}, singleline: {delimiter: 'semi', requireLast: false}}
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
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/triple-slash-reference': 'error',
        'comma-dangle': 'error',
        complexity: 'off',
        'constructor-super': 'error',
        curly: 'error',
        'dot-notation': 'error',
        'eol-last': 'off',
        eqeqeq: ['error', 'always'],
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
        'no-console': 'off',
        'no-restricted-syntax': [
            'error',
            {
                selector: "CallExpression[callee.object.name='console'][callee.property.name='log']",
                message: 'Console.log is forbidden'
            }
        ],
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
        'no-return-await': 'error',
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
        '@typescript-eslint/no-unused-expressions': ['error'],
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
            {singleValue: false, objectsInArrays: false, arraysInArrays: false}
        ],
        'brace-style': ['error', '1tbs'],
        'object-curly-spacing': ['error', 'never'],
        'func-call-spacing': ['error', 'never'],
        'react-refresh/only-export-components': 'warn'
    }
};
