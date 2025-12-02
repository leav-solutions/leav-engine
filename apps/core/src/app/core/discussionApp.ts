// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IDiscussionTargetRecord} from '_types/discussion';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IQueryInfos} from '_types/queryInfos';
import {type IGraphqlAppModule} from 'app/graphql/graphqlApp';
import {type IDiscussionDomain} from 'domain/discussion/discussionDomain';

export type ICoreImportApp = IGraphqlAppModule;

interface IDeps {
    'core.domain.discussion': IDiscussionDomain;
}

interface IDiscussionCommentInput {
    message: string;
    url: string;
    targetRecord: IDiscussionTargetRecord;
    threadId?: string;
    mentions?: {
        users?: string[];
    };
}

export default function ({'core.domain.discussion': discussionDomain}: IDeps): ICoreImportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type DiscussionComment {
                        id: ID!,
                    }

                    input DiscussionMentionInput {
                        users: [String!],
                    }
                    input DiscussionTargetRecordInput {
                        id: String!,
                        libraryId: String!,
                    }

                    input DiscussionCommentInput {
                        message: String!,
                        url: String!,
                        targetRecord: DiscussionTargetRecordInput!,
                        threadId: String,
                        mentions: DiscussionMentionInput,
                    }

                    extend type Mutation {
                        postDiscussionComment(comment: DiscussionCommentInput): DiscussionComment!
                    }
                `,
                resolvers: {
                    Mutation: {
                        async postDiscussionComment(
                            parent,
                            {comment}: {comment: IDiscussionCommentInput},
                            ctx: IQueryInfos,
                        ): Promise<{id: string}> {
                            const res = await discussionDomain.postDiscussionComment({
                                params: comment,
                                ctx,
                            });

                            return {id: res.id};
                        },
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
