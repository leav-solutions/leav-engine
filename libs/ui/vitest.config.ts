import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/_tests/setupTests.ts'],
        include: ['src/**/*.test.{ts,tsx}'],
        /*
         * aristid-ds ships a UMD bundle and @uidotdev/usehooks / @babel/runtime are ESM-only;
         * inline them so Vitest transforms them. antd is inlined as well to keep its ESM subpaths
         * resolvable. @ant-design / @rc-component / rc-* / color-convert / color-name (whitelisted
         * for babel-jest) are NOT needed here: Vitest handles their ESM natively.
         */
        server: {deps: {inline: ['aristid-ds', 'antd', '@babel/runtime', '@uidotdev/usehooks']}},
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
