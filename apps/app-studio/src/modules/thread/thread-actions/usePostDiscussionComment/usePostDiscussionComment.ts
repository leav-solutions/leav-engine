import {useState} from 'react';
import {useLocation} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useCreateThread} from '../useCreateThread';
import {useGetThreadQuery, usePostDiscussionCommentMutation} from '../../../../__generated__';
import {useThreadStatusOptions} from '../../useThreadStatusOption/useThreadStatusOptions';
import {WIP_STATUS} from '../../threadConstants';
import {REDIRECT_URL_QUERY_PARAM} from '../../../ApplicationRouting/content/panel-custom/message-handlers/useNavigateToPanel';

interface IUseThreadActions {
    recordId: string;
    libraryId: string;
}

export const usePostDiscussionComment = ({recordId, libraryId}: IUseThreadActions) => {
    const {refetch} = useGetThreadQuery({variables: {libraryId, recordId}});
    const [postDiscussionCommentMutation] = usePostDiscussionCommentMutation();
    const {t} = useTranslation();

    const location = useLocation();
    const createThread = useCreateThread();
    const statusesOptions = useThreadStatusOptions();

    const [isPosting, setIsPosting] = useState(false);

    const postComment = async (rawMessage: string, existingThreadId?: string, users?: string[]) => {
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

            const searchParams = new URLSearchParams(location.search);
            const url = searchParams.get(REDIRECT_URL_QUERY_PARAM) || window.location.href;
            await postDiscussionCommentMutation({
                variables: {
                    comment: {
                        message,
                        targetRecord: {
                            id: recordId,
                            libraryId,
                        },
                        threadId,
                        mentions: {
                            users,
                            url,
                        },
                    },
                },
            });
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
