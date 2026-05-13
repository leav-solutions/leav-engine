import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        globals: true,
        include: ['src/__tests__/unit/**/*.test.ts'],
        typecheck: {tsconfig: './tsconfig.spec.json'},
    },
    resolve: {
        alias: [{find: /^@leav\/(.+)/, replacement: `${path.resolve(__dirname, '../../libs')}/$1/src`}],
    },
});
