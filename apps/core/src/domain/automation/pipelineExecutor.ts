// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type AwilixContainer} from 'awilix';
import {type AutomationRuleTrigger, type AutomationRulePipeline} from '../../_types/automation';
import {
    ActionExecutionResultStatus,
    type IActionExecutionResult,
    type IAutomationAction,
    type IAutomationPipelineExecutionState,
} from './types';
import {type IQueryInfos} from '../../_types/queryInfos';

export type AutomationPipelineToExecute = AutomationRulePipeline & {
    ruleId: string;
    trigger: AutomationRuleTrigger;
};

export interface IPipelineExecutor {
    getAvailableActions(): IAutomationAction[];

    // returns true if pipeline executed fully, false if it was stopped by an action, for testing purpose for now
    executePipeline(pipelineExec: AutomationPipelineToExecute, ctx: IQueryInfos): Promise<boolean>;
}

export interface IPipelineExecutorDeps {
    'core.depsManager': AwilixContainer;
}

export default function ({'core.depsManager': depsManager}: IPipelineExecutorDeps): IPipelineExecutor {
    const loadedActionRegistry: Map<string, IAutomationAction> = new Map();
    const _loadActionsOnDemand = (): Map<string, IAutomationAction> => {
        if (loadedActionRegistry.size === 0) {
            const coreActions: IAutomationAction[] = Object.keys(depsManager.registrations)
                .filter(modName => modName.match(/^core\.domain\.automation\.actions\./))
                .map(modName => depsManager.cradle[modName]);

            logger.verbose('Loaded pipeline actions: ' + coreActions.map(a => a.type).join(', '));
            coreActions.forEach(action => loadedActionRegistry.set(action.type, action));
        }
        return loadedActionRegistry;
    };

    // move that validation in pipeline edition latter to avoid doing it at each execution
    const _validateActionParams = async (action: IAutomationAction, params: Record<string, unknown>) => {
        const paramsValidation = action.paramsSchema.safeParse(params);
        if (!paramsValidation.success) {
            throw new Error(`Invalid params for action "${action.type}": ${paramsValidation.error.message}`);
        }
        await action.validateParams?.(params);
    };

    return {
        getAvailableActions() {
            return [..._loadActionsOnDemand().values()];
        },
        async executePipeline(pipelineExec, ctx) {
            const state: IAutomationPipelineExecutionState = {trigger: pipelineExec.trigger};
            const actionsRegistry = _loadActionsOnDemand();

            let stepIndex = 0;
            for (const step of pipelineExec.steps) {
                const action = actionsRegistry.get(step.type);

                if (!action) {
                    logger.warn(
                        `No action implementation found for type "${step.type}" at step "${step.name ?? stepIndex}" in pipeline for rules ${pipelineExec.ruleId}, skipping`,
                    );
                    continue;
                }

                try {
                    await _validateActionParams(action, step.params);

                    const raw = await action.execute(step.params, state, ctx);

                    // void/undefined is treated as CONTINUE
                    const result: IActionExecutionResult = (raw as IActionExecutionResult | undefined) ?? {
                        status: ActionExecutionResultStatus.CONTINUE,
                    };

                    if (result.status === ActionExecutionResultStatus.STOP) {
                        logger.debug(
                            `Pipeline for rules ${pipelineExec.ruleId} stopped at step "${step.name ?? stepIndex}": ${result.reason ?? ''}`,
                        );
                        break;
                    }
                } catch (error) {
                    logger.error(
                        `Pipeline for rules ${pipelineExec.ruleId} interrupted at step "${step.name ?? stepIndex}": ${(error as Error).stack}`,
                    );
                    // TODO eventManager.sendDatabaseEvent AUTOMATION_PIPELINE_EXECUTION_ERROR with error details
                    return false;
                }
                stepIndex++;
            }
            // TODO maybe eventManager.sendDatabaseEvent AUTOMATION_PIPELINE_EXECUTION_SUCCESS
            return true;
        },
    };
}
