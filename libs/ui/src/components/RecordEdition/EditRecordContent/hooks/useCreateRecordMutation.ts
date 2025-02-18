// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useCreateRecordMutation} from '_ui/_gqlTypes';
import {APICallStatus, CreateRecordFunc} from '../_types';

export interface ICreateRecordHook {
    createRecord: CreateRecordFunc;
}

export default function useExecuteCreateRecordMutation(): ICreateRecordHook {
    const [executeCreateRecord] = useCreateRecordMutation();

    return {
        createRecord: async (libraryId, values) => {
            const creationResult = await executeCreateRecord({
                variables: {library: libraryId, data: {values}}
            });
            if (creationResult.data.createRecord.valuesErrors?.length > 0) {
                return {
                    status: APICallStatus.ERROR,
                    errors: creationResult.data.createRecord.valuesErrors
                };
            } else {
                return {
                    status: APICallStatus.SUCCESS,
                    record: creationResult.data.createRecord.record.whoAmI
                };
            }
        }
    };
}
