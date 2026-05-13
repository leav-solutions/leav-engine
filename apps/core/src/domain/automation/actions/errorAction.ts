import {z} from 'zod';
import {AutomationRuleActions, type IAutomationAction} from './_types';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';

const errorActionParamsSchema = z.object({
    message: z.string().meta({
        title: 'Error message',
        description: 'The error message to throw when this action is executed.',
        ui: {
            title: 'automation.form.pipeline.params.error.message',
            placeholder: 'automation.form.pipeline.params.error.message_placeholder',
        },
    } satisfies ZodMetaUISchema),
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
