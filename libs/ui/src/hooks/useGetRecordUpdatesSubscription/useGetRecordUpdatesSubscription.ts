import {useValuesCacheUpdate} from '_ui/hooks/useValuesCacheUpdate';
import {type RecordUpdateFilterInput, useRecordUpdateSubscription} from '_ui/_gqlTypes';

export const useGetRecordUpdatesSubscription = (filters: RecordUpdateFilterInput, skip?: boolean) => {
    const updateValuesCache = useValuesCacheUpdate();

    return useRecordUpdateSubscription({
        skip,
        variables: {filters},
        onData: ({data}) => {
            const {record, updatedValues} = data.data.recordUpdate;
            updateValuesCache(
                record.whoAmI,
                updatedValues.map(val => val.value),
            );
        },
    });
};
