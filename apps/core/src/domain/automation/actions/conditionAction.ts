// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {type IAutomationAction, AutomationRuleActions} from './_types';
import {type IActionExecutionResult, ActionExecutionResultStatus} from '../_types';

const conditionActionParamsSchema = z.object({
    result: z.boolean().meta({
        title: 'Condition result',
        description:
            'The boolean result of the condition. If true, the pipeline continues; if false, the pipeline stops.',
    }),
});
export type ConditionActionParams = z.infer<typeof conditionActionParamsSchema>;

export default function (): IAutomationAction<ConditionActionParams> {
    return {
        type: AutomationRuleActions.CONDITION,
        paramsSchema: conditionActionParamsSchema,
        async execute(params): Promise<IActionExecutionResult> {
            if (params.result) {
                return {status: ActionExecutionResultStatus.CONTINUE, result: true};
            }
            return {status: ActionExecutionResultStatus.STOP, reason: 'condition returned false'};
        },
    };
}
