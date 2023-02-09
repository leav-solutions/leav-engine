// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {QueryResult, useQuery} from '@apollo/client';
import {useApplicationContext} from 'context/ApplicationContext';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {useState} from 'react';
import {isLibraryInApp} from 'utils';
import {GET_LIBRARIES_LIST} from '_gqlTypes/GET_LIBRARIES_LIST';

export type IUseGetLibrariesListQueryHook = QueryResult<GET_LIBRARIES_LIST>;

export interface IUseGetLibrariesListQueryHookParams {
    onlyAllowed?: boolean;
}

export default function useGetLibrariesListQuery({
    onlyAllowed = true
}: IUseGetLibrariesListQueryHookParams = {}): IUseGetLibrariesListQueryHook {
    const [queryData, setQueryData] = useState<GET_LIBRARIES_LIST>();
    const appData = useApplicationContext();

    const query = useQuery<GET_LIBRARIES_LIST>(getLibrariesListQuery, {
        onCompleted: data => {
            const allowedLibraries = data.libraries.list.filter(lib => {
                return (!onlyAllowed || lib.permissions.access_library) && isLibraryInApp(appData.currentApp, lib.id);
            });

            if (appData.currentApp.libraries.length) {
                allowedLibraries.sort((libA, libB) => {
                    const indexLibA = appData.currentApp.libraries.findIndex(lib => lib.id === libA.id);
                    const indexLibB = appData.currentApp.libraries.findIndex(lib => lib.id === libB.id);

                    return indexLibA - indexLibB;
                });
            }

            const cleanData: GET_LIBRARIES_LIST = {
                ...data,
                libraries: {
                    list: allowedLibraries
                }
            };

            setQueryData(cleanData);
        },
        skip: onlyAllowed && appData?.currentApp?.libraries === null
    });

    if (onlyAllowed && appData?.currentApp?.libraries === null) {
        return {...query, loading: false, data: {libraries: {list: []}}};
    }

    return {...query, loading: query.loading || (!query.loading && typeof queryData === undefined), data: queryData};
}
