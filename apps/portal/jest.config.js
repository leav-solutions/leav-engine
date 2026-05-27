module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFilesAfterEnv: ['./setupTests.ts'],
    transform: {
        '\\.(ts|tsx)$': [
            'ts-jest',
            {
                isolatedModules: true,
                astTransformers: {
                    before: [
                        {
                            path: 'ts-jest-mock-import-meta',
                            options: {
                                metaObjectReplacement: {
                                    env: {
                                        VITE_APPLICATION_ID: 'portal',
                                        VITE_API_URL: 'http://localhost:3000/graphql',
                                        VITE_LOGIN_ENDPOINT: 'login',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        ],
        '^.+\\.js$': ['babel-jest', {rootMode: 'upward'}],
    },
    /*
     * aristid-ds nests color-convert / color-name which are ESM-only; whitelist them so babel-jest
     * transforms them. Drop after the Vitest migration, which handles ESM natively.
     */
    transformIgnorePatterns: [
        'node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks|aristid-ds|color-convert|color-name)/)',
    ],
    testRegex: '.test.(ts|tsx)$',
    moduleNameMapper: {
        ...require('../../jestModuleNameMapper'),
        '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
    },
    testTimeout: 30_000,
};
