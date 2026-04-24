// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AutomationRuleTrigger} from '../../../_types/automation';
import {type AutomationRuleActions} from '../actions/_types';

export type AutomationPipelineToExecute = AutomationRulePipeline & {
    ruleId: string;
    trigger: AutomationRuleTrigger;
};

export type AutomationRulePipeline = {
    steps: AutomationRulePipelineStep[];
};

export type AutomationRulePipelineStep = {
    type: AutomationRuleActions | string; // string for custom/plugin actions
    name?: string;
    params: Record<string, unknown>;
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

export type IAutomationPipelineSuccess = {
    readonly results: Record<string, unknown>;
};

// Shared state passed through the pipeline during execution
export type IAutomationPipelineExecutionState = {
    readonly trigger: AutomationRuleTrigger;
    readonly results: IAutomationPipelineExecutionResults;
    readonly lastResult?: unknown;
    readonly startDateMs: number;
    stepIndex: number;
};

// Can be used by actions to store results for later steps, indexed by action type or custom keys
export type IAutomationPipelineExecutionResults = Record<string, unknown>;
