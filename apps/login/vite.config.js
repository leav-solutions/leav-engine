// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import pluginRewriteAll from 'vite-plugin-rewrite-all'; // Fixes bug when passing reset password key in URL
import {commonConfig} from '../../vite-config-common';

export default () => {
    const base = process.env.VITE_ENDPOINT ? '/' + process.env.VITE_ENDPOINT + '/' : '/app/login/';
    const defaultConf = commonConfig(__dirname);
    return defineConfig({
        ...defaultConf,
        plugins: [...defaultConf.plugins, pluginRewriteAll()],
        base
    });
};
