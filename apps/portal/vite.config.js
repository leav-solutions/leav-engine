// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** @type {import('vite').UserConfig} */

import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default () => {
    const base = process.env.VITE_ENDPOINT ? '/' + process.env.VITE_ENDPOINT + '/' : '/app/portal/';
    return defineConfig({
        plugins: [react()],
        resolve: {
            alias: {
                components: path.resolve(__dirname, './src/components'),
                context: path.resolve(__dirname, './src/context'),
                hooks: path.resolve(__dirname, './src/hooks'),
                queries: path.resolve(__dirname, './src/queries'),
                _gqlTypes: path.resolve(__dirname, './src/_gqlTypes'),
                _tests: path.resolve(__dirname, './src/_tests'),
                __mocks__: path.resolve(__dirname, './src/__mocks__')
            }
        },
        server: {
            port: 3000,
            host: true
        },
        base
    });
};
