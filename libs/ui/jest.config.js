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
    moduleNameMapper: require('../../jestModuleNameMapper'),
};
