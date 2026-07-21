import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'happy-dom',
        pool: 'threads',
        globals: true,
        setupFiles: ['./src/_tests/setupTests.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        /*
         * aristid-ds ships a UMD bundle: inline it so Vitest transforms it.
         * We no longer inline antd / @babel/runtime / @uidotdev/usehooks — Vitest resolves their
         * ESM natively, and inlining antd only forced needless transforms.
         */
        server: {deps: {inline: ['aristid-ds']}},
        testTimeout: 90_000,
        typecheck: {tsconfig: './tsconfig.spec.json'},
    },
    resolve: {
        alias: [
            {find: /^@leav\/(.+)/, replacement: `${path.resolve(__dirname, '../../libs')}/$1/src`},
            {find: /^_ui\/(.+)/, replacement: `${path.resolve(__dirname, 'src')}/$1`},
        ],
    },
});
