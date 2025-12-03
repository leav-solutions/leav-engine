// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {
    type IDiscussionComment,
    type IDiscussionTargetRecord,
    type IPostDiscussionCommentParams,
} from '_types/discussion';
import {type IQueryInfos} from '_types/queryInfos';
import {type INotificationDomain} from 'domain/notification/notificationDomain';
import {type IRecordDomain} from 'domain/record/recordDomain';
import {type IValueDomain} from 'domain/value/valueDomain';
import {type IUserDomain} from 'domain/user/userDomain';
import {type i18n} from 'i18next';
import {type IConfig} from '_types/config';
import {
    DISCUSSION_COMMENT_CONTENT_ATTRIBUTE_ID,
    DISCUSSION_COMMENT_THREAD_ATTRIBUTE_ID,
    DISCUSSION_COMMENTS_LIBRARY_ID,
    DISCUSSION_THREAD_COMMENTS_ATTRIBUTE_ID,
    DISCUSSION_THREADS_LIBRARY_ID,
} from '../../_constants/discussions';
import {USERS_LIBRARY} from '../../_types/library';
import {AttributeCondition, Operator, type IRecord} from '../../_types/record';

export interface IDiscussionDomain {
    postDiscussionComment(params: {
        params?: IPostDiscussionCommentParams;
        ctx: IQueryInfos;
    }): Promise<IDiscussionComment>;
}

export interface IDiscussionDomainDeps {
    'core.domain.notification': INotificationDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.value': IValueDomain;
    'core.domain.user': IUserDomain;
    translator: i18n;
    config: IConfig;
}

export default function ({
    'core.domain.notification': notificationDomain,
    'core.domain.record': recordDomain,
    'core.domain.value': valueDomain,
    'core.domain.user': userDomain,
    translator,
    config,
}: IDiscussionDomainDeps): IDiscussionDomain {
    const checkMentionedUsersExists = async (userMentions: string[] | undefined, ctx: IQueryInfos) => {
        if (userMentions?.length > 0) {
            const mentionedUsers = await recordDomain.find({
                params: {
                    library: USERS_LIBRARY,
                    filters: userMentions.reduce((acc, userId, index) => {
                        if (index > 0) {
                            acc.push({operator: Operator.OR});
                        }

                        const filter = {
                            field: 'id',
                            condition: AttributeCondition.EQUAL,
                            value: userId,
                        };
                        acc.push(filter);
                        return acc;
                    }, []),
                    retrieveInactive: true,
                },
                ctx,
            });
            if (mentionedUsers.list.length !== userMentions.length) {
                throw new Error('One or more mentioned users do not exist');
            }
        }
    };

    const checkThreadRecordExists = async (threadId: string, ctx: IQueryInfos): Promise<IRecord> => {
        const resThreads = await recordDomain.find({
            params: {
                library: DISCUSSION_THREADS_LIBRARY_ID,
                filters: [
                    {
                        field: 'id',
                        condition: AttributeCondition.EQUAL,
                        value: threadId,
                    },
                ],
            },
            ctx,
        });

        if (resThreads.list.length === 0) {
            throw new Error(`Discussion thread with ID ${threadId} does not exist`);
        }

        return resThreads.list[0];
    };

    const checkTargetRecordExists = async (
        targetRecord: IDiscussionTargetRecord,
        ctx: IQueryInfos,
    ): Promise<IRecord> => {
        const resTargetRecord = await recordDomain.find({
            params: {
                library: targetRecord.libraryId,
                filters: [
                    {
                        field: 'id',
                        condition: AttributeCondition.EQUAL,
                        value: targetRecord.id,
                    },
                ],
            },
            ctx,
        });

        if (resTargetRecord.list.length === 0) {
            throw new Error(
                `Discussion target with ID ${targetRecord.id} on library ${targetRecord.libraryId} does not exist`,
            );
        }

        return resTargetRecord.list[0];
    };

    const checkUrlMatchInstanceConfig = (url: string | undefined) => {
        if (url && !url.startsWith(config.server.publicUrl)) {
            throw new Error('The provided URL does not match the instance URL configuration');
        }
    };

    return {
        async postDiscussionComment({params, ctx}) {
            // Here we may create the thread later instead of creating it in frontend
            if (!params.threadId) {
                throw new Error('Thread ID is required to post a comment');
            }

            const targetRecord = await checkTargetRecordExists(params.targetRecord, ctx);
            await checkThreadRecordExists(params.threadId, ctx);
            await checkUrlMatchInstanceConfig(params.mentions?.url);
            await checkMentionedUsersExists(params.mentions?.users, ctx);

            // TODO check permission on target record / thread later

            const result = await recordDomain.createRecord({
                library: DISCUSSION_COMMENTS_LIBRARY_ID,
                values: [
                    {
                        attribute: DISCUSSION_COMMENT_CONTENT_ATTRIBUTE_ID,
                        payload: params.message,
                        id_value: null,
                    },
                    {
                        attribute: DISCUSSION_COMMENT_THREAD_ATTRIBUTE_ID,
                        payload: params.threadId,
                        id_value: null,
                    },
                ],
                verifyRequiredAttributes: false,
                ctx,
            });

            if (result.valuesErrors?.length > 0) {
                throw new Error('Error creating discussion comment', {cause: result.valuesErrors});
            }

            // Instead of create double link, this one should have be a simple reverse link of COMMENT_THREAD_ATTRIBUTE_ID
            await valueDomain.saveValue({
                library: DISCUSSION_THREADS_LIBRARY_ID,
                recordId: params.threadId,
                attribute: DISCUSSION_THREAD_COMMENTS_ATTRIBUTE_ID,
                value: {
                    payload: result.record.id,
                },
                ctx,
            });

            logger.debug(`Discussion comment created recordId=${result.record.id} threadId=${params.threadId}`);

            if (params.mentions?.users?.length > 0) {
                const author = await (await userDomain.getUserIdentity(ctx.userId, ctx)).getLabel();
                const recordLabel = await (await recordDomain.getRecordIdentity(targetRecord, ctx)).getLabel?.();
                const notificationMessage = recordLabel
                    ? translator.t('notifications.discussion_comment_mention_message_with_record_label', {
                          lng: ctx.lang,
                          author,
                          recordLabel,
                      })
                    : translator.t('notifications.discussion_comment_mention_message_without_record_label', {
                          lng: ctx.lang,
                          author,
                      });

                await notificationDomain.createNotification(
                    {
                        content: {
                            level: 'success',
                            title: translator.t('notifications.discussion_comment_mention_title', {lng: ctx.lang}),
                            message: notificationMessage,
                            relatedEntities: [
                                {
                                    label: translator.t('notifications.discussion_comment_mention_link_label', {
                                        lng: ctx.lang,
                                    }),
                                    url: params.mentions.url || config.server.publicUrl,
                                },
                            ],
                        },
                        recipients: {
                            userIds: params.mentions.users,
                            groupIds: [],
                        },
                        emitterUserId: ctx.userId,
                        priority: 'normal',
                    },
                    ctx,
                );
            }

            return {
                id: result.record.id,
            };
        },
    };
}
