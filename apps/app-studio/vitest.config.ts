import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import {defineConfig} from 'vitest/config';

const repoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
    // svgr: components import SVGs as React components; react: JSX automatic runtime + RTL.
    plugins: [svgr(), react()],
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setupTests.ts'],
        // app-studio uses both conventions: *.spec.{ts,tsx} (majority) and a few *.test.{ts,tsx}.
        include: ['src/**/*.{spec,test}.{ts,tsx}'],
        /*
         * aristid-ds ships a UMD bundle and @uidotdev/usehooks / @babel/runtime are ESM-only;
         * inline them so Vitest transforms them. antd is inlined to keep its ESM subpaths resolvable.
         * Mirrors the babel-jest transformIgnorePatterns whitelist of the former jest config.
         */
        server: {deps: {inline: ['aristid-ds', 'antd', '@babel/runtime', '@uidotdev/usehooks']}},
        // Replaces ts-jest-mock-import-meta: expose the VITE_* vars the app reads via import.meta.env.
        env: {
            VITE_APPLICATION_ID: 'my-app',
            VITE_API_URL: 'http://localhost:3000/graphql',
            VITE_LOGIN_ENDPOINT: 'my-app',
        },
        testTimeout: 90_000,
        typecheck: {tsconfig: './tsconfig.spec.json'},
    },
    resolve: {
        alias: [
            {find: '@leav/utils', replacement: path.resolve(repoRoot, 'libs/utils/src')},
            {find: '@leav/ui', replacement: path.resolve(repoRoot, 'libs/ui/src')},
            {find: 'react-i18next', replacement: path.resolve(repoRoot, 'node_modules/react-i18next')},
            {find: /^_ui\/(.+)/, replacement: `${path.resolve(repoRoot, 'libs/ui/src')}/$1`},
            {find: /^@leav\/(.+)/, replacement: `${path.resolve(repoRoot, 'libs')}/$1/src`},
        ],
    },
});
