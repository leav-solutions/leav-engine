import {UserCoreDataKeys, type IUserDomain} from '../../domain/user/userDomain';
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IUserData} from '../../_types/userData';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';

export type ICoreImportApp = IGraphqlAppModule;

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
                            ctx: IQueryInfos,
                        ): Promise<IUserData> {
                            return userDomain.getUserData(keys, global, ctx);
                        },
                    },
                    Mutation: {
                        async saveUserData(
                            parent,
                            {key, value, global}: {key: string; value: any; global: boolean},
                            ctx: IQueryInfos,
                        ): Promise<IUserData> {
                            return userDomain.saveUserData({key, value, global, ctx});
                        },
                    },
                },
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
    };
}
