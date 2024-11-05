// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useValuesCacheUpdate} from '_ui/hooks/useValuesCacheUpdate';
import {RecordUpdateFilterInput, useRecordUpdateSubscription} from '_ui/_gqlTypes';

export const useGetRecordUpdatesSubscription = (filters: RecordUpdateFilterInput, skip?: boolean) => {
    const updateValuesCache = useValuesCacheUpdate();

    return useRecordUpdateSubscription({
        skip,
        variables: {filters},
        onData: ({data}) => {
            const {record, updatedValues} = data.data.recordUpdate;
            updateValuesCache(
                record.whoAmI,
                updatedValues.map(val => val.value)
            );
        }
    });
};
