// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {
    type ICreateAutomationRule,
    type IAutomationRule,
    type IUpdateAutomationRule,
    type AutomationRulesEventTopic,
    type AutomationRuleEventAction,
    type AutomationRuleTrigger,
} from '../../_types/automation';
import {SortOrder, type IList} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import PermissionError from '../../errors/PermissionError';
import {type IAutomationRuleRepo} from '../../infra/automation/automationRuleRepo';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {EventAction} from '@leav/utils';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {isArangoError} from 'arangojs/error';
import {type IConfig} from '../../_types/config';
import {type IAutomationPipelineDomain} from './pipeline/pipeline';
import {buildFakeRulesToTrigger, TRIGGER_FAKER_RULES_FOR_DEV} from './fakeRulesToTrigger';
import {type IAutomationTriggers} from './triggers/automationTriggers';
import {type AutomationTriggerDef} from './triggers/_types';

export interface IGetAutomationRulesParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        active?: boolean;
        synchronous?: boolean;
        eventAction?: AutomationRuleEventAction;
        eventTopic?: AutomationRulesEventTopic;
    };
}

interface ITriggerRulesParams {
    event: {action: IAutomationRule['trigger']['eventAction']; topic?: IAutomationRule['trigger']['eventTopic']};
    synchronous: boolean;
    ctx: IQueryInfos;
}

export interface IAutomationDomain {
    getAutomationRules({
        params,
        ctx,
    }: {
        params: IGetAutomationRulesParams;
        ctx: IQueryInfos;
    }): Promise<IList<IAutomationRule>>;
    createAutomationRule({rule, ctx}: {rule: ICreateAutomationRule; ctx: IQueryInfos}): Promise<IAutomationRule>;
    updateAutomationRule({rule, ctx}: {rule: IUpdateAutomationRule; ctx: IQueryInfos}): Promise<IAutomationRule>;
    deleteAutomationRule({ruleId, ctx}: {ruleId: string; ctx: IQueryInfos}): Promise<IAutomationRule>;
    triggerRules(params: ITriggerRulesParams): Promise<void>;

    listAutomationTriggersDef({ctx}: {ctx: IQueryInfos}): Promise<AutomationTriggerDef[]>;
}

export interface IAutomationDomainDeps {
    'core.domain.automation.triggers': IAutomationTriggers;
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.automation.pipeline': IAutomationPipelineDomain;
    'core.infra.automation.rule': IAutomationRuleRepo;
    config: IConfig;
}

