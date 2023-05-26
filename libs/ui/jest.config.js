// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    testTimeout: 15000,
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFilesAfterEnv: ['./setupTests.ts'],
    transform: {
        '\\.(ts|tsx)$': [
            'ts-jest',
            {
                isolatedModules: true
            }
        ]
    },
    transformIgnorePatterns: ['node_modules'],
    testRegex: '.test.(ts|tsx)$',
    testTimeout: 30000,
    moduleNameMapper: require('../../jestModuleNameMapper')
};
