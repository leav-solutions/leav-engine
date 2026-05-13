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
    transformIgnorePatterns: ['node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks)/)'],
    testRegex: '.test.(ts|tsx)$',
    moduleNameMapper: require('../../jestModuleNameMapper'),
    testTimeout: 30_000,
};
