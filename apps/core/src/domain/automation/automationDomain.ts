import {logger} from '@leav/logger';
import _ from 'lodash';
import {
    type ICreateAutomationRule,
    type IAutomationRule,
    type IUpdateAutomationRule,
    type AutomationRuleEventTopic,
    type AutomationRuleEventAction,
    type AutomationRuleTrigger,
    type AutomationRuleJsonSchemaFormType,
} from '../../_types/automation';
import {SortOrder, type IList} from '../../_types/list';
import {AdminPermissionsActions} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IConfig} from '../../_types/config';
import {type IGetCoreEntitiesParams} from '../../_types/shared';
import PermissionError from '../../errors/PermissionError';
import {type IAutomationRuleRepo} from '../../infra/automation/automationRuleRepo';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {EventAction} from '@leav/utils';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {isArangoError} from 'arangojs/error';
import {type IAutomationPipelineDomain} from './pipeline/pipeline';
import {type IAutomationRulesCache} from './automationRulesCache';
import {type IAutomationTriggers} from './triggers/automationTriggers';
import {type AutomationPipelineExecution, type AutomationPipelineValidation} from './pipeline/_types';
import {type IAutomationJsonSchemaFormDomain} from './form/automationJsonSchemaForm';
import {type IAutomationUiJsonSchemaFormDomain} from './form/automationUiJsonSchemaForm';
import {type UiSchema, type RJSFSchema} from '@rjsf/utils';
import {triggerCounter, triggerDuration, triggerRulesFetchDuration, triggerRulesMatched} from './_metrics';

export interface IGetAutomationRulesParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        active?: boolean;
        synchronous?: boolean;
        eventAction?: AutomationRuleEventAction;
        eventTopic?: AutomationRuleEventTopic;
    };
}

interface ITriggerRulesParams {
    event: {action: AutomationRuleEventAction; topic?: AutomationRuleEventTopic};
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
    getAutomationRuleJsonSchemaForm({
        formType,
        ctx,
    }: {
        formType: AutomationRuleJsonSchemaFormType;
        ctx: IQueryInfos;
    }): Promise<RJSFSchema>;
    getAutomationRuleUiJsonSchemaForm({
        formType,
        ctx,
    }: {
        formType: AutomationRuleJsonSchemaFormType;
        ctx: IQueryInfos;
    }): Promise<UiSchema>;
    createAutomationRule({rule, ctx}: {rule: ICreateAutomationRule; ctx: IQueryInfos}): Promise<IAutomationRule>;
    duplicateAutomationRule({
        ruleId,
        label,
        ctx,
    }: {
        ruleId: string;
        label: string;
        ctx: IQueryInfos;
    }): Promise<IAutomationRule>;
    updateAutomationRule({rule, ctx}: {rule: IUpdateAutomationRule; ctx: IQueryInfos}): Promise<IAutomationRule>;
    deleteAutomationRule({ruleId, ctx}: {ruleId: string; ctx: IQueryInfos}): Promise<IAutomationRule>;
    setAutomationRulesActive(params: {
        ruleIds: string[];
        active: boolean;
        ctx: IQueryInfos;
    }): Promise<IAutomationRule[]>;
    deleteAutomationRules(params: {ruleIds: string[]; ctx: IQueryInfos}): Promise<IAutomationRule[]>;
    triggerRules(params: ITriggerRulesParams): Promise<void>;
}

export interface IAutomationDomainDeps {
    config: IConfig;
    'core.domain.automation.triggers': IAutomationTriggers;
    'core.domain.automation.form': IAutomationJsonSchemaFormDomain;
    'core.domain.automation.form.uiJsonSchemaForm': IAutomationUiJsonSchemaFormDomain;
    'core.domain.permission.admin': IAdminPermissionDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.automation.pipeline': IAutomationPipelineDomain;
    'core.domain.automation.rulesCache': IAutomationRulesCache;
    'core.infra.automation.rule': IAutomationRuleRepo;
}

