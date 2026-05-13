import {useQuery} from '@apollo/client';
import {
    getLibraryDetailExtendedQuery,
    type IGetLibraryDetailExtendedQuery,
    type IGetLibraryDetailExtendedVariables,
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
                libId: [library],
            },
            skip: !library,
        },
    );

    return query;
}
