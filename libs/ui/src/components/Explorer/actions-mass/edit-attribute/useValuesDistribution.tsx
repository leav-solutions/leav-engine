// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RecordFilterInput, useValuesOccurrencesQuery} from '_ui/_gqlTypes';

export const useValuesDistribution = ({
    attributeId,
    libraryId,
    recordFilters,
}: {
    attributeId: string;
    libraryId: string;
    recordFilters: RecordFilterInput[];
}): {
    noValueCount: number;
    distribution: Array<{
        count: number;
        treeNodeId: string;
    }>;
    loading: boolean;
} => {
    const {data: valuesOccurrences, loading} = useValuesOccurrencesQuery({
        variables: {
            attributeId,
            libraryId,
            recordFilters,
        },
    });

    const noValueCount =
        valuesOccurrences?.listDistinctValues?.find(
            treeOccurrence => !('treeNode' in treeOccurrence && treeOccurrence.treeNode),
        )?.count ?? 0;

    const distribution =
        valuesOccurrences?.listDistinctValues
            ?.map(treeOccurrence =>
                'treeNode' in treeOccurrence && treeOccurrence.treeNode
                    ? {
                          count: treeOccurrence.count,
                          treeNodeId: treeOccurrence.treeNode.id,
                      }
                    : null,
            )
            .filter(Boolean) ?? [];

    return {
        distribution,
        noValueCount,
        loading,
    };
};
