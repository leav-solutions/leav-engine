import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['src/index.ts'],
        setupFiles: ['./src/setup.ts'],
        testTimeout: 30000,
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
