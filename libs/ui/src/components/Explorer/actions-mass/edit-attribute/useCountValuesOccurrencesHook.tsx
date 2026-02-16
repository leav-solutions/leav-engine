// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RecordFilterInput, useCountValuesOccurrencesLazyQuery} from '_ui/_gqlTypes';
import {useEffect, useMemo} from 'react';

export type ValuesOccurrences = {
    noValueCount: number;
    occurrences: Array<{count: number; value: {id: string}}>;
    loading?: boolean;
};
export type ValueOccurrence = ValuesOccurrences['occurrences'][0];
export const useCountValuesOccurrencesHook = ({
    attributeId,
    libraryId,
    recordFilters,
}: {
    attributeId?: string;
    libraryId: string;
    recordFilters: RecordFilterInput[];
}): ValuesOccurrences => {
    const [countValuesOccurrences, {data: valuesOccurrences, loading}] = useCountValuesOccurrencesLazyQuery({
        fetchPolicy: 'no-cache',
        nextFetchPolicy: 'no-cache',
    });

    useEffect(() => {
        if (attributeId) {
            countValuesOccurrences({
                variables: {
                    attribute: attributeId,
                    library: libraryId,
                    recordFilters,
                },
            });
        }
    }, [attributeId, libraryId, recordFilters]);

    const noValueCount = useMemo(() => {
        if (!valuesOccurrences) {
            return 0;
        }
        return valuesOccurrences.listDistinctValues?.find(v => !('treeNode' in v) || v.treeNode === null)?.count || 0;
    }, [valuesOccurrences]);

    const occurrences = useMemo(() => {
        if (!valuesOccurrences) {
            return [];
        }
        return (
            valuesOccurrences.listDistinctValues
                ?.filter(v => 'treeNode' in v && v.treeNode !== null)
                .map(v => ({count: v.count, value: {id: (v as {treeNode: {id: string}}).treeNode.id}})) || []
        );
    }, [valuesOccurrences]);

    return {
        occurrences,
        noValueCount,
        loading,
    };
};
