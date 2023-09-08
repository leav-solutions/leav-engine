// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useSubscription} from '@apollo/client';
import {getRecordUpdates} from 'graphQL/subscribes/records/getRecordUpdates';
import {useValuesCacheUpdate} from 'hooks/useValuesCacheUpdate';
import {RecordUpdateFilterInput} from '_gqlTypes/globalTypes';
import {SUB_RECORD_UPDATE, SUB_RECORD_UPDATEVariables} from '_gqlTypes/SUB_RECORD_UPDATE';

export const useRecordUpdateSubscription = (filters: RecordUpdateFilterInput, skip?: boolean) => {
    const updateValuesCache = useValuesCacheUpdate();

    return useSubscription<SUB_RECORD_UPDATE, SUB_RECORD_UPDATEVariables>(getRecordUpdates, {
        skip,
        variables: {filters},
        onSubscriptionData: ({subscriptionData}) => {
            const {record, updatedValues} = subscriptionData.data.recordUpdate;
            updateValuesCache(
                record.whoAmI,
                updatedValues.map(val => val.value)
            );
        }
    });
};
