import path from 'path';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import {defineConfig} from 'vitest/config';

const repoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
    // svgr: components import SVGs as React components; react: JSX automatic runtime + RTL.
    plugins: [svgr(), react()],
    test: {
        environment: 'happy-dom',
        pool: 'threads',
        globals: true,
        setupFiles: ['./tests/setupTests.ts'],
        // app-studio uses both conventions: *.spec.{ts,tsx} (majority) and a few *.test.{ts,tsx}.
        include: ['src/**/*.{spec,test}.{ts,tsx}'],
        /*
         * aristid-ds ships a UMD bundle: inline it so Vitest transforms it.
         * We no longer inline antd / @babel/runtime / @uidotdev/usehooks — Vitest resolves their
         * ESM natively, and inlining antd only forced needless transforms.
         */
        server: {deps: {inline: ['aristid-ds']}},
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
