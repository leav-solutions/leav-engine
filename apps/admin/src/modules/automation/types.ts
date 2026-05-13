import {type AutomationRuleActions, type AutomationRuleTriggerInput} from '../../_gqlTypes';

export type PipelineStep = {
    type: AutomationRuleActions;
    name?: string;
    params: Record<string, unknown>;
};

export type AutomationFormContext = {
    pipelineStepsData?: PipelineStep[];
    addPipelineStep?: (actionType: AutomationRuleActions) => void;
};

export type AutomationFormValues = {
    active?: boolean;
    label: string;
    description: string;
    trigger?: AutomationRuleTriggerInput;
    pipeline?: {steps: PipelineStep[]};
};
