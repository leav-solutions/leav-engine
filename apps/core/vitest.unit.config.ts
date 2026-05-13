import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['**/*.spec.ts'],
        setupFiles: ['./src/__tests__/setup.ts', './src/__tests__/jestUtils.ts'],
        globalSetup: './src/__tests__/global-setup.ts',
        typecheck: {tsconfig: './tsconfig.spec.json'},
        server: {
            deps: {
                inline: ['graphql-upload'],
            },
        },
    },
    resolve: {
        alias: [
            {
                find: 'graphql-upload/GraphQLUpload.mjs',
                replacement: path.resolve(__dirname, './src/__tests__/mocks/graphql-upload.ts'),
            },
            {
                find: 'exceljs',
                replacement: path.resolve(__dirname, '../../node_modules/exceljs/dist/exceljs.js'),
            },
            {
                // temporary while plugins still develop/test/build in leav src
                find: /^@leav\/core\/(.+)/,
                replacement: `${path.resolve(__dirname, './src')}/$1`,
            },
            {
                find: /^@leav\/(.+)/,
                replacement: `${path.resolve(__dirname, '../../libs')}/$1/src`,
            },
        ],
    },
});
