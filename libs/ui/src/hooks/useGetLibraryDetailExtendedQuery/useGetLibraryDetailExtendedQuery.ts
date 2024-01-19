// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {useQuery} from '@apollo/client';
import {
    getLibraryDetailExtendedQuery,
    IGetLibraryDetailExtendedQuery,
    IGetLibraryDetailExtendedVariables
} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';

export interface IUseGetLibraryDetailExtendedQueryHookParams {
    library: string;
}

const DEPTH_EMBEDDED_FIELDS = 100;

export default function useGetLibraryDetailExtendedQuery({library}: IUseGetLibraryDetailExtendedQueryHookParams) {
    const query = useQuery<IGetLibraryDetailExtendedQuery, IGetLibraryDetailExtendedVariables>(
        getLibraryDetailExtendedQuery(DEPTH_EMBEDDED_FIELDS),
        {
            variables: {
                libId: [library]
            },
            skip: !library
        }
    );

    return query;
}
