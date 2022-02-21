// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {QueryResult, useQuery} from '@apollo/client';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {useState} from 'react';
import {GET_LIBRARIES_LIST} from '_gqlTypes/GET_LIBRARIES_LIST';

export type IUseGetLibrariesListQueryHook = QueryResult<GET_LIBRARIES_LIST>;

export interface IUseGetLibrariesListQueryHookParams {
    onlyAllowed?: boolean;
}

export default function useGetLibrariesListQuery({
    onlyAllowed = true
}: IUseGetLibrariesListQueryHookParams = {}): IUseGetLibrariesListQueryHook {
    const [queryData, setQueryData] = useState<GET_LIBRARIES_LIST>();

    const query = useQuery<GET_LIBRARIES_LIST>(getLibrariesListQuery, {
        onCompleted: data => {
            const cleanData: GET_LIBRARIES_LIST = {
                ...data,
                libraries: {
                    list: data.libraries.list.filter(lib => !onlyAllowed || lib.permissions.access_library)
                }
            };

            setQueryData(cleanData);
        }
    });

    return {...query, loading: query.loading || (!query.loading && typeof queryData === undefined), data: queryData};
}
