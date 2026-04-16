// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {AutomationRuleActions} from '../../../_types/automation';
import {type IAutomationAction} from '../types';

const errorActionParamsSchema = z.object({
    message: z.string().meta({
        title: 'Error message',
        description: 'The error message to throw when this action is executed.',
    }),
});
export type ErrorActionParams = z.infer<typeof errorActionParamsSchema>;

export default function (): IAutomationAction<ErrorActionParams> {
    return {
        type: AutomationRuleActions.ERROR,
        paramsSchema: errorActionParamsSchema,
        async execute(params) {
            throw new Error(String(params.message));
        },
    };
}
