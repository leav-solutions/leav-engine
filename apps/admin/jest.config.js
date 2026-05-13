const commonModuleNameMapper = require('../../jestModuleNameMapper');

module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFilesAfterEnv: ['./setupTests.ts'],
    transform: {
        '\\.(ts|tsx|js|jsx)$': [
            'ts-jest',
            {
                astTransformers: {
                    before: [
                        {
                            path: 'ts-jest-mock-import-meta',
                        },
                    ],
                },
            },
        ],
        '^.+\\.svg$': '<rootDir>/src/_tests/svgTransform.js',
        '^.+\\.js$': ['babel-jest', {rootMode: 'upward'}],
    },
    transformIgnorePatterns: ['node_modules/(?!(@uidotdev/usehooks|react-dnd-test-backend|@x0k/json-schema-merge)/)'],
    testRegex: '.test.(tsx)$',
    moduleNameMapper: {
        ...commonModuleNameMapper,
        '^assets/(.*)$': '<rootDir>/src/assets/$1',
        '^graphQL/(.*)$': '<rootDir>/src/graphQL/$1',
        '^reduxStore/(.*)$': '<rootDir>/src/reduxStore/$1',
        '^utils/(.*)$': '<rootDir>/src/utils/$1',
        '^utils$': '<rootDir>/src/utils',
        '^constants/(.*)$': '<rootDir>/src/constants/$1',
        '^_types/(.*)$': '<rootDir>/src/_types/$1',
        '^themingVar$': '<rootDir>/src/themingVar.ts',
        '\\.css$': '<rootDir>/src/__mocks__/styleMock.js',
    },
};
