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
    /*
     * aristid-ds nests color-convert / color-name which are ESM-only; whitelist them so babel-jest
     * transforms them. Drop after the Vitest migration, which handles ESM natively.
     */
    transformIgnorePatterns: [
        'node_modules/(?!(antd|@babel/runtime|@uidotdev/usehooks|aristid-ds|color-convert|color-name)/)',
    ],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Ignore module.css written by devs and all stylesheet from libs (ex: FontAwesome stylesheet)
        '^@leav/(.*)$': '<rootDir>/../../libs/$1/src',
        '^_ui/(.*)': '<rootDir>/../../libs/ui/src/$1',
    },
};