export default function ({
    'core.domain.automation.triggers': automationTriggers,
    'core.domain.permission.admin': adminPermissionDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.domain.automation.pipeline': pipelineDomain,
    'core.infra.automation.rule': automationRuleRepo,
    config,
}: IAutomationDomainDeps): IAutomationDomain {
    if (config.automation.enable === false) {
        return automationDisabled();
    }

    const _hasManageAutomationPermissionOrThrow = async (ctx: IQueryInfos): Promise<void> => {
        const hasAdminAccessPermission = await adminPermissionDomain.getAdminPermission({
            action: AdminPermissionsActions.MANAGE_AUTOMATION,
            ctx,
        });
        if (!hasAdminAccessPermission) {
            throw new PermissionError(AdminPermissionsActions.MANAGE_AUTOMATION);
        }
    };

    const _getRulesToTrigger = async (
        event: {action: AutomationRuleEventAction; topic?: AutomationRulesEventTopic},
        synchronous: boolean,
        ctx: IQueryInfos,
    ): Promise<IAutomationRule[]> => {
        if (TRIGGER_FAKER_RULES_FOR_DEV) {
            return buildFakeRulesToTrigger(event, synchronous, ctx);
        }

        const rules = await automationRuleRepo.getAutomationRules(
            {
                filters: {
                    active: true,
                    trigger: {
                        synchronous,
                        eventAction: event.action,
                        eventTopic: event.topic,
                    },
                },
                partialMatchOnEventTopic: true,
            },
            ctx,
        );

        return rules.list;
    };

    return {
        async triggerRules(params): Promise<void> {
            const {event, synchronous, ctx} = params;

            try {
                const rules = await _getRulesToTrigger(event, synchronous, ctx);
                const trigger: AutomationRuleTrigger = {
                    eventAction: event.action,
                    eventTopic: event.topic,
                    synchronous,
                };

                logger.verbose(
                    `Triggering ${rules.length} automation rules for event action ${event.action} and topic ${JSON.stringify(event.topic)}`,
                );

                await Promise.all(
                    rules.map(async rule => {
                        try {
                            await pipelineDomain.executePipeline(
                                {
                                    ...rule.pipeline,
                                    ruleId: rule.id,
                                    trigger,
                                },
                                ctx,
                            );
                        } catch (error) {
                            logger.error(
                                `Error executing pipeline for rule ${rule.id} triggered by event action ${trigger.eventAction}: ${error.stack}`,
                            );
                        }
                    }),
                );
            } catch (error) {
                logger.error(`Error while triggering ${event.action} rules with topic ${event.topic}: ${error.stack}`);
            }
        },
        async listAutomationTriggersDef({ctx}: {ctx: IQueryInfos}): Promise<AutomationTriggerDef[]> {
            await _hasManageAutomationPermissionOrThrow(ctx);
            return automationTriggers.listAutomationTriggersDef({ctx});
        },
        async getAutomationRules({params, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);

            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return automationRuleRepo.getAutomationRules(initializedParams, ctx);
        },
        async createAutomationRule({rule, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);

            await automationTriggers.validateAutomationRuleTrigger(rule.trigger, ctx);
            await pipelineDomain.validatePipeline(rule.pipeline);

            if (rule.active && !rule.pipeline.steps.length) {
                throw new ValidationError<IAutomationRule>({
                    pipeline: Errors.AUTOMATION_RULE_PIPELINE_EMPTY,
                });
            }

            const newAutomationRule = await automationRuleRepo.createAutomationRule(rule, ctx);

            logger.debug(`Created new automation rule with id ${newAutomationRule.id}`);

            await eventsManagerDomain.sendDatabaseEvent<EventAction.AUTOMATION_RULE_CREATE>(
                {
                    action: EventAction.AUTOMATION_RULE_CREATE,
                    topic: {
                        automationRule: newAutomationRule.id,
                    },
                    after: newAutomationRule,
                },
                ctx,
            );

            return newAutomationRule;
        },
        async updateAutomationRule({rule, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);

            if (rule.trigger) {
                await automationTriggers.validateAutomationRuleTrigger(rule.trigger, ctx);
            }

            if (rule.pipeline) {
                await pipelineDomain.validatePipeline(rule.pipeline);
            }

            if (rule.active && !rule.pipeline?.steps?.length) {
                const currentRule = (await automationRuleRepo.getAutomationRules({filters: {id: rule.id}}, ctx))
                    .list[0];

                if (currentRule.pipeline.steps.length === 0) {
                    throw new ValidationError<IAutomationRule>({
                        pipeline: Errors.AUTOMATION_RULE_PIPELINE_EMPTY,
                    });
                }
            }

            const updatedAutomationRule = await automationRuleRepo
                .updateAutomationRule(rule, ctx)
                // TODO: This catch block should be removed once the repository handles ArangoError and throws DBError instead.
                // Ticket: https://aristid.atlassian.net/browse/LEAVC-777
                .catch((error: unknown) => {
                    if (isArangoError(error) && error.code === 404) {
                        throw new ValidationError<IAutomationRule>({
                            id: {msg: Errors.UNKNOWN_AUTOMATION_RULE, vars: {ruleId: rule.id}},
                        });
                    }

                    throw error;
                });

            logger.debug(`Updated automation rule with id ${updatedAutomationRule.id}`);

            await eventsManagerDomain.sendDatabaseEvent<EventAction.AUTOMATION_RULE_UPDATE>(
                {
                    action: EventAction.AUTOMATION_RULE_UPDATE,
                    topic: {
                        automationRule: updatedAutomationRule.id,
                    },
                    after: updatedAutomationRule,
                },
                ctx,
            );

            return updatedAutomationRule;
        },
        async deleteAutomationRule({ruleId, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);

            const deletedAutomationRule = await automationRuleRepo
                .deleteAutomationRule(ruleId, ctx) // TODO: This catch block should be removed once the repository handles ArangoError and throws DBError instead.
                // Ticket: https://aristid.atlassian.net/browse/LEAVC-777
                .catch((error: unknown) => {
                    if (isArangoError(error) && error.code === 404) {
                        throw new ValidationError<IAutomationRule>({
                            id: {msg: Errors.UNKNOWN_AUTOMATION_RULE, vars: {ruleId}},
                        });
                    }

                    throw error;
                });

            logger.debug(`Deleted automation rule with id ${ruleId}`);

            await eventsManagerDomain.sendDatabaseEvent<EventAction.AUTOMATION_RULE_DELETE>(
                {
                    action: EventAction.AUTOMATION_RULE_DELETE,
                    topic: {
                        automationRule: deletedAutomationRule.id,
                    },
                },
                ctx,
            );

            return deletedAutomationRule;
        },
    };
}

function automationDisabled(): IAutomationDomain {
    logger.verbose('Automation system is disabled in the configuration.');

    return {
        async getAutomationRules(): Promise<IList<IAutomationRule>> {
            logger.silly('Automation system is disabled. Skipping automation rules retrieval.');
            return {list: [], totalCount: 0};
        },
        async createAutomationRule(): Promise<IAutomationRule> {
            logger.silly('Automation system is disabled. Skipping automation rule creation.');
            return null;
        },
        async updateAutomationRule(): Promise<IAutomationRule> {
            logger.silly('Automation system is disabled. Skipping automation rule update.');
            return null;
        },
        async deleteAutomationRule(): Promise<IAutomationRule> {
            logger.silly('Automation system is disabled. Skipping automation rule deletion.');
            return null;
        },
        async triggerRules(): Promise<void> {
            logger.silly('Automation system is disabled. Skipping rules trigger.');
        },
        async listAutomationTriggersDef(): Promise<AutomationTriggerDef[]> {
            logger.silly('Automation system is disabled. Skipping listing automation triggers definitions.');
            return [];
        },
    };
}
