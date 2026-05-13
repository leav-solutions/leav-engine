import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['src/__tests__/e2e/indexationManager/**/*.test.ts'],
        globalSetup: './src/__tests__/e2e/indexationManager/globalSetup.ts',
        typecheck: {tsconfig: './tsconfig.spec.json'},
        testTimeout: 30000,
        hookTimeout: 30000,
        teardownTimeout: 1000, // no proper teardown implemented yet
        maxWorkers: 2,
    },
    resolve: {
        alias: [
            {
                find: /^@leav\/(.+)/,
                replacement: `${path.resolve(__dirname, '../../libs')}/$1/src`,
            },
        ],
    },
});
