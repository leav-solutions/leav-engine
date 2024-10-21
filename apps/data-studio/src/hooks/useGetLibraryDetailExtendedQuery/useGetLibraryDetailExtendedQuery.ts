// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {QueryResult, useQuery} from '@apollo/client';
import {getLibraryDetailExtendedQuery} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {GET_LIBRARY_DETAIL_EXTENDED, GET_LIBRARY_DETAIL_EXTENDEDVariables} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';

export interface IUseGetLibraryDetailExtendedQueryHookParams {
    library: string;
}

const DEPTH_EMBEDDED_FIELDS = 100;

export const useGetLibraryDetailExtendedQuery = ({
    library
}: IUseGetLibraryDetailExtendedQueryHookParams): QueryResult<GET_LIBRARY_DETAIL_EXTENDED> =>
    useQuery<GET_LIBRARY_DETAIL_EXTENDED, GET_LIBRARY_DETAIL_EXTENDEDVariables>(
        getLibraryDetailExtendedQuery(DEPTH_EMBEDDED_FIELDS),
        {
            variables: {
                libId: [library]
            },
            skip: !library
        }
    );
