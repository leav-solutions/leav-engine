import {type IDiscussionTargetRecord} from '../../_types/discussion';
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {type IDiscussionDomain} from '../../domain/discussion/discussionDomain';

export type ICoreImportApp = IGraphqlAppModule;

interface IDeps {
    'core.domain.discussion': IDiscussionDomain;
}

interface IDiscussionCommentInput {
    message: string;
    targetRecord: IDiscussionTargetRecord;
    threadId?: string;
    mentions?: {
        url: string;
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

                    input DiscussionMentionsInput {
                        users: [String!],
                        url: String!,
                    }
                    input DiscussionTargetRecordInput {
                        id: String!,
                        libraryId: String!,
                    }

                    input DiscussionCommentInput {
                        message: String!,
                        targetRecord: DiscussionTargetRecordInput!,
                        threadId: String,
                        mentions: DiscussionMentionsInput,
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
