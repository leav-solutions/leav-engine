// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IUserDataDomain} from 'domain/userData/userDataDomain';
import {IAppGraphQLSchema} from '_types/graphql';
import {IQueryInfos} from '_types/queryInfos';
import {IUserData} from '_types/userData';

export interface ICoreImportApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.userData'?: IUserDataDomain;
}

export default function ({'core.domain.userData': userDataDomain = null}: IDeps = {}): ICoreImportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type UserData {
                        global: Boolean!,
                        data: Any
                    }

                    extend type Mutation {
                        saveUserData(key: String!, value: Any, global: Boolean!): Any
                    }

                    extend type Query {
                        userData(key: String!, global: Boolean): UserData!
                    }
                `,
                resolvers: {
                    Query: {
                        async userData(
                            parent,
                            {key, global}: {key: string; global: boolean},
                            ctx: IQueryInfos
                        ): Promise<IUserData> {
                            return userDataDomain.getUserData(key, global, ctx);
                        }
                    },
                    Mutation: {
                        async saveUserData(
                            parent,
                            {key, value, global}: {key: string; value: any; global: boolean},
                            ctx: IQueryInfos
                        ): Promise<any> {
                            return userDataDomain.saveUserData(key, value, global, ctx);
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
