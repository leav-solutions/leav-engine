/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import {commonConfig} from '../../vite-config-common.mjs';
import {dynamicBase} from 'vite-plugin-dynamic-base';

// Fixes bug when passing reset password key in URL
import pluginRewriteAll from 'vite-plugin-rewrite-all';

export default () => {
    const defaultConf = commonConfig(import.meta.dirname);

    return defineConfig({
        ...defaultConf,
        plugins: [
            ...defaultConf.plugins,
            pluginRewriteAll(),
            dynamicBase({
                transformIndexHtml: true,
            }),
        ],
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/login',
    });
};
