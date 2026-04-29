// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {type IAutomationDomain} from '../../domain/automation/automationDomain';
import {type ICreateAutomationRule, type IAutomationRule, type IUpdateAutomationRule} from '../../_types/automation';
import {type IPaginationParams, type ISortParams, type IList} from '../../_types/list';
import {type IAutomationTriggers} from '../../domain/automation/triggers/automationTriggers';
import {type IAutomationTriggersRegistry} from '../..//domain/automation/triggers/automationTriggersRegistry';
import {
    AutomationTriggerDefSynchronicity,
    AutomationTriggerDefTopics,
    type AutomationTriggerDef,
} from '../../domain/automation/triggers/_types';
import {AutomationRuleActions} from '../../domain/automation/actions/_types';

export type ICoreImportApp = IGraphqlAppModule;

interface IAutomationAppDeps {
    'core.domain.automation': IAutomationDomain;
    'core.domain.automation.triggers': IAutomationTriggers;
    'core.domain.automation.triggers.registry': IAutomationTriggersRegistry;
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
    'core.domain.automation.triggers.registry': automationTriggersRegistry,
}: IAutomationAppDeps): ICoreImportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum AutomationRuleEventAction {
                        ${automationTriggersRegistry
                            .listTriggers()
                            .map(def => def.eventAction)
                            .join(' ')}
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
                
                    type AutomationRulePipelineStep {
                        type: AutomationRuleActions!,
                        name: String,
                        params: JSON!
                    }

                    type AutomationRulePipeline {
                        steps: [AutomationRulePipelineStep!]!
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
                        pipeline: AutomationRulePipeline!
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

                    enum AutomationRuleActions {
                        ${Object.values(AutomationRuleActions).join('\n')}
                    }

                    input AutomationRulePipelineStepInput {
                        type: AutomationRuleActions!,
                        name: String,
                        params: JSON!
                    }

                    input AutomationRulePipelineInput {
                        steps: [AutomationRulePipelineStepInput!]!
                    }

                    input CreateAutomationRuleInput {
                        label: String!,
                        description: String,
                        trigger: AutomationRuleTriggerInput!
                        pipeline: AutomationRulePipelineInput!
                        active: Boolean!
                    }
                    
                    input UpdateAutomationRuleInput {
                        id: ID!,
                        label: String,
                        description: String,
                        active: Boolean,
                        trigger: AutomationRuleTriggerInput
                        pipeline: AutomationRulePipelineInput
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
                        deleteAutomationRule(ruleId: ID!): AutomationRule!
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
                        async automationTriggersDef(parent, args, ctx: IQueryInfos): Promise<AutomationTriggerDef[]> {
                            return automationDomain.listAutomationTriggersDef({ctx});
                        },
                    },
                    Mutation: {
                        async createAutomationRule(
                            _,
                            {rule}: {rule: ICreateAutomationRule},
                            ctx: IQueryInfos,
                        ): Promise<IAutomationRule> {
                            return automationDomain.createAutomationRule({rule, ctx});
                        },
                        async updateAutomationRule(
                            _,
                            {rule}: {rule: IUpdateAutomationRule},
                            ctx: IQueryInfos,
                        ): Promise<IAutomationRule> {
                            return automationDomain.updateAutomationRule({rule, ctx});
                        },
                        async deleteAutomationRule(
                            _parent,
                            {ruleId}: {ruleId: string},
                            ctx: IQueryInfos,
                        ): Promise<IAutomationRule> {
                            return automationDomain.deleteAutomationRule({ruleId, ctx});
                        },
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
