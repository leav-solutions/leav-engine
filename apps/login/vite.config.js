// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all'; // Fixes bug when passing reset password key in URL
import {commonConfig} from '../../vite-config-common';
import {dynamicBase} from 'vite-plugin-dynamic-base';

export default () => {
    const defaultConf = commonConfig(__dirname);

    return defineConfig({
        ...defaultConf,
        plugins: [
            ...defaultConf.plugins,
            pluginRewriteAll(),
            dynamicBase({
                transformIndexHtml: true
            })
        ],
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/login'
    });
};
