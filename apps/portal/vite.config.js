/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import {commonConfig, devIndexHtmlReplaceVarsPlugin} from '../../vite-config-common';
import {dynamicBase} from 'vite-plugin-dynamic-base';

export default () =>
    defineConfig({
        ...commonConfig(__dirname),
        plugins: [
            dynamicBase({
                transformIndexHtml: true,
            }),
            devIndexHtmlReplaceVarsPlugin(),
        ],
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/portal',
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
