// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFilesAfterEnv: ['./tests/setupTests.ts'],
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
                                        VITE_LOGIN_ENDPOINT: 'my-app'
                                    }
                                }
                            }
                        }
                    ]
                }
            }
        ],
        '^.+\\.js$': ['babel-jest', {rootMode: 'upward'}]
    },
    transformIgnorePatterns: ['node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks)/)'],
    moduleNameMapper: {
        '\\.module.css$': 'identity-obj-proxy',
        '^@leav/(.*)$': '<rootDir>/../../libs/$1/src',
        '^_ui/(.*)': '<rootDir>/../../libs/ui/src/$1'
    }
};
