import {type Client as GraphqlWsClient} from 'graphql-ws';
import {AttributeCondition} from '../../../../_types/record';
import {
    DISCUSSION_COMMENT_CONTENT_ATTRIBUTE_ID,
    DISCUSSION_COMMENT_THREAD_ATTRIBUTE_ID,
    DISCUSSION_COMMENTS_LIBRARY_ID,
    DISCUSSION_THREAD_COMMENTS_ATTRIBUTE_ID,
    DISCUSSION_THREADS_LIBRARY_ID,
} from '../../../../_constants/discussions';
import {adminUserId} from '../../../../_constants/users';
import {getConfig} from '../../../../config';
import {type IConfig} from '../../../../_types/config';
import {
    adminUserSdk,
    e2eAdminUser,
    e2eGuestUser,
    e2eNonAdminUser,
    gqlCreateRecord,
    gqlSaveAttribute,
    makeGraphQlCall,
    makeWebSocketGraphQlCall,
    waitGraphqlWebSocketMessage,
} from '../e2eUtils';
import {deleteMailpitMessagesBySearch, getMailpitMessage, waitForMailpitSearchMessage} from '../mailpitUtils';
import {GUEST_USER_EMAIL, NON_ADMIN_USER_EMAIL} from '../constants';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';

describe('Discussion', () => {
    const targetLibId = 'discussion_test_lib';
    const targetLibLabelAttr = 'discussion_test_lib_label_attr';
    let targetRecordIdWithLabel: string;
    let targetRecordIdWithoutLabel: string;
    const targetRecordLabelWith = 'Record with label';
    let config: IConfig;
    let adminWsClient: GraphqlWsClient;

    beforeAll(async () => {
        config = await getConfig();
        await gqlSaveAttribute({
            id: targetLibLabelAttr,
            label: 'Test attribute',
            type: AttributeTypes.SIMPLE,
            format: AttributeFormats.TEXT,
        });
        await makeGraphQlCall(
            `mutation {
            saveLibrary(library: {
                id: "${targetLibId}",
                label: {en: "Test discussion lib"},
                attributes: ["${targetLibLabelAttr}"]
                recordIdentityConf: {
                    label: "${targetLibLabelAttr}",
                }
            }) { id }
        }`,
        );

        await adminUserSdk.SaveLibrary({
            library: {id: targetLibId, label: {en: 'Test discussion lib'}, attributes: [targetLibLabelAttr]},
        });
        targetRecordIdWithoutLabel = await gqlCreateRecord(targetLibId);
        const resCreateRecord = await makeGraphQlCall(`mutation {
            c1: createRecord(library: "${targetLibId}", data: {
                values: [{ attribute: "${targetLibLabelAttr}", payload: "${targetRecordLabelWith}" }]
            }) { record {id} },
            c2: createRecord(library: "${targetLibId}") { record {id} },
        }`);
        targetRecordIdWithLabel = resCreateRecord.data.data.c1.record.id;
        targetRecordIdWithoutLabel = resCreateRecord.data.data.c2.record.id;

        adminWsClient = await makeWebSocketGraphQlCall({user: e2eAdminUser()});
    });

    afterAll(() => {
        adminWsClient?.dispose();
    });

    beforeEach(async () => {
        deleteMailpitMessagesBySearch('mentioned in a comment');
    });

    describe('One thread exists', () => {
        let threadId: string;
        beforeAll(async () => {
            threadId = await gqlCreateRecord(DISCUSSION_THREADS_LIBRARY_ID);

            deleteMailpitMessagesBySearch('mentioned in a comment');
        });

        test('post comment should throw if target record not exists', async () => {
            await expect(
                makeGraphQlCall(`mutation {
                postDiscussionComment(comment: {
                    message: "This comment should fail",
                    targetRecord: {
                        id: "non_existing_id",
                        libraryId: "${targetLibId}"
                    },
                    threadId: "${threadId}",
                }) {
                    id
                }
            }`),
            ).rejects.toThrow(/Discussion target with ID .* on library .* does not exist/);
        });

        test('post comment should throw if url does not match instance public url', async () => {
            await expect(
                makeGraphQlCall(`mutation {
                postDiscussionComment(comment: {
                    message: "This comment should fail",
                    targetRecord: {
                        id: "${targetRecordIdWithLabel}",
                        libraryId: "${targetLibId}"
                    },
                    threadId: "${threadId}",
                    mentions: {
                        url: "http://no-matching-domain.com/record/1"
                    }
                }) {
                    id
                }
            }`),
            ).rejects.toThrow(/The provided URL does not match the instance URL configuration/);
        });

        test('post comment without user mentions', async () => {
            const commentMessage = 'This is a test comment without user mentions';

            const resPostComment = await makeGraphQlCall(`mutation {
                postDiscussionComment(comment: {
                    message: "${commentMessage}",
                    targetRecord: {
                        id: "${targetRecordIdWithLabel}",
                        libraryId: "${targetLibId}"
                    },
                    threadId: "${threadId}"
                }) {
                    id
                }
            }`);

            expect(resPostComment.data.data.postDiscussionComment.id).toBeTruthy();

            const resComment = await makeGraphQlCall(`
                {
                    records(
                        library: "${DISCUSSION_COMMENTS_LIBRARY_ID}",
                        filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${resPostComment.data.data.postDiscussionComment.id}"}]
                    ) {
                        list {
                            id
                            content: property(attribute: "${DISCUSSION_COMMENT_CONTENT_ATTRIBUTE_ID}") {
                                ... on Value {
                                    payload
                                }
                            }
                            author: property(attribute: "created_by") {
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                            thread: property(attribute: "${DISCUSSION_COMMENT_THREAD_ATTRIBUTE_ID}") {
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            expect(resComment.data.data.records.list).toHaveLength(1);
            expect(resComment.data.data.records.list[0].id).toBe(resPostComment.data.data.postDiscussionComment.id);
            expect(resComment.data.data.records.list[0].content[0].payload).toBe(commentMessage);
            expect(resComment.data.data.records.list[0].author[0].payload.id).toBe(adminUserId);
            expect(resComment.data.data.records.list[0].thread[0].payload.id).toBe(threadId);

            const resThread = await makeGraphQlCall(`
                {
                    records(
                        library: "${DISCUSSION_THREADS_LIBRARY_ID}",
                        filters: [{field: "id", condition: ${AttributeCondition.EQUAL}, value: "${threadId}"}]
                    ) {
                        list {
                            id
                            comments: property(attribute: "${DISCUSSION_THREAD_COMMENTS_ATTRIBUTE_ID}") {
                                ... on LinkValue {
                                    payload {
                                        id
                                    }
                                }
                            }
                        }
                    }
                }
            `);

            expect(resThread.data.data.records.list).toHaveLength(1);
            expect(resThread.data.data.records.list[0].id).toBe(threadId);
            expect(resThread.data.data.records.list[0].comments.map((c: any) => c.payload.id)).toContain(
                resPostComment.data.data.postDiscussionComment.id,
            );
        });

        test('post comment with user mentions should send notification to them', async () => {
            const commentMessage = 'This is a test comment with user mentions';
            const commentUrl = `${config.server.publicUrl}/record/1`;
            const usersToMention = [e2eGuestUser().userId, e2eNonAdminUser().userId];

            const resPostComment = await makeGraphQlCall(`mutation {
                postDiscussionComment(comment: {
                    message: "${commentMessage}",
                    targetRecord: {
                        id: "${targetRecordIdWithoutLabel}",
                        libraryId: "${targetLibId}"
                    },
                    threadId: "${threadId}",
                    mentions: {
                        users: [${usersToMention.map(u => `"${u}"`).join(', ')}],
                        url: "${commentUrl}"
                    }
                }) {
                    id
                }
            }`);

            expect(resPostComment.data.data.postDiscussionComment.id).toBeTruthy();

            const nonAdminUSerMessages = await waitForMailpitSearchMessage(
                `"mentioned in a comment" to:${NON_ADMIN_USER_EMAIL}`,
            );
            expect(nonAdminUSerMessages).toHaveLength(1);
            const guestUserMessages = await waitForMailpitSearchMessage(
                `"mentioned in a comment" to:${GUEST_USER_EMAIL}`,
            );
            expect(guestUserMessages).toHaveLength(1);

            const message = await getMailpitMessage(guestUserMessages[0].ID);
            expect(message.Subject).toContain('You were mentioned in a comment');
            expect(message.HTML).toContain('You were mentioned by admin in a comment.');
            expect(message.HTML).toContain(commentUrl);
        });

        test('post comment with user mentions should send notification to them (with record label)', async () => {
            const commentMessage = 'This is a test comment with user mentions, with record label';
            const commentUrl = `${config.server.publicUrl}/record/1`;

            const resPostComment = await makeGraphQlCall(`mutation {
                postDiscussionComment(comment: {
                    message: "${commentMessage}",
                    targetRecord: {
                        id: "${targetRecordIdWithLabel}",
                        libraryId: "${targetLibId}"
                    },
                    threadId: "${threadId}",
                    mentions: {
                        users: ["${e2eGuestUser().userId}"]
                        url: "${commentUrl}"
                    }
                }) {
                    id
                }
            }`);

            expect(resPostComment.data.data.postDiscussionComment.id).toBeTruthy();

            const guestUserMessages = await waitForMailpitSearchMessage(
                `"mentioned in a comment" to:${GUEST_USER_EMAIL}`,
            );
            expect(guestUserMessages).toHaveLength(1);

            const message = await getMailpitMessage(guestUserMessages[0].ID);
            expect(message.Subject).toContain('You were mentioned in a comment');
            expect(message.HTML).toContain(`You were mentioned by admin in a comment on ${targetRecordLabelWith}.`);
            expect(message.HTML).toContain(commentUrl);
        });

        test('post comment should send pubsub event RECORD_NEW_COMMENT', async () => {
            const commentMessage = 'This is a test comment to test pubsub event';

            const discussionSubscriptionQuery = `
                subscription {
                    recordNewComment(filters: {
                        records: ["${targetRecordIdWithLabel}"]
                    }) {
                        record {
                            whoAmI {
                                label
                                id
                            }
                        }
                        comment {
                            whoAmI {
                                label
                                id
                            }
                        }
                    }
                }
            `;
            const res = waitGraphqlWebSocketMessage<{
                recordNewComment: {
                    record: {whoAmI: {label: string; id: string}};
                    comment: {whoAmI: {label: string; id: string}};
                };
            }>(
                adminWsClient,
                discussionSubscriptionQuery,
                {},
                data => data?.recordNewComment?.record?.whoAmI?.id === targetRecordIdWithLabel,
                {timeoutMs: 20_000},
            );

            await new Promise(resolve => setTimeout(resolve, 100)); // wait a bit to be sure subscription is well set before posting the comment

            const resPostComment = await adminUserSdk.PostDiscussionComment({
                comment: {
                    message: commentMessage,
                    targetRecord: {
                        id: targetRecordIdWithLabel,
                        libraryId: targetLibId,
                    },
                    threadId,
                },
            });

            expect(resPostComment.postDiscussionComment.id).toEqual(expect.any(String));

            const commentNotification = await res;

            expect(commentNotification.recordNewComment.comment.whoAmI.id).toBe(
                resPostComment.postDiscussionComment.id,
            );
            expect(commentNotification.recordNewComment.record.whoAmI.id).toBe(targetRecordIdWithLabel);
        });
    });
});
