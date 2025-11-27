// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    type CountValuesOccurrencesQuery,
    type RecordFilterInput,
    useCountValuesOccurrencesLazyQuery,
} from '_ui/_gqlTypes';
import {useEffect} from 'react';

export type ValuesOccurrences = NonNullable<CountValuesOccurrencesQuery['countValuesOccurrences']> & {
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

    return {
        occurrences: valuesOccurrences?.countValuesOccurrences?.occurrences || [],
        noValueCount: valuesOccurrences?.countValuesOccurrences?.noValueCount || 0,
        loading,
    };
};
