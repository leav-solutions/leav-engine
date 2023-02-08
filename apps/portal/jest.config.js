// Copyright LEAV Solutions 2017
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
                                        VITE_LOGIN_ENDPOINT: 'login'
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ]
    },
    transformIgnorePatterns: ['node_modules'],
    testRegex: '.test.(tsx)$',
    moduleNameMapper: require('../../jestModuleNameMapper')
};
