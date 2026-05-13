import {type QueryResult, useQuery} from '@apollo/client';
import {getLibraryDetailExtendedQuery} from '../../graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {
    type GET_LIBRARY_DETAIL_EXTENDED,
    type GET_LIBRARY_DETAIL_EXTENDEDVariables,
} from '../../_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';

export interface IUseGetLibraryDetailExtendedQueryHookParams {
    library: string;
}

const DEPTH_EMBEDDED_FIELDS = 100;

export const useGetLibraryDetailExtendedQuery = ({
    library,
}: IUseGetLibraryDetailExtendedQueryHookParams): QueryResult<GET_LIBRARY_DETAIL_EXTENDED> =>
    useQuery<GET_LIBRARY_DETAIL_EXTENDED, GET_LIBRARY_DETAIL_EXTENDEDVariables>(
        getLibraryDetailExtendedQuery(DEPTH_EMBEDDED_FIELDS),
        {
            variables: {
                libId: [library],
            },
            skip: !library,
        },
    );
