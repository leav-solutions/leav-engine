// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
