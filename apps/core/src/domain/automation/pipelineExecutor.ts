// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {EventAction} from '@leav/utils';
import {
    type AutomationRuleTrigger,
    type AutomationRulePipeline,
    type AutomationRulePipelineStep,
} from '../../_types/automation';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {
    ActionExecutionResultStatus,
    type IActionExecutionResult,
    type IAutomationPipelineExecutionState,
} from './types';
import {type IQueryInfos} from '../../_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {type IAutomationActionsRegistry} from './automationActionsRegistry';
import {type IAutomationAction} from './actions/_types';

export type AutomationPipelineToExecute = AutomationRulePipeline & {
    ruleId: string;
    trigger: AutomationRuleTrigger;
};

export interface IPipelineExecutor {
    // returns true if pipeline executed fully, false if it was stopped by an action, for testing purpose for now
    executePipeline(pipelineExec: AutomationPipelineToExecute, ctx: IQueryInfos): Promise<boolean>;
}

export interface IPipelineExecutorDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.automation.actionsRegistry': IAutomationActionsRegistry;
}

export default function ({
    'core.domain.eventsManager': eventsManager,
    'core.domain.automation.actionsRegistry': actionsRegistry,
}: IPipelineExecutorDeps): IPipelineExecutor {
    // move that validation in pipeline edition latter to avoid doing it at each execution
    const _validateActionParams = async (action: IAutomationAction, params: Record<string, unknown>): Promise<void> => {
        const paramsValidation = action.paramsSchema.safeParse(params);
        if (!paramsValidation.success) {
            const details = paramsValidation.error.issues.reduce(
                (acc, issue) => {
                    const path = issue.path.join('.');
                    acc[path] = {
                        msg: Errors.INVALID_ACTION_PARAMS,
                        vars: {
                            details: issue.message,
                        },
                    };
                    return acc;
                },
                {} as Record<string, {msg: string; vars: Record<string, unknown>}>,
            );
            throw new ValidationError(details, `Invalid params for action "${action.type}"`);
        }
        await action.validateParams?.(params);
    };

    const _executeStep = async (
        action: IAutomationAction,
        step: AutomationRulePipelineStep,
        state: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ): Promise<IActionExecutionResult> => {
        await _validateActionParams(action, step.params);

        const raw = await action.execute(step.params, state, ctx);

        // void/undefined is treated as CONTINUE
        const result: IActionExecutionResult = (raw as IActionExecutionResult | undefined) ?? {
            status: ActionExecutionResultStatus.CONTINUE,
        };

        return result;
    };

    const _storeStepResult = (
        state: IAutomationPipelineExecutionState,
        stepIndex: number,
        stepName: string | undefined,
        result: unknown,
    ): void => {
        state.results[stepIndex] = result;
        // Non-enumerable so the name is not serialized in the AUTOMATION_PIPELINE_SUCCESS event
        if (stepName) {
            Object.defineProperty(state.results, stepName, {
                value: result,
                enumerable: false,
                writable: false,
                configurable: true,
            });
        }
    };

    const _emitSuccess = (
        pipelineExec: AutomationPipelineToExecute,
        state: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ): Promise<void> =>
        eventsManager.sendDatabaseEvent(
            {
                action: EventAction.AUTOMATION_PIPELINE_SUCCESS,
                topic: {automationRule: pipelineExec.ruleId},
                after: {results: state.results},
                metadata: {durationMs: Date.now() - state.startDateMs, trigger: pipelineExec.trigger},
            },
            ctx,
        );

    const _emitFailure = (
        pipelineExec: AutomationPipelineToExecute,
        state: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ): Promise<void> =>
        eventsManager.sendDatabaseEvent(
            {
                action: EventAction.AUTOMATION_PIPELINE_FAILURE,
                topic: {automationRule: pipelineExec.ruleId},
                after: {results: state.results},
                metadata: {durationMs: Date.now() - state.startDateMs, trigger: pipelineExec.trigger},
            },
            ctx,
        );

    const _initializePipelineState = (
        pipelineExec: AutomationPipelineToExecute,
    ): IAutomationPipelineExecutionState => ({
        trigger: pipelineExec.trigger,
        results: {},
        startDateMs: Date.now(),
    });

    return {
        async executePipeline(pipelineExec, ctx) {
            const state = _initializePipelineState(pipelineExec);

            let stepIndex = 0;
            for (const step of pipelineExec.steps) {
                const stepIdentifier = step.name ?? `${stepIndex}`;

                try {
                    const action = actionsRegistry.getAction(step.type);
                    const stepResult = await _executeStep(action, step, state, ctx);
                    if (stepResult.status === ActionExecutionResultStatus.STOP) {
                        logger.debug(
                            `Pipeline for rules ${pipelineExec.ruleId} stopped at step "${stepIdentifier}": ${stepResult.reason ?? ''}`,
                        );
                        break;
                    }

                    _storeStepResult(state, stepIndex, step.name, stepResult.result);
                } catch (error) {
                    logger.error(
                        `Pipeline for rules ${pipelineExec.ruleId} interrupted at step "${stepIdentifier}": ${(error as Error).stack}`,
                        {error},
                    );
                    _storeStepResult(state, stepIndex, step.name, {
                        ...error,
                        stack: error.stack,
                        message: error.message,
                        name: error.name,
                    });
                    await _emitFailure(pipelineExec, state, ctx);
                    return false;
                }
                stepIndex++;
            }

            await _emitSuccess(pipelineExec, state, ctx);
            return true;
        },
    };
}
