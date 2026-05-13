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
    transformIgnorePatterns: ['node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks)/)'],
    testRegex: '.test.(ts|tsx)$',
    testTimeout: 90_000,
    moduleNameMapper: require('../../jestModuleNameMapper'),
};
