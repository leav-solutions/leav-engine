"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGraphqlQueryNameFromLibraryName = exports.getGraphqlTypeFromLibraryName = void 0;
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const lodash_1 = require("lodash");
const getGraphqlTypeFromLibraryName = (library) => {
    return lodash_1.flow([lodash_1.camelCase, lodash_1.upperFirst, lodash_1.trimEnd, lodash_1.partialRight(lodash_1.trimEnd, 's')])(library);
};
exports.getGraphqlTypeFromLibraryName = getGraphqlTypeFromLibraryName;
const getGraphqlQueryNameFromLibraryName = (library) => {
    return lodash_1.flow([lodash_1.camelCase, lodash_1.trimEnd])(library);
};
exports.getGraphqlQueryNameFromLibraryName = getGraphqlQueryNameFromLibraryName;
//# sourceMappingURL=utils.js.map