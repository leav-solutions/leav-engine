// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {UserCoreDataKeys, IUserDomain} from '../../domain/user/userDomain';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IUserData} from '_types/userData';

export interface ICoreImportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.user': IUserDomain;
}

export default function ({'core.domain.user': userDomain}: IDeps): ICoreImportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type UserData {
                        global: Boolean!,
                        data: Any
                    }

                    enum UserCoreDataKeys {
                        ${Object.values(UserCoreDataKeys).join(' ')}
                    }

                    extend type Mutation {
                        saveUserData(key: String!, value: Any, global: Boolean!): UserData!
                    }

                    extend type Query {
                        userData(keys: [String!]!, global: Boolean): UserData!
                    }
                `,
                resolvers: {
                    Query: {
                        async userData(
                            parent,
                            {keys, global}: {keys: string[]; global: boolean},
                            ctx: IQueryInfos
                        ): Promise<IUserData> {
                            return userDomain.getUserData(keys, global, ctx);
                        }
                    },
                    Mutation: {
                        async saveUserData(
                            parent,
                            {key, value, global}: {key: string; value: any; global: boolean},
                            ctx: IQueryInfos
                        ): Promise<IUserData> {
                            return userDomain.saveUserData({key, value, global, ctx});
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
