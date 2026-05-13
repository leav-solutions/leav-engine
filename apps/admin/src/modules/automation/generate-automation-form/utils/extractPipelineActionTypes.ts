// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RJSFSchema} from '@rjsf/utils';
import {type AutomationRuleActions} from '../../../../_gqlTypes';

export const extractPipelineActionTypes = (schema: RJSFSchema): AutomationRuleActions[] | undefined => {
    const stepsSchema = (schema.properties?.pipeline as RJSFSchema | undefined)?.properties?.steps as
        | RJSFSchema
        | undefined;
    const itemSchema = stepsSchema?.items as RJSFSchema | undefined;
    const typeEnum = (itemSchema?.properties?.type as {enum?: unknown[]} | undefined)?.enum;
    return typeEnum as AutomationRuleActions[] | undefined;
};
