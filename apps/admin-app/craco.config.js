// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    plugins: [{plugin: require('@semantic-ui-react/craco-less')}],
    webpack: {
        configure: {
            resolve: {
                fallback: {
                    path: false
                }
            }
        }
    }
};
