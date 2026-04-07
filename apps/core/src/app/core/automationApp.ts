// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {type IAutomationDomain} from '../../domain/automation/automationDomain';
import {type ICreateAutomationRule, type IAutomationRule, type IUpdateAutomationRule} from '../../_types/automation';
import {type IPaginationParams, type ISortParams, type IList} from '../../_types/list';

export type ICoreImportApp = IGraphqlAppModule;

interface IDeps {
    'core.domain.automation': IAutomationDomain;
}

export interface IGetAutomationRulesArgs {
    filters?: ICoreEntityFilterOptions & {
        id: string;
        active: boolean;
    };
    pagination?: IPaginationParams;
    sort?: ISortParams;
}

export default function ({'core.domain.automation': automationDomain}: IDeps): ICoreImportApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `

                    type AutomationRule {
                        id: ID!,
                        label(lang: [AvailableLanguage!]): SystemTranslation!,
                        description: SystemTranslation,
                        active: Boolean!,
                        createdAt: Int!,
                        createdBy: String!,
                        modifiedAt: Int!,
                        modifiedBy: String!
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

                    input AutomationRulesFiltersInput {
                        id: ID,
                        label: String,
                    }

                    input CreateAutomationRuleInput {
                        label: SystemTranslation!,
                        description: SystemTranslationOptional,
                    }
                    
                    input UpdateAutomationRuleInput {
                        id: ID!,
                        label: SystemTranslation,
                        description: SystemTranslationOptional,
                        active: Boolean
                    }

                    extend type Query {
                        automationRules(
                            filters: AutomationRulesFiltersInput,
                            pagination: Pagination,
                            sort: AutomationRulesSortInput
                        ): AutomationRulesList!
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
