import {IUtils} from 'utils/utils';
import {IAppGraphQLSchema, IGraphqlApp} from '../graphql/graphqlApp';

export interface ICorePermissionApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(graphqlApp: IGraphqlApp, utils: IUtils): ICorePermissionApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum PermissionsRelation {
                        AND
                        OR
                    }

                    type TreePermissionsConf {
                        trees: [ID],
                        relation: PermissionsRelation
                    }

                    input TreePermissionsConfInput {
                        trees: [ID]!,
                        relation: PermissionsRelation!
                    }
                `,
                resolvers: {}
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
