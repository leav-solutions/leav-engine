// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RecordFilterInput, useExplorerLibraryCountDataQuery} from '_ui/_gqlTypes';
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
    const activeFilters = prepareFiltersForRequest(filters.filter(f => f.field === 'active'));
    const defaultPreparedFilters = prepareFiltersForRequest(defaultFilters);

    const appliedFilters: RecordFilterInput[] = [...activeFilters, ...defaultPreparedFilters];

    const {data: countData} = useExplorerLibraryCountDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLibrary,
        variables: {
            libraryId,
            filters: appliedFilters,
        },
    });

    const memoizedCountData = useMemo(() => countData?.records?.totalCount ?? 0, [countData]);

    return memoizedCountData;
};
