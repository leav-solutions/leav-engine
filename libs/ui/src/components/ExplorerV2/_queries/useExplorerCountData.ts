import {useExplorerLibraryCountDataQuery} from '_ui/_gqlTypes';
import {type UIFilter, prepareFiltersForRequest} from '_ui/components/Filters';
import {type Entrypoint} from '../_types';
import {useMemo} from 'react';

export const useExplorerCountData = ({
    entrypoint,
    libraryId,
    defaultFilters,
    filters,
    skip,
}: {
    entrypoint: Entrypoint;
    libraryId: string;
    defaultFilters: UIFilter[];
    filters: UIFilter[];
    skip?: boolean;
}) => {
    const isLibrary = entrypoint.type === 'library';
    const activeFilter = filters.find(f => f.field === 'active');
    const preparedFilters = prepareFiltersForRequest(activeFilter ? [...defaultFilters, activeFilter] : defaultFilters);

    const {data: countData, refetch: refetchCount} = useExplorerLibraryCountDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLibrary,
        variables: {
            libraryId,
            filters: preparedFilters,
        },
    });

    const memoizedCountData = useMemo(() => countData?.records?.totalCount ?? 0, [countData]);

    return {
        countData: memoizedCountData,
        refetchCount,
    };
};
