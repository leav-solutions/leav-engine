// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const CracoLessPlugin = require('craco-less');
const ThemingVar = require('./src/themingVar');

module.exports = {
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: ThemingVar,
                        javascriptEnabled: true
                    }
                }
            }
        }
    ]
};
