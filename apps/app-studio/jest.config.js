module.exports = {
    testEnvironment: 'jest-environment-jsdom',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    setupFilesAfterEnv: ['./tests/setupTests.ts'],
    transform: {
        '\\.(ts|tsx)$': [
            'ts-jest',
            {
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
        '^.+\\.js$': ['babel-jest', {rootMode: 'upward'}],
    },
    transformIgnorePatterns: ['node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks)/)'],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Ignore module.css written by devs and all stylesheet from libs (ex: FontAwesome stylesheet)
        '^@leav/(.*)$': '<rootDir>/../../libs/$1/src',
        '^_ui/(.*)': '<rootDir>/../../libs/ui/src/$1',
    },
};
