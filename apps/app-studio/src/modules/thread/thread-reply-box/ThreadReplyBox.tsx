// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type FormEvent, useState} from 'react';
import {KitAvatar, KitButton, KitRichText} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPaperPlane} from '@fortawesome/free-solid-svg-icons';
import {useTranslation} from 'react-i18next';
import {usePostComment} from '../thread-actions/usePostComment';
import {type IUserContextData} from '_ui/contexts';
import {replyBox, replyBoxButton} from './threadReplyBox.module.css';

export const ThreadReplyBox = ({
    recordId,
    libraryId,
    threadId,
    me,
}: {
    libraryId: string;
    recordId: string;
    threadId?: string;
    me: IUserContextData;
}) => {
    const {t} = useTranslation();
    const [message, setMessage] = useState('');

    const {postComment, isPosting} = usePostComment({
        recordId: recordId!,
        libraryId: libraryId!,
    });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!message) {
            return;
        }
        await postComment(message, threadId);
        setMessage('');
    };

    return (
        <div className={replyBox}>
            <KitAvatar label={me.userWhoAmI.label} />
            <KitRichText
                placeholder={t('threads.reply_placeholder')}
                value={message}
                onChange={setMessage}
                disabled={isPosting}
                mini
            />
            <KitButton
                icon={<FontAwesomeIcon icon={faPaperPlane} />}
                type="primary"
                size="m"
                htmlType="submit"
                disabled={isPosting || !message.trim()}
                loading={isPosting}
                className={replyBoxButton}
                onClick={handleSubmit}
            />
        </div>
    );
};
