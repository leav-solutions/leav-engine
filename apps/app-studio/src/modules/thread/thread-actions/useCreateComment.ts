// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useCreateRecordMutation, useSaveValueBatchMutation} from '_ui/_gqlTypes';

import {
    THREADS_LIBRARY_ID,
    THREAD_COMMENTS_ATTRIBUTE_ID,
    COMMENTS_LIBRARY_ID,
    COMMENT_CONTENT_ATTRIBUTE_ID,
    COMMENT_THREAD_ATTRIBUTE_ID,
} from '../threadConstants';

interface ICreateComment {
    message: string;
    threadId: string;
}

export const useCreateComment = () => {
    const [createRecordMutation] = useCreateRecordMutation();
    const [saveValueBatchMutation] = useSaveValueBatchMutation();

    return async ({message, threadId}: ICreateComment) => {
        const {data} = await createRecordMutation({
            variables: {
                library: COMMENTS_LIBRARY_ID,
                data: {
                    values: [
                        {
                            attribute: COMMENT_CONTENT_ATTRIBUTE_ID,
                            payload: message,
                            id_value: null,
                        },
                        {
                            attribute: COMMENT_THREAD_ATTRIBUTE_ID,
                            payload: threadId,
                            id_value: null,
                        },
                    ],
                },
            },
        });
        const commentId = data?.createRecord.record?.id;
        if (!commentId) {
            throw new Error('Erreur lors de la création du commentaire.');
        }
        await saveValueBatchMutation({
            variables: {
                library: THREADS_LIBRARY_ID,
                recordId: threadId,
                values: [
                    {
                        attribute: THREAD_COMMENTS_ATTRIBUTE_ID,
                        payload: commentId,
                        id_value: null,
                    },
                ],
            },
        });
    };
};