export default function ({
    config,
    'core.domain.automation.triggers': automationTriggers,
    'core.domain.automation.form': automationJsonSchemaFormDomain,
    'core.domain.automation.form.uiJsonSchemaForm': automationUiJsonSchemaFormDomain,
    'core.domain.permission.admin': adminPermissionDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.domain.automation.pipeline': pipelineDomain,
    'core.domain.automation.rulesCache': automationRulesCache,
    'core.infra.automation.rule': automationRuleRepo,
}: IAutomationDomainDeps): IAutomationDomain {
    const _hasManageAutomationPermissionOrThrow = async (ctx: IQueryInfos): Promise<void> => {
        const hasAdminAccessPermission = await adminPermissionDomain.getAdminPermission({
            action: AdminPermissionsActions.MANAGE_AUTOMATION,
            ctx,
        });
        if (!hasAdminAccessPermission) {
            throw new PermissionError(AdminPermissionsActions.MANAGE_AUTOMATION);
        }
    };

    const _pipelineExecutionFromRule = (
        rule: Pick<IAutomationRule, 'id' | 'pipeline' | 'trigger'>,
    ): AutomationPipelineExecution => ({
        ...rule.pipeline,
        ruleId: rule.id,
        trigger: rule.trigger,
    });

    const _pipelineValidationFromRule = (
        rule: Pick<IAutomationRule, 'pipeline' | 'trigger'>,
    ): AutomationPipelineValidation => ({
        ...rule.pipeline,
        trigger: rule.trigger,
    });

    const _getRulesToTrigger = async (
        event: {action: AutomationRuleEventAction; topic?: AutomationRuleEventTopic},
        synchronous: boolean,
        ctx: IQueryInfos,
    ): Promise<IAutomationRule[]> => {
        const start = Date.now();
        try {
            return await automationRulesCache.getRulesToTrigger(event, synchronous, ctx);
        } finally {
            triggerRulesFetchDuration.record(Date.now() - start, {event_action: event.action, synchronous});
        }
    };

    const _createAutomationRule = async ({
        rule,
        ctx,
    }: {
        rule: ICreateAutomationRule;
        ctx: IQueryInfos;
    }): Promise<IAutomationRule> => {
        await _hasManageAutomationPermissionOrThrow(ctx);

        await automationTriggers.validateAutomationRuleTrigger(rule.trigger, ctx);
        await pipelineDomain.validatePipeline(
            _pipelineValidationFromRule({
                pipeline: rule.pipeline,
                trigger: rule.trigger,
            }),
            ctx,
        );

        if (rule.active && !rule.pipeline.steps.length) {
            throw new ValidationError<IAutomationRule>({
                pipeline: Errors.AUTOMATION_RULE_PIPELINE_EMPTY,
            });
        }

        const newAutomationRule = await automationRuleRepo.createAutomationRule(rule, ctx);

        await automationRulesCache.invalidate(newAutomationRule.id);

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
    };

    const _updateAutomationRule = async ({
        rule,
        ctx,
    }: {
        rule: IUpdateAutomationRule;
        ctx: IQueryInfos;
    }): Promise<IAutomationRule> => {
        await _hasManageAutomationPermissionOrThrow(ctx);

        // Lazily fetched: only the validations below need the stored rule, and an update can be a plain
        // field change that the repository resolves on its own.
        const getCurrentRuleIfNeeded = _.once(async () => {
            const {list} = await automationRuleRepo.getAutomationRules({filters: {id: rule.id}}, ctx);
            const currentRule = list[0];

            if (!currentRule) {
                throw new ValidationError<IAutomationRule>({
                    id: {msg: Errors.UNKNOWN_AUTOMATION_RULE, vars: {ruleId: rule.id}},
                });
            }

            return currentRule;
        });

        if (rule.trigger) {
            await automationTriggers.validateAutomationRuleTrigger(rule.trigger, ctx);
        }

        if (rule.pipeline) {
            await pipelineDomain.validatePipeline(
                _pipelineValidationFromRule({
                    pipeline: rule.pipeline,
                    trigger: rule.trigger || (await getCurrentRuleIfNeeded()).trigger,
                }),
                ctx,
            );
        }

        if (rule.active && !rule.pipeline?.steps?.length) {
            if ((await getCurrentRuleIfNeeded()).pipeline.steps.length === 0) {
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

        await automationRulesCache.invalidate(updatedAutomationRule.id);

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
    };

    const _deleteAutomationRule = async ({
        ruleId,
        ctx,
    }: {
        ruleId: string;
        ctx: IQueryInfos;
    }): Promise<IAutomationRule> => {
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

        await automationRulesCache.invalidate(deletedAutomationRule.id);

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
    };

    return {
        async triggerRules(params): Promise<void> {
            const {event, synchronous, ctx} = params;
            const start = Date.now();
            const baseAttrs = {event_action: event.action, synchronous};
            let outcome: 'matched' | 'no_match' | 'error' | 'depth_exceeded' = 'no_match';

            if (!automationTriggers.isEventActionInTriggers(event.action, synchronous)) {
                return;
            }

            const chainDepth = ctx.automationDepth ?? 0;

            try {
                const rules = await _getRulesToTrigger(event, synchronous, ctx);
                triggerRulesMatched.record(rules.length, baseAttrs);
                outcome = rules.length > 0 ? 'matched' : 'no_match';

                const trigger: AutomationRuleTrigger = {
                    eventAction: event.action,
                    eventTopic: event.topic,
                    synchronous,
                };

                if (!rules.length) {
                    return;
                }

                // Cut only when a rule would actually run: an event reaching the max depth with no
                // matching rule is a chain ending by itself, and the same save is evaluated by both
                // the synchronous path and the async consumer - cutting before matching would emit
                // one AUTOMATION_CHAIN_DEPTH_EXCEEDED per path for a single logical cut.
                if (chainDepth >= config.automation.maxChainDepth) {
                    outcome = 'depth_exceeded';
                    const blockedRules = rules.map(rule => rule.id);
                    logger.error(
                        `Automation chain cut: depth ${chainDepth} reached maxChainDepth (${config.automation.maxChainDepth}) for event action ${event.action} with topic ${JSON.stringify(event.topic)}, blocking rules ${blockedRules.join(', ')}. Check active rules for a circular composition.`,
                    );
                    await eventsManagerDomain.sendDatabaseEvent(
                        {
                            action: EventAction.AUTOMATION_CHAIN_DEPTH_EXCEEDED,
                            topic: event.topic ?? {},
                            metadata: {
                                automationDepth: chainDepth,
                                maxAutomationChainDepth: config.automation.maxChainDepth,
                                blockedRules,
                            },
                        },
                        ctx,
                    );
                    return;
                }

                logger.verbose(
                    `Triggering ${rules.length} automation rules for event action ${event.action} (${synchronous ? 'synchronous' : 'asynchronous'}) and topic ${JSON.stringify(event.topic)}`,
                );

                await Promise.all(
                    rules.map(async rule => {
                        try {
                            await pipelineDomain.executePipeline(
                                _pipelineExecutionFromRule({
                                    id: rule.id,
                                    pipeline: rule.pipeline,
                                    trigger,
                                }),
                                // Copy, never mutate: ctx is shared by sibling rules of this Promise.all
                                // (and by the caller). Everything a pipeline writes carries depth + 1.
                                {...ctx, automationDepth: chainDepth + 1},
                            );
                        } catch (error) {
                            logger.error(
                                `Error executing pipeline for rule ${rule.id} triggered by event action ${trigger.eventAction}: ${error.stack}`,
                            );
                        }
                    }),
                );
            } catch (error) {
                outcome = 'error';
                logger.error(`Error while triggering ${event.action} rules with topic ${event.topic}: ${error.stack}`);
            } finally {
                triggerCounter.add(1, {...baseAttrs, outcome});
                triggerDuration.record(Date.now() - start, {...baseAttrs, outcome});
            }
        },
        async getAutomationRules({params, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);

            const initializedParams = {...params};
            if (typeof initializedParams.sort === 'undefined') {
                initializedParams.sort = {field: 'id', order: SortOrder.ASC};
            }

            return automationRuleRepo.getAutomationRules(initializedParams, ctx);
        },
        async getAutomationRuleJsonSchemaForm({formType, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);
            return automationJsonSchemaFormDomain.getAutomationRuleJsonSchemaForm({formType, ctx});
        },
        async getAutomationRuleUiJsonSchemaForm({formType, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);
            return automationUiJsonSchemaFormDomain.getAutomationRuleUiJsonSchemaForm({formType, ctx});
        },
        createAutomationRule: _createAutomationRule,
        async duplicateAutomationRule({ruleId, label, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);

            const {list} = await automationRuleRepo.getAutomationRules({filters: {id: ruleId}}, ctx);
            const sourceRule = list[0];

            if (!sourceRule) {
                throw new ValidationError<IAutomationRule>({
                    id: {msg: Errors.UNKNOWN_AUTOMATION_RULE, vars: {ruleId}},
                });
            }

            // The caller owns the label it validated (the admin prefills "Copy of <name>", then lets
            // the user edit it), so it is stored as-is.
            //
            // A copy is always created inactive: two active rules on the same trigger would both run,
            // so switching to the new version has to stay an explicit, manual gesture.
            return _createAutomationRule({
                rule: {
                    label,
                    description: sourceRule.description,
                    version: sourceRule.version,
                    trigger: sourceRule.trigger,
                    pipeline: sourceRule.pipeline,
                    active: false,
                },
                ctx,
            });
        },
        updateAutomationRule: _updateAutomationRule,
        deleteAutomationRule: _deleteAutomationRule,
        /**
         * Rules are processed one at a time, through the unitary methods on purpose: each one validates the
         * rule, invalidates `automationRulesCache` and emits its `AUTOMATION_RULE_*` event. A single bulk AQL
         * would leave the rules cache stale, and the engine would keep running deactivated rules.
         *
         * Not transactional: an error mid-batch leaves the previous rules updated. The caller is expected to
         * refresh its view rather than to expect a rollback — same contract as `activateRecordsBatch`.
         */
        async setAutomationRulesActive({ruleIds, active, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);

            const updatedRules: IAutomationRule[] = [];

            for (const ruleId of ruleIds) {
                updatedRules.push(await _updateAutomationRule({rule: {id: ruleId, active}, ctx}));
            }

            return updatedRules;
        },
        async deleteAutomationRules({ruleIds, ctx}) {
            await _hasManageAutomationPermissionOrThrow(ctx);

            const deletedRules: IAutomationRule[] = [];

            for (const ruleId of ruleIds) {
                deletedRules.push(await _deleteAutomationRule({ruleId, ctx}));
            }

            return deletedRules;
        },
    };
}
