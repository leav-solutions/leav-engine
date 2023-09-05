import {useSubscription} from '@apollo/client';
import {getRecordUpdates} from 'graphQL/subscribes/records/getRecordUpdates';
import {RecordUpdateFilterInput} from '_gqlTypes/globalTypes';
import {SUB_RECORD_UPDATE, SUB_RECORD_UPDATEVariables} from '_gqlTypes/SUB_RECORD_UPDATE';

export const useRecordUpdateSubscription = (filters: RecordUpdateFilterInput, skip?: boolean) => {
    return useSubscription<SUB_RECORD_UPDATE, SUB_RECORD_UPDATEVariables>(getRecordUpdates, {
        variables: {filters},
        skip
    });
};
