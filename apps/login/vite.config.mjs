/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import {commonConfig} from '../../vite-config-common.mjs';
import {dynamicBase} from 'vite-plugin-dynamic-base';

export default () => {
    const defaultConf = commonConfig(import.meta.dirname);

    return defineConfig({
        ...defaultConf,
        plugins: [
            ...defaultConf.plugins,
            dynamicBase({
                transformIndexHtml: true,
            }),
        ],
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/login',
    });
};
