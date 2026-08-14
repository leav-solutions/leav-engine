import {logger} from '@leav/logger';
import {EventAction} from '@leav/utils';
import {
    type AutomationPipelineExecution,
    type AutomationPipelineValidation,
    type AutomationRulePipelineStep,
    type IAutomationPipelineExecutionState,
} from '../pipeline/_types';
import {type IEventsManagerDomain} from '../../eventsManager/eventsManagerDomain';
import {
    ActionExecutionResultStatus,
    type IActionExecutionResult,
    type IAutomationAction,
    type AutomationPipelineStepValidation,
} from '../actions/_types';
import {type IQueryInfos} from '../../../_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {Errors} from '../../../_types/errors';
import {type IAutomationActionsRegistry} from '../automationActionsRegistry';
import {pipelineStepValidation} from './stepValidation';

export interface IAutomationPipelineDomain {
    // returns true if pipeline executed fully, false if it was stopped by an action, for testing purpose for now
    executePipeline(pipelineExec: AutomationPipelineExecution, ctx: IQueryInfos): Promise<boolean>;
    validatePipeline(pipelineToValidate: AutomationPipelineValidation, ctx: IQueryInfos): Promise<void>;
}

export interface IPipelineExecutorDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.automation.actionsRegistry': IAutomationActionsRegistry;
}

export default function ({
    'core.domain.eventsManager': eventsManager,
    'core.domain.automation.actionsRegistry': actionsRegistry,
}: IPipelineExecutorDeps): IAutomationPipelineDomain {
    const _validatePipelineStep = async (
        action: IAutomationAction,
        stepValidation: AutomationPipelineStepValidation,
        ctx: IQueryInfos,
    ): Promise<void> => {
        const paramsValidation = action.paramsSchema.safeParse(stepValidation.step.params);

        if (!paramsValidation.success) {
            const details = paramsValidation.error.issues.reduce(
                (acc, issue) => {
                    const path = issue.path.join('.');
                    acc[path] = {
                        msg: Errors.INVALID_AUTOMATION_ACTION_PARAMS,
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

        await action.validateStep?.(stepValidation, ctx);
    };

    const _executeStep = async (
        action: IAutomationAction,
        step: AutomationRulePipelineStep,
        state: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ): Promise<IActionExecutionResult> => {
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
        pipelineExec: AutomationPipelineExecution,
        state: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ): Promise<void> =>
        eventsManager.sendDatabaseEvent(
            {
                action: EventAction.AUTOMATION_PIPELINE_SUCCESS,
                topic: {automationRule: pipelineExec.ruleId},
                after: {results: state.results},
                metadata: {
                    durationMs: Date.now() - state.startDateMs,
                    automationDepth: ctx.automationDepth,
                    trigger: pipelineExec.trigger,
                },
            },
            ctx,
        );

    const _emitFailure = (
        pipelineExec: AutomationPipelineExecution,
        state: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ): Promise<void> =>
        eventsManager.sendDatabaseEvent(
            {
                action: EventAction.AUTOMATION_PIPELINE_FAILURE,
                topic: {automationRule: pipelineExec.ruleId},
                after: {results: state.results},
                metadata: {
                    durationMs: Date.now() - state.startDateMs,
                    automationDepth: ctx.automationDepth,
                    trigger: pipelineExec.trigger,
                },
            },
            ctx,
        );

    const _initializePipelineState = (
        pipelineExec: AutomationPipelineExecution,
    ): IAutomationPipelineExecutionState => ({
        trigger: pipelineExec.trigger,
        results: {},
        stepIndex: 0,
        startDateMs: Date.now(),
        get lastResult() {
            return this.results[this.stepIndex - 1];
        },
    });

    return {
        async validatePipeline(pipelineToValidate, ctx): Promise<void> {
            for (const [stepIndex, step] of pipelineToValidate.steps.entries()) {
                const action = actionsRegistry.getAction(step.type);

                if (!action) {
                    throw new ValidationError({
                        type: {
                            msg: Errors.INVALID_AUTOMATION_ACTION_TYPE,
                            vars: {type: step.type},
                        },
                    });
                }

                const stepValidation = pipelineStepValidation(pipelineToValidate, stepIndex);

                await _validatePipelineStep(action, stepValidation, ctx);
            }
        },
        async executePipeline(pipelineExec, ctx) {
            const state = _initializePipelineState(pipelineExec);

            for (const step of pipelineExec.steps) {
                const stepIdentifier = step.name ?? `${state.stepIndex}`;

                try {
                    const action = actionsRegistry.getAction(step.type);
                    const stepResult = await _executeStep(action, step, state, ctx);
                    if (stepResult.status === ActionExecutionResultStatus.STOP) {
                        logger.debug(
                            `Pipeline for rules ${pipelineExec.ruleId} stopped at step "${stepIdentifier}": ${stepResult.reason ?? ''}`,
                        );
                        _storeStepResult(state, state.stepIndex, step.name, {
                            stopByAction: true,
                            reason: stepResult.reason,
                        });
                        break;
                    }

                    _storeStepResult(state, state.stepIndex, step.name, stepResult.result);
                } catch (error) {
                    logger.error(
                        `Pipeline for rules ${pipelineExec.ruleId} interrupted at step "${stepIdentifier}": ${(error as Error).stack}`,
                        {error},
                    );
                    _storeStepResult(state, state.stepIndex, step.name, {
                        ...error,
                        stack: error.stack,
                        message: error.message,
                        name: error.name,
                        cause: error.cause,
                    });
                    await _emitFailure(pipelineExec, state, ctx);
                    return false;
                }
                state.stepIndex++;
            }

            await _emitSuccess(pipelineExec, state, ctx);
            return true;
        },
    };
}
