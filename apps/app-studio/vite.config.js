// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import {commonConfig, devIndexHtmlReplaceVarsPlugin} from '../../vite-config-common';
import {dynamicBase} from 'vite-plugin-dynamic-base';
import {browserslistToTargets} from 'lightningcss';
import browserslist from 'browserslist';
import packageJson from './package.json';

export const devIndexApplyApplicationBaseUrl = () => ({
    name: 'dev-index-apply-application-base-url',
    enforce: 'pre',
    apply: 'serve', // uniquement en dev
    transformIndexHtml(html, ctx) {
        const urlObj = new URL(ctx.originalUrl, 'http://localhost');
        const endpoint = urlObj.searchParams.get('endpoint');
        return endpoint
            ? html.replace(/{{APPLICATION_BASE_URL}}/g, process.env.APPLICATION_BASE_URL || `/app/${endpoint}`)
            : html;
    },
});

const _commonConfig = commonConfig(__dirname);

export default () =>
    defineConfig({
        ..._commonConfig,
        plugins: [
            dynamicBase({
                transformIndexHtml: true,
            }),
            devIndexApplyApplicationBaseUrl(), // should be before devIndexHtmlReplaceVarsPlugin to ensure APPLICATION_BASE_URL is correctly replaced in index.html
            devIndexHtmlReplaceVarsPlugin(),
        ],
        css: {
            transformer: 'lightningcss',
            lightningcss: {
                targets: browserslistToTargets(browserslist(packageJson.browserslist.production)),
            },
        },
        server: {
            ..._commonConfig.server,
            proxy: {
                '/app/explorer-studio': `http://localhost:${_commonConfig.server.port}/app/app-studio?endpoint=explorer-studio`,
                '/app/home': `http://localhost:${_commonConfig.server.port}/app/app-studio?endpoint=home`,
            },
        },
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/app-studio',
        build: {
            sourcemap: true,
            rollupOptions: {
                onwarn(warning, warn) {
                    // Suppress 'Module level directives cause errors when bundled, "use client" in <file_name>' warnings from Antd
                    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                        return;
                    }
                    // Suppress 'Error when using sourcemap for reporting an error: Can't resolve original location of error.' warnings from Antd
                    // https://github.com/ant-design/ant-design/issues/46273
                    if (
                        warning.code === 'SOURCEMAP_ERROR' &&
                        warning.message.includes(
                            "Error when using sourcemap for reporting an error: Can't resolve original location of error.",
                        ) &&
                        warning.message.includes('node_modules/antd/es')
                    ) {
                        return;
                    }
                    warn(warning);
                },
            },
        },
    });
