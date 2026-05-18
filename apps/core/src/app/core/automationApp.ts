import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IAutomationDomain} from '../../domain/automation/automationDomain';
import {
    type ICreateAutomationRule,
    type IAutomationRule,
    type IUpdateAutomationRule,
    type AutomationRuleJsonSchemaFormType,
} from '../../_types/automation';
import {type IPaginationParams, type ISortParams, type IList} from '../../_types/list';
import {type IAutomationTriggersRegistry} from '../..//domain/automation/triggers/automationTriggersRegistry';
import {type IAutomationAction} from '../../domain/automation/actions/_types';
import {type IAutomationActionsRegistry} from '../../domain/automation/automationActionsRegistry';
import {type IAppModule} from '../../_types/shared';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {type RJSFSchema, type UiSchema} from '@rjsf/utils';

export type ICoreAutomationApp = IAppModule & IGraphqlAppModule;

interface IAutomationAppDeps {
    'core.domain.automation': IAutomationDomain;
    'core.domain.automation.triggers.registry': IAutomationTriggersRegistry;
    'core.domain.automation.actionsRegistry': IAutomationActionsRegistry;
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
    'core.domain.automation.triggers.registry': automationTriggersRegistry,
    'core.domain.automation.actionsRegistry': automationActionsRegistry,
}: IAutomationAppDeps): ICoreAutomationApp {
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

                    enum AutomationRuleJsonSchemaFormType {
                        creation
                        edition
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
                        ${automationActionsRegistry
                            .listAvailableActions()
                            .map(({type}) => type)
                            .join(' ')}
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
                    
                    type AutomationRuleForm {
                        jsonSchema: JSONObject!
                        uiSchema: JSONObject!
                    }

                    extend type Query {
                        automationRules(
                            filters: AutomationRulesFiltersInput,
                            pagination: Pagination,
                            sort: AutomationRulesSortInput
                        ): AutomationRulesList!
                        automationRuleForm(formType: AutomationRuleJsonSchemaFormType!): AutomationRuleForm!
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
                        async automationRuleForm(
                            parent,
                            {formType}: {formType: AutomationRuleJsonSchemaFormType},
                            ctx: IQueryInfos,
                        ): Promise<{jsonSchema: RJSFSchema; uiSchema: UiSchema}> {
                            return {
                                jsonSchema: await automationDomain.getAutomationRuleJsonSchemaForm({formType, ctx}),
                                uiSchema: await automationDomain.getAutomationRuleUiJsonSchemaForm({formType, ctx}),
                            };
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
        extensionPoints: {
            registerAutomationAction(action: IAutomationAction): void {
                automationActionsRegistry.registerAction(action);
            },
        },
    };
}
