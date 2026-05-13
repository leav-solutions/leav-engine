/** @type {import('vite').UserConfig} */

import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {dynamicBase} from 'vite-plugin-dynamic-base';
import {commonConfig, devIndexHtmlReplaceVarsPlugin} from '../../vite-config-common';

export default () => {
    const conf = commonConfig(__dirname);
    return defineConfig({
        ...conf,
        resolve: {
            alias: [
                ...conf.resolve.alias,
                {find: 'themingVar', replacement: path.resolve(__dirname, './src/themingVar')},
                {find: '../../theme.config', replacement: path.resolve(__dirname, './src/semantic-ui/theme.config')},
                {find: 'semantic-ui/site', replacement: path.resolve(__dirname, './src/semantic-ui/site')},
            ],
        },
        plugins: [
            react(),
            dynamicBase({
                transformIndexHtml: true,
            }),
            devIndexHtmlReplaceVarsPlugin(),
        ],
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/admin',
    });
};
