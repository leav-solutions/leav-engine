// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useCreateRecordMutation, useSaveValueBatchMutation} from '_ui/_gqlTypes';
import {THREADS_LIBRARY_ID, DISCUSSION_THREADS_ATTRIBUTE_ID, THREAD_STATUS_ATTIBUTE_ID} from '../threadConstants';
import {type IStatusOption} from '../useThreadStatusOption/useThreadStatusOptions';

interface ICreateThread {
    recordId: string;
    libraryId: string;
    label: string;
    status: IStatusOption | undefined;
}

export const useCreateThread = () => {
    const [createRecordMutation] = useCreateRecordMutation();
    const [saveValueBatchMutation] = useSaveValueBatchMutation();

    return async ({recordId, libraryId, label, status}: ICreateThread) => {
        const values = [{attribute: 'label', payload: label, id_value: null}];
        if (status?.value) {
            values.push({attribute: THREAD_STATUS_ATTIBUTE_ID, payload: status.value, id_value: null});
        }
        const {data} = await createRecordMutation({
            variables: {library: THREADS_LIBRARY_ID, data: {values}},
        });

        const threadId = data?.createRecord.record?.id;
        if (!threadId) {
            throw new Error('Erreur lors de la création du fil de discussion.');
        }

        await saveValueBatchMutation({
            variables: {
                library: libraryId,
                recordId,
                values: [
                    {
                        attribute: DISCUSSION_THREADS_ATTRIBUTE_ID,
                        payload: threadId,
                        id_value: null,
                    },
                ],
            },
        });

        return threadId;
    };
};
