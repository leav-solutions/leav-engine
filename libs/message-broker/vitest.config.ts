import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['**/*.spec.ts'],
        typecheck: {tsconfig: './tsconfig.spec.json'},
    },
    resolve: {
        alias: [{find: /^@leav\/(.+)/, replacement: `${path.resolve(__dirname, '..')}/$1/src`}],
    },
});
