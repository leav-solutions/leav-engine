// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFilesAfterEnv: ['./setupTests.ts'],
    transform: {
        '\\.(ts|tsx)$': [
            'ts-jest',
            {
                isolatedModules: true
            }
        ],
        '^.+\\.js?$': ['babel-jest', {rootMode: 'upward'}]
    },
    transformIgnorePatterns: ['node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks)/)'],
    testRegex: '.test.(ts|tsx)$',
    testTimeout: 60_000,
    moduleNameMapper: require('../../jestModuleNameMapper')
};
