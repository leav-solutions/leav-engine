import {useCreateEmptyRecordMutation} from '_ui/_gqlTypes';
import {APICallStatus, type CreateEmptyRecordFunc} from '../_types';

export interface ICreateRecordHook {
    createEmptyRecord: CreateEmptyRecordFunc;
}

export default function useExecuteCreateEmptyRecordMutation(): ICreateRecordHook {
    const [executeCreateEmptyRecord] = useCreateEmptyRecordMutation();

    return {
        createEmptyRecord: async libraryId => {
            const creationResult = await executeCreateEmptyRecord({
                variables: {library: libraryId},
            });
            return {
                status: APICallStatus.SUCCESS,
                record: creationResult.data.createEmptyRecord.record.whoAmI,
            };
        },
    };
}
