// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AutomationRuleTrigger} from '../../_types/automation';

export enum ActionExecutionResultStatus {
    CONTINUE = 'continue',
    STOP = 'stop',
}

// Returned by an action to control pipeline flow.
// Returning void/undefined is treated as CONTINUE by the pipeline executor.
export type IActionExecutionResult =
    | {status: ActionExecutionResultStatus.CONTINUE; result?: unknown}
    | {status: ActionExecutionResultStatus.STOP; reason?: string};

// Can be used by actions to store results for later steps, indexed by action type or custom keys
export type IAutomationPipelineExecutionResults = Record<string, unknown>;

// Shared state passed through the pipeline during execution
export type IAutomationPipelineExecutionState = {
    readonly trigger: AutomationRuleTrigger;
    readonly results: IAutomationPipelineExecutionResults;
    readonly startDateMs: number;
};

export type IAutomationPipelineSuccess = {
    readonly results: Record<string, unknown>;
};

export type IAutomationPipelineFailure = {
    readonly results: Record<
        string,
        | unknown
        | {
              stack?: string;
              message: string;
              name: string;
              [k: string]: unknown;
          }
    >;
};
