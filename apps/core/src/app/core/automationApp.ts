// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {type IAutomationDomain} from '../../domain/automation/automationDomain';
import {
    type ICreateAutomationRule,
    type IAutomationRule,
    type IUpdateAutomationRule,
    SyncAutomationRuleEventAction,
} from '../../_types/automation';
import {type IPaginationParams, type ISortParams, type IList} from '../../_types/list';
import {type IEventsManagerDomain} from '../../domain/eventsManager/eventsManagerDomain';
import {
    AutomationTriggerDefSynchronicity,
    AutomationTriggerDefTopics,
    type AutomationTriggerDef,
    type IAutomationTriggers,
} from '../../domain/automation/automationTriggers';

export type ICoreImportApp = IGraphqlAppModule;

interface IAutomationAppDeps {
    'core.domain.automation': IAutomationDomain;
    'core.domain.automation.triggers': IAutomationTriggers;
    'core.domain.eventsManager': IEventsManagerDomain;
}

export interface IGetAutomationRulesArgs {
    filters?: ICoreEntityFilterOptions & {
        active?: boolean;
        synchronous?: boolean;
        eventAction?: IAutomationRule['trigger']['eventAction'];
        eventTopic?: IAutomationRule['trigger']['eventTopic'];
    };
    pagination?: IPaginationParams;
    sort?: ISortParams;
}

export default function ({
    'core.domain.automation': automationDomain,
    'core.domain.automation.triggers': automationTriggers,
    'core.domain.eventsManager': eventsManagerDomain,
}: IAutomationAppDeps): ICoreImportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum AutomationRuleEventAction {
                        ${Object.values(SyncAutomationRuleEventAction).join(' ')}
                        ${eventsManagerDomain.getActions().join('\n')}
                    }
                    enum AutomationTriggerDefSynchronicity {
                        ${Object.values(AutomationTriggerDefSynchronicity).join('\n')}
                    }
                    enum AutomationTriggerDefTopics {
                        ${Object.values(AutomationTriggerDefTopics).join('\n')}
                    }
                
                    type AutomationTriggerDef {
                        eventAction: AutomationRuleEventAction!,
                        topics: [AutomationTriggerDefTopics!]!,
                        synchronicity: AutomationTriggerDefSynchronicity!,
                    }

                    type AutomationRuleTrigger {
                        synchronous: Boolean!,
                        eventAction: AutomationRuleEventAction!,
                        eventTopic: EventTopic,
                    }
                
                    type AutomationRule {
                        createdAt: Int!,
                        createdBy: String!,
                        modifiedAt: Int!,
                        modifiedBy: String!
                        
                        id: ID!,
                        label: String!,
                        description: String,
                        active: Boolean!,
                        trigger: AutomationRuleTrigger!,
                    }

                    type AutomationRulesList {
                        totalCount: Int!,
                        list: [AutomationRule!]!
                    }

                    enum AutomationRuleSortableFields {
                        id
                    }

                    input AutomationRulesSortInput {
                        field: AutomationRuleSortableFields!
                        order: SortOrder
                    }

                    input PartialAutomationRuleTriggerInput {
                        synchronous: Boolean,
                        eventAction: AutomationRuleEventAction,
                        eventTopic: EventTopicInput,
                    }
                    
                    input AutomationRulesFiltersInput {
                        id: ID,
                        label: String,
                        active: Boolean,
                        trigger: PartialAutomationRuleTriggerInput
                    }

                    input AutomationRuleTriggerInput {
                        synchronous: Boolean!,
                        eventAction: AutomationRuleEventAction!,
                        eventTopic: EventTopicInput
                    }

                    input CreateAutomationRuleInput {
                        label: String!,
                        description: String,
                        trigger: AutomationRuleTriggerInput!
                    }
                    
                    input UpdateAutomationRuleInput {
                        id: ID!,
                        label: String,
                        description: String,
                        active: Boolean,
                        trigger: PartialAutomationRuleTriggerInput
                    }
                    
                    extend type Query {
                        automationRules(
                            filters: AutomationRulesFiltersInput,
                            pagination: Pagination,
                            sort: AutomationRulesSortInput
                        ): AutomationRulesList!
                        automationTriggersDef: [AutomationTriggerDef!]!
                    }

                    extend type Mutation {
                        createAutomationRule(rule: CreateAutomationRuleInput!): AutomationRule!,
                        updateAutomationRule(rule: UpdateAutomationRuleInput!): AutomationRule!,
                    }
                `,
                resolvers: {
                    Query: {
                        async automationRules(
                            parent,
                            {filters, pagination, sort}: IGetAutomationRulesArgs,
                            ctx: IQueryInfos,
                        ): Promise<IList<IAutomationRule>> {
                            return automationDomain.getAutomationRules({
                                params: {
                                    filters,
                                    pagination,
                                    sort,
                                    withCount: true,
                                },
                                ctx,
                            });
                        },
                        automationTriggersDef(parent, args, ctx: IQueryInfos): AutomationTriggerDef[] {
                            return automationTriggers.getAutomationTriggers({ctx});
                        },
                    },
                    Mutation: {
                        async createAutomationRule(
                            parent,
                            {rule}: {rule: ICreateAutomationRule},
                            ctx: IQueryInfos,
                        ): Promise<IAutomationRule> {
                            return automationDomain.createAutomationRule({rule, ctx});
                        },
                        async updateAutomationRule(
                            _parent,
                            {rule}: {rule: IUpdateAutomationRule},
                            ctx: IQueryInfos,
                        ): Promise<IAutomationRule> {
                            return automationDomain.updateAutomationRule({rule, ctx});
                        },
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
