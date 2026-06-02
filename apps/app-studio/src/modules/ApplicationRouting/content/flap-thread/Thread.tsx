import {KitDivider, KitEmpty, KitAvatar, KitThread, KitComment, KitLoader} from 'aristid-ds';
import {type FunctionComponent, useEffect, useRef} from 'react';
import {ThreadReplyBox} from './thread-reply-box/ThreadReplyBox';
import {useParams} from 'react-router-dom';
import {useThreads} from './useThreads/useThreads';
import {StatusBar} from './thread-status-bar/ThreadStatusBar';
import {useUser} from '_ui/hooks';
import {sidePanel, container, center} from './thread.module.css';
import cn from 'classnames';

export const Thread: FunctionComponent = () => {
    const {userData} = useUser();
    const {workspaceId, panelId, recordId, where, recordPanelId, flapRecordId, flapLibraryId} = useParams();

    const {threads, loading, editRecordPermission} = useThreads(flapRecordId, flapLibraryId);
    const mainThread = threads[0];
    const showReplyBox = userData && (editRecordPermission || mainThread);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({behavior: 'smooth'});
        }
    }, [mainThread?.comments]);

    if (loading) {
        return <KitLoader className={center} />;
    }

    return (
        <div className={cn('thread', sidePanel)}>
            {mainThread ? (
                <>
                    <StatusBar threadId={mainThread.id} threadStatusId={mainThread.status} />
                    <KitDivider noMargin />
                    <KitThread className={container}>
                        {mainThread.comments.map(comment => (
                            <KitComment
                                key={comment.id}
                                content={comment.content}
                                date={comment.createdAt}
                                name={comment.author.name}
                                avatar={<KitAvatar label={comment.author.name} />}
                                isCurrentUser={comment.author.id === userData?.userId}
                            />
                        ))}
                        <div ref={bottomRef} />
                    </KitThread>
                </>
            ) : (
                <KitEmpty className={center} />
            )}
            <KitDivider noMargin />
            {showReplyBox && (
                <ThreadReplyBox
                    recordId={flapRecordId}
                    libraryId={flapLibraryId}
                    threadId={mainThread?.id}
                    me={userData}
                />
            )}
        </div>
    );
};
