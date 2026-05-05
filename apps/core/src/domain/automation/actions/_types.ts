// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ZodObject} from 'zod';
import {
    type AutomationRulePipeline,
    type AutomationRulePipelineStep,
    type IAutomationPipelineExecutionState,
} from '../pipeline/_types';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type AutomationRuleTrigger} from '../../../_types/automation';

export enum AutomationRuleActions {
    LOG = 'log',
    CONDITION = 'condition',
    ERROR = 'error',
    JEXL_CALCULATION = 'jexlCalculation',
    MODIFY_ATTRIBUTE = 'modifyAttribute',
    NOTIFICATION = 'notification',
}

export type AutomationPipelineStepValidation<Params = unknown> = {
    readonly step: AutomationRulePipelineStep<Params>;
    readonly stepIndex: number;
    readonly trigger: AutomationRuleTrigger;
    readonly precedingStepsByExecOrder: AutomationRulePipelineStep[];
};

// Contract that every pipeline action must implement
export interface IAutomationAction<Params = unknown> {
    // Matches AutomationRulePipelineAction.type — supports built-in enum and custom/plugin actions
    readonly type: AutomationRuleActions | string;

    // Zod schema used by the pipeline executor to automatically validate params before execution.
    // Also available for standalone validation at rule save time.
    readonly paramsSchema: ZodObject<any>;

    // Optional custom validation beyond the Zod schema.
    // Called by the pipeline executor after paramsSchema validation succeeds.
    validateStep?: (params: AutomationPipelineStepValidation<Params>, ctx: IQueryInfos) => Promise<void>;

    // Executes the action. Returning void/undefined is equivalent to CONTINUE.
    execute(
        params: Params,
        state: IAutomationPipelineExecutionState,
        ctx: IQueryInfos,
    ): Promise<IActionExecutionResult | void>;
}

export enum ActionExecutionResultStatus {
    CONTINUE = 'continue',
    STOP = 'stop',
}

// Returned by an action to control pipeline flow.
// Returning void/undefined is treated as CONTINUE by the pipeline executor.
export type IActionExecutionResult =
    | {status: ActionExecutionResultStatus.CONTINUE; result?: unknown}
    | {status: ActionExecutionResultStatus.STOP; reason?: string};
