module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFilesAfterEnv: ['./setupTests.ts'],
    transform: {
        '\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: './tsconfig.test.json',
            },
        ],
        '^.+\\.js?$': ['babel-jest', {rootMode: 'upward'}],
    },
    /*
     * aristid-ds nests color-convert / color-name which are ESM-only; whitelist them so babel-jest
     * transforms them. Drop after the Vitest migration, which handles ESM natively.
     */
    transformIgnorePatterns: [
        'node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks|aristid-ds|color-convert|color-name)/)',
    ],
    testRegex: '.test.(ts|tsx)$',
    testTimeout: 90_000,
    moduleNameMapper: {
        ...require('../../jestModuleNameMapper'),
        // Map CSS module imports to identity-obj-proxy: in tests `import {x} from './y.module.css'`
        // resolves `x` to the literal string 'x', so styling never breaks rendering assertions.
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
};
