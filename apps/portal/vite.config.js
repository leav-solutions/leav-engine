// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import {commonConfig} from '../../vite-config-common';

export default () => {
    const base = process.env.VITE_ENDPOINT ? '/' + process.env.VITE_ENDPOINT + '/' : '/app/portal/';
    return defineConfig({
        ...commonConfig(__dirname),
        base
    });
};
