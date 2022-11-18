// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IApiKeyDomain} from 'domain/apiKey/apiKeyDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IApiKey} from '_types/apiKey';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {USERS_LIBRARY} from '../../../_types/library';
import {AttributeCondition, IRecord} from '../../../_types/record';
import {IApiKeysArgs, IDeleteApiKeyArgs, ISaveApiKeyArgs} from './_types';

export interface ICoreVersionProfileApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.apiKey'?: IApiKeyDomain;
    'core.domain.record'?: IRecordDomain;
}

export default function ({
    'core.domain.apiKey': apiKeyDomain = null,
    'core.domain.record': recordDomain = null
}: IDeps): ICoreVersionProfileApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type ApiKey {
                        id: String!,
                        label: String,
                        key: String,
                        createdAt: Int!,
                        createdBy: User!,
                        modifiedAt: Int!,
                        modifiedBy: User!
                        expiresAt: Int,
                        user: User!
                    }

                    input ApiKeyInput {
                        id: String,
                        label: String!,
                        expiresAt: Int,
                        userId: String!,
                    }

                    input ApiKeysFiltersInput {
                        label: String,
                        user_id: String,
                        createdBy: Int,
                        modifiedBy: Int
                    }

                    enum ApiKeysSortableFields {
                        label,
                        expiresAt,
                        createdBy,
                        createdAt,
                        modifiedBy,
                        modifiedAt
                    }

                    input SortApiKeysInput {
                        field: ApiKeysSortableFields!
                        order: SortOrder
                    }

                    type ApiKeyList {
                        totalCount: Int!
                        list: [ApiKey!]!
                    }

                    extend type Query {
                        apiKeys(
                            filters: ApiKeysFiltersInput,
                            pagination: Pagination,
                            sort: SortApiKeysInput,
                        ): ApiKeyList!
                    }

                    extend type Mutation {
                        saveApiKey(apiKey: ApiKeyInput!): ApiKey!
                        deleteApiKey(id: String!): ApiKey!
                    }
                `,
                resolvers: {
                    Query: {
                        apiKeys(_, {filters, pagination, sort}: IApiKeysArgs, ctx: IQueryInfos) {
                            return apiKeyDomain.getApiKeys({
                                params: {filters, withCount: true, pagination, sort},
                                ctx
                            });
                        }
                    },
                    Mutation: {
                        saveApiKey(_, {apiKey}: ISaveApiKeyArgs, ctx: IQueryInfos) {
                            return apiKeyDomain.saveApiKey({apiKey, ctx});
                        },
                        deleteApiKey(_, {id}: IDeleteApiKeyArgs, ctx: IQueryInfos) {
                            return apiKeyDomain.deleteApiKey({id, ctx});
                        }
                    },
                    ApiKey: {
                        async user(apiKey: IApiKey, _, ctx: IQueryInfos): Promise<IRecord> {
                            const result = await recordDomain.find({
                                params: {
                                    library: USERS_LIBRARY,
                                    filters: [{field: 'id', condition: AttributeCondition.EQUAL, value: apiKey.userId}]
                                },
                                ctx
                            });

                            return result.list?.[0] ?? null;
                        },
                        async createdBy(apiKey: IApiKey, _, ctx: IQueryInfos): Promise<IRecord> {
                            const result = await recordDomain.find({
                                params: {
                                    library: USERS_LIBRARY,
                                    filters: [
                                        {field: 'id', condition: AttributeCondition.EQUAL, value: apiKey.createdBy}
                                    ]
                                },
                                ctx
                            });

                            return result.list?.[0] ?? null;
                        },
                        async modifiedBy(apiKey: IApiKey, _, ctx: IQueryInfos): Promise<IRecord> {
                            const result = await recordDomain.find({
                                params: {
                                    library: USERS_LIBRARY,
                                    filters: [
                                        {field: 'id', condition: AttributeCondition.EQUAL, value: apiKey.modifiedBy}
                                    ]
                                },
                                ctx
                            });

                            return result.list?.[0] ?? null;
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
