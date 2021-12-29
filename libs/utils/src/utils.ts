// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {camelCase, flow, partialRight, trimEnd, upperFirst} from 'lodash';
import minimatch from 'minimatch';

export const getGraphqlTypeFromLibraryName = (library: string): string => {
    return flow([camelCase, upperFirst, trimEnd, partialRight(trimEnd, 's')])(library);
};

export const getGraphqlQueryNameFromLibraryName = (library: string): string => {
    return flow([camelCase, trimEnd])(library);
};

export const isFileAllowed = (fsPath: string, allowList: string[], ignoreList: string[], filePath: string): boolean => {
    // if allowPatterns is empty it's an implicit allow of all files
    if (!allowList.length) {
        allowList = ['**'];
    }

    const isAllowed = allowList.some(pattern => minimatch(filePath, `${fsPath}/${pattern}`));
    const isIgnored = ignoreList.some(pattern => minimatch(filePath, `${fsPath}/${pattern}`));

    return !isIgnored && isAllowed;
};
