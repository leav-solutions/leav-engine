// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useCreateThread} from './useCreateThread';
import {useCreateComment} from './useCreateComment';
import {useGetThreadQuery} from '../../../__generated__';
import {useThreadStatusOptions} from '../useThreadStatusOption/useThreadStatusOptions';
import {WIP_STATUS} from '../threadConstants';

interface IUseThreadActions {
    recordId: string;
    libraryId: string;
}

export const usePostComment = ({recordId, libraryId}: IUseThreadActions) => {
    const {refetch} = useGetThreadQuery({variables: {libraryId, recordId}});
    const {t} = useTranslation();

    const createThread = useCreateThread();
    const createComment = useCreateComment();
    const statusesOptions = useThreadStatusOptions();

    const [isPosting, setIsPosting] = useState(false);

    const postComment = async (rawMessage: string, existingThreadId?: string) => {
        const message = rawMessage.trim();
        if (!message) {
            return;
        }
        setIsPosting(true);
        try {
            let threadId = existingThreadId;

            if (!threadId) {
                threadId = await createThread({
                    recordId,
                    libraryId,
                    label: `${recordId}-${libraryId}`,
                    status: statusesOptions.find(option => option.label === WIP_STATUS),
                });
            }

            await createComment({message, threadId});
            await refetch();
        } catch (err) {
            throw new Error(t('threads.post_error_title'));
        } finally {
            setIsPosting(false);
        }
    };

    return {
        postComment,
        isPosting,
    };
};
