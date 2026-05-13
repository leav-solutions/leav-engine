import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['src/__tests__/integration/**/*.test.ts'],
        testTimeout: 15000,
        globalSetup: ['./src/__tests__/integration/globalSetup.ts', './src/__tests__/integration/teardown.ts'],
        setupFiles: ['./src/__tests__/testUtils.ts'],
        typecheck: {tsconfig: './tsconfig.spec.json'},
    },
    resolve: {
        alias: [{find: /^@leav\/(.+)/, replacement: `${path.resolve(__dirname, '../../libs')}/$1/src`}],
    },
});
