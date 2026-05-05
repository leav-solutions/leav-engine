// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type AutomationPipelineStepValidation} from '../actions/_types';
import {type AutomationPipelineValidation, type AutomationRulePipelineStep} from './_types';

export function pipelineStepValidation<Params>(
    pipelineToValidate: AutomationPipelineValidation,
    stepIndex: number,
): AutomationPipelineStepValidation<Params> {
    return {
        get step() {
            return pipelineToValidate.steps[stepIndex] as AutomationRulePipelineStep<Params>;
        },
        get stepIndex() {
            return stepIndex;
        },
        get trigger() {
            return pipelineToValidate.trigger;
        },
        get precedingStepsByExecOrder() {
            return pipelineToValidate.steps.slice(0, stepIndex);
        },
    };
}
