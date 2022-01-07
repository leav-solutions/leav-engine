"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFileAllowed = exports.getGraphqlQueryNameFromLibraryName = exports.getGraphqlTypeFromLibraryName = void 0;
// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
const lodash_1 = require("lodash");
const minimatch_1 = __importDefault(require("minimatch"));
const getGraphqlTypeFromLibraryName = (library) => {
    return lodash_1.flow([lodash_1.camelCase, lodash_1.upperFirst, lodash_1.trimEnd, lodash_1.partialRight(lodash_1.trimEnd, 's')])(library);
};
exports.getGraphqlTypeFromLibraryName = getGraphqlTypeFromLibraryName;
const getGraphqlQueryNameFromLibraryName = (library) => {
    return lodash_1.flow([lodash_1.camelCase, lodash_1.trimEnd])(library);
};
exports.getGraphqlQueryNameFromLibraryName = getGraphqlQueryNameFromLibraryName;
const isFileAllowed = (fsPath, allowList, ignoreList, filePath) => {
    // if allowPatterns is empty it's an implicit allow of all files
    if (!allowList.length) {
        allowList = ['**'];
    }
    const isAllowed = allowList.some(pattern => minimatch_1.default(filePath, `${fsPath}/${pattern}`));
    const isIgnored = ignoreList.some(pattern => minimatch_1.default(filePath, `${fsPath}/${pattern}`));
    return !isIgnored && isAllowed;
};
exports.isFileAllowed = isFileAllowed;
//# sourceMappingURL=utils.js.map