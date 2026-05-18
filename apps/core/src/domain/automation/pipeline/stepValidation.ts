import {type AutomationPipelineStepValidation} from '../actions/_types';
import {type AutomationPipelineValidation, type AutomationRulePipelineStep} from './_types';

export function pipelineStepValidation<Params = Record<string, unknown>>(
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
