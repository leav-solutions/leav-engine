import {ActionsListIOTypes} from '../../_types/actionsList';
import {IActionsListDomain} from 'domain/actionsListDomain';
import {IAppGraphQLSchema} from '../graphql/graphqlApp';

export interface ICoreAttributeApp {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

export default function(actionsListDomain: IActionsListDomain): ICoreAttributeApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum ActionIOTypes {
                        ${ActionsListIOTypes.STRING}
                        ${ActionsListIOTypes.NUMBER}
                        ${ActionsListIOTypes.BOOLEAN}
                        ${ActionsListIOTypes.OBJECT}
                    }

                    type ActionParam {
                        name: String,
                        type: String,
                        description: String
                    }

                    type Action {
                        name: String,
                        description: String,
                        inputTypes: [ActionIOTypes],
                        outputTypes: [ActionIOTypes],
                        params: [ActionParam]
                    }

                    extend type Query {
                        availableActions: [Action]
                    }
                `,
                resolvers: {
                    Query: {
                        async availableActions(parent, args) {
                            return actionsListDomain.getAvailableActions();
                        }
                    },
                    Mutation: {}
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
