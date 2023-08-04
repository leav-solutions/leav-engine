// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult, useQuery} from '@apollo/client';
import {useApplicationContext} from 'context/ApplicationContext';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {
    GET_LIBRARIES_LIST,
    GET_LIBRARIES_LISTVariables,
    GET_LIBRARIES_LIST_libraries_list
} from '_gqlTypes/GET_LIBRARIES_LIST';

interface IUseApplicationLibrariesParams {
    onlyAllowed?: boolean;
}

export interface IUseApplicationLibrariesHook {
    loading: boolean;
    libraries: GET_LIBRARIES_LIST_libraries_list[];
    error?: string;
    updateQuery: QueryResult['updateQuery'];
}

export const useApplicationLibraries = (params: IUseApplicationLibrariesParams = {}): IUseApplicationLibrariesHook => {
    const {currentApp} = useApplicationContext();
    const {onlyAllowed = true} = params;

    const {loading, error, data, updateQuery} = useQuery<GET_LIBRARIES_LIST, GET_LIBRARIES_LISTVariables>(
        getLibrariesListQuery,
        {
            skip:
                currentApp?.settings?.libraries === 'none' ||
                (Array.isArray(currentApp?.settings?.libraries) && !currentApp.settings.libraries.length), // Skip if no libraries are selected
            variables: {
                filters: {
                    id: Array.isArray(currentApp?.settings?.libraries) ? currentApp.settings.libraries : []
                }
            }
        }
    );

    let libraries = data?.libraries.list ? [...data?.libraries.list] : [];
    const librariesOrder = currentApp?.settings?.librariesOrder ?? [];
    const librariesCount = libraries.length;

    if (onlyAllowed) {
        libraries = libraries.filter(lib => lib.permissions.access_library);
    }

    // Order libraries according to librariesOrder settings. If a library doesn't appear on order, put it at the end
    libraries.sort((a, b) => {
        const aIndex = librariesOrder.indexOf(a.id) > -1 ? librariesOrder.indexOf(a.id) : librariesCount;
        const bIndex = librariesOrder.indexOf(b.id) > -1 ? librariesOrder.indexOf(b.id) : librariesCount;

        return aIndex - bIndex;
    });

    return {loading, libraries, error: error?.message ?? null, updateQuery};
};
