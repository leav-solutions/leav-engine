// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {camelCase, flow, partialRight, trimEnd, upperFirst} from 'lodash';

export const getGraphqlTypeFromLibraryName = (library: string): string => {
    return flow([camelCase, upperFirst, trimEnd, partialRight(trimEnd, 's')])(library);
};

export const getGraphqlQueryNameFromLibraryName = (library: string): string => {
    return flow([camelCase, trimEnd])(library);
};
