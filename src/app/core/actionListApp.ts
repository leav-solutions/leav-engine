import {IActionsListDomain} from 'domain/actionsList/actionsListDomain';
import {i18n} from 'i18next';
import {IAppGraphQLSchema} from '_types/graphql';
import {IAppModule} from '_types/shared';
import {ActionsListEvents, ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export interface ICoreActionListApp extends IAppModule {
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.actionsList'?: IActionsListDomain;
    translator?: i18n;
}

export default function({'core.domain.actionsList': actionsListDomain = null, translator = null}): ICoreActionListApp {
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
                        name: String!,
                        type: String!,
                        description: String,
                        required: Boolean,
                        default_value: String
                    }

                    type Action {
                        id: ID!,
                        name: String!,
                        description: String,
                        input_types: [ActionIOTypes!]!,
                        output_types: [ActionIOTypes!]!,
                        params: [ActionParam!]
                    }

                    type ActionConfiguration {
                        id: ID!,
                        name: String!,
                        is_system: Boolean!,
                        params: [ActionConfigurationParam!]
                    }

                    type ActionsListConfiguration {
                        ${ActionsListEvents.SAVE_VALUE}: [ActionConfiguration!]
                        ${ActionsListEvents.GET_VALUE}: [ActionConfiguration!]
                        ${ActionsListEvents.DELETE_VALUE}: [ActionConfiguration!]
                    }

                    input ActionsListConfigurationInput {
                        ${ActionsListEvents.SAVE_VALUE}: [ActionConfigurationInput!]
                        ${ActionsListEvents.GET_VALUE}: [ActionConfigurationInput!]
                        ${ActionsListEvents.DELETE_VALUE}: [ActionConfigurationInput!]
                    }

                    input ActionConfigurationInput {
                        id: ID!,
                        params: [ActionConfigurationParamInput!]
                    }

                    type ActionConfigurationParam {
                        name: String!,
                        value: String!
                    }

                    input ActionConfigurationParamInput {
                        name: String!,
                        value: String!
                    }

                    extend type Query {
                        availableActions: [Action!]
                    }
                `,
                resolvers: {
                    Query: {
                        async availableActions(parent, args, ctx) {
                            const availableActions = actionsListDomain.getAvailableActions();

                            const translatedActionList = availableActions.map(action => {
                                action.description = translator.t(('actions.descriptions.' + action.id) as string, {
                                    lng: ctx.lang,
                                    interpolation: {escapeValue: false}
                                });
                                action.name = translator.t(('actions.names.' + action.id) as string, {
                                    lng: ctx.lang,
                                    interpolation: {escapeValue: false}
                                });
                                return action;
                            });

                            return translatedActionList;
                        }
                    },
                    Mutation: {}
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
        extensionPoints: {
            registerActions: (actionArray?: IActionsListFunction[]) => {
                actionsListDomain.registerActions(actionArray);
            }
        }
    };
}
