const commonModuleNameMapper = require('../../jestModuleNameMapper');
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
                                        VITE_APPLICATION_ID: 'my-app',
                                        VITE_API_URL: 'http://localhost:3000/graphql',
                                        VITE_LOGIN_ENDPOINT: 'my-app',
                                    },
                                },
                            },
                        },
                    ],
                },
            },
        ],
        '^.+\\.svg$': '<rootDir>/src/_tests/svgTransform.js',
        '^.+\\.js$': ['babel-jest', {rootMode: 'upward'}],
    },
    transformIgnorePatterns: ['node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks)/)'],
    testRegex: '.test.(ts|tsx)$',
    moduleNameMapper: {
        ...commonModuleNameMapper,
        '^assets/(.*)$': '<rootDir>/src/assets/$1',
        '^graphQL/(.*)$': '<rootDir>/src/graphQL/$1',
        '^reduxStore/(.*)$': '<rootDir>/src/reduxStore/$1',
        '^utils/(.*)$': '<rootDir>/src/utils/$1',
        '^utils$': '<rootDir>/src/utils',
        '^constants/(.*)$': '<rootDir>/src/constants/$1',
        '^_types/(.*)$': '<rootDir>/src/_types/$1',
    },
    testTimeout: 30_000,
};
