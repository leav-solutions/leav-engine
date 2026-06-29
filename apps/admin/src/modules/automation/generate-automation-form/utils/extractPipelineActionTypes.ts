import {type RJSFSchema} from '@rjsf/utils';
import {type AutomationRuleActions} from '../../../../_gqlTypes';

export const extractPipelineActionTypes = (schema: RJSFSchema): AutomationRuleActions[] | undefined => {
    const stepsSchema = (schema.properties?.pipeline as RJSFSchema | undefined)?.properties?.steps as
        RJSFSchema | undefined;
    const itemSchema = stepsSchema?.items as RJSFSchema | undefined;
    const typeEnum = (itemSchema?.properties?.type as {enum?: unknown[]} | undefined)?.enum;
    return typeEnum as AutomationRuleActions[] | undefined;
};
