// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
module.exports = {
    process() {
        return {code: 'module.exports = {};'};
    },
    getCacheKey() {
        // The output is always the same.
        return 'svgTransform';
    }
};
