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
const glob_1 = __importDefault(require("glob"));
const getGraphqlTypeFromLibraryName = (library) => {
    return lodash_1.flow([lodash_1.camelCase, lodash_1.upperFirst, lodash_1.trimEnd, lodash_1.partialRight(lodash_1.trimEnd, 's')])(library);
};
exports.getGraphqlTypeFromLibraryName = getGraphqlTypeFromLibraryName;
const getGraphqlQueryNameFromLibraryName = (library) => {
    return lodash_1.flow([lodash_1.camelCase, lodash_1.trimEnd])(library);
};
exports.getGraphqlQueryNameFromLibraryName = getGraphqlQueryNameFromLibraryName;
const isFileAllowed = (fsPath, allowList, ignoreList, filePath) => {
    const match = (pattern) => {
        return glob_1.default.sync(`${fsPath}/${pattern}`).includes(filePath);
    };
    // if allowPatterns is empty it's an implicit allow of all files
    if (!allowList.length) {
        allowList = ['**'];
    }
    const isAllowed = allowList.some(match);
    const isIgnored = ignoreList.some(match);
    return !isIgnored && isAllowed;
};
exports.isFileAllowed = isFileAllowed;
//# sourceMappingURL=utils.js.map