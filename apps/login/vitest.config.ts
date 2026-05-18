import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/__tests__/setupTests.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        server: {deps: {inline: ['aristid-ds']}},
        testTimeout: 15_000,
        typecheck: {tsconfig: './tsconfig.spec.json'},
    },
    resolve: {
        alias: [
            {find: /^@leav\/(.+)/, replacement: `${path.resolve(__dirname, '../../libs')}/$1/src`},
            {find: /^_ui\/(.+)/, replacement: `${path.resolve(__dirname, '../../libs/ui/src')}/$1`},
        ],
    },
});
