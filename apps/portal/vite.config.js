// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import {commonConfig} from '../../vite-config-common';
import {dynamicBase} from 'vite-plugin-dynamic-base';

export default () => {
    return defineConfig({
        ...commonConfig(__dirname),
        plugins: [
            dynamicBase({
                transformIndexHtml: true
            })
        ],
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/portal'
    });
};
