// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {camelCase, flow, partialRight, trimEnd, upperFirst} from 'lodash';
import glob from 'glob';

export const getGraphqlTypeFromLibraryName = (library: string): string => {
    return flow([camelCase, upperFirst, trimEnd, partialRight(trimEnd, 's')])(library);
};

export const getGraphqlQueryNameFromLibraryName = (library: string): string => {
    return flow([camelCase, trimEnd])(library);
};

export const isFileAllowed = (fsPath: string, allowList: string[], ignoreList: string[], filePath: string): boolean => {
    const match = (pattern: string): boolean => {
        return glob.sync(`${fsPath}/${pattern}`).includes(filePath);
    };

    // if allowPatterns is empty it's an implicit allow of all files
    if (!allowList.length) {
        allowList = ['**'];
    }

    const isAllowed = allowList.some(match);
    const isIgnored = ignoreList.some(match);

    return !isIgnored && isAllowed;
};
