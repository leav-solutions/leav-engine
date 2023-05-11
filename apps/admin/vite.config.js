// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** @type {import('vite').UserConfig} */

import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';
import {dynamicBase} from 'vite-plugin-dynamic-base';
import {commonConfig} from '../../vite-config-common';

export default () => {
    const conf = commonConfig(__dirname);
    return defineConfig({
        ...conf,
        resolve: {
            alias: {
                ...conf.resolve.alias,
                themingVar: path.resolve(__dirname, './src/themingVar'),
                '../../theme.config': path.resolve(__dirname, './src/semantic-ui/theme.config'),
                'semantic-ui/site': path.resolve(__dirname, './src/semantic-ui/site')
            }
        },
        plugins: [
            react(),
            dynamicBase({
                transformIndexHtml: true
            }),
            reactVirtualized()
        ],
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/admin'
    });
};

// This is a hack to fix a bug in react-virtualized, used by react-sortable-tree.
// More details here: https://github.com/bvaughn/react-virtualized/issues/1632
export function reactVirtualized() {
    const WRONG_CODE = 'import { bpfrpt_proptype_WindowScroller } from "../WindowScroller.js";';
    return {
        name: 'flat:react-virtualized',
        configResolved() {
            const file = require
                .resolve('react-virtualized')
                .replace(
                    path.join('dist', 'commonjs', 'index.js'),
                    path.join('dist', 'es', 'WindowScroller', 'utils', 'onScroll.js')
                );
            const code = fs.readFileSync(file, 'utf-8');
            const modified = code.replace(WRONG_CODE, '');
            fs.writeFileSync(file, modified);
        }
    };
}
