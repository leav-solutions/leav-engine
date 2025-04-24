// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/** @type {import('vite').UserConfig} */

import {defineConfig} from 'vite';
import {commonConfig} from '../../vite-config-common';
import {dynamicBase} from 'vite-plugin-dynamic-base';
import {browserslistToTargets} from 'lightningcss';
import browserslist from 'browserslist';

const targets = browserslistToTargets(browserslist('>= 0.25%'));

export default () =>
    defineConfig({
        ...commonConfig(__dirname),
        plugins: [
            dynamicBase({
                transformIndexHtml: true
            })
        ],
        css: {
            transformer: 'lightningcss',
            lightningcss: {
                targets
            }
        },
        base: process.env.NODE_ENV === 'production' ? '/__dynamic_base__/' : '/app/skeleton-app',
        build: {
            rollupOptions: {
                onwarn(warning, warn) {
                    // Suppress "Module level directives cause errors when bundled" warnings
                    if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                        return;
                    }
                    warn(warning);
                }
            }
        }
    });
