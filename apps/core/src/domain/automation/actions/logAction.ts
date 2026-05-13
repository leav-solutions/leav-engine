import {z} from 'zod';
import {type ILogger, logger} from '@leav/logger';
import {type IAutomationAction, AutomationRuleActions, ActionExecutionResultStatus} from './_types';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';

const logActionParamsSchema = z.object({
    message: z.string().meta({
        title: 'Log message',
        description: 'The message to log when this action is executed.',
        ui: {
            title: 'automation.form.pipeline.params.log.message',
            placeholder: 'automation.form.pipeline.params.log.message_placeholder',
        },
    } satisfies ZodMetaUISchema),
    level: z
        .enum(['silly', 'debug', 'verbose', 'info', 'warn', 'error'])
        .optional()
        .meta({
            title: 'Log level',
            description: 'The level at which to log the message. Default is "info".',
            ui: {
                title: 'automation.form.pipeline.params.log.level',
                placeholder: 'automation.form.pipeline.params.log.level_placeholder',
            },
        } satisfies ZodMetaUISchema),
});

export type LogActionParams = z.infer<typeof logActionParamsSchema>;

export default function (): IAutomationAction<LogActionParams> {
    return {
        type: AutomationRuleActions.LOG,
        paramsSchema: logActionParamsSchema,
        async execute(params, state, ctx) {
            const level: keyof ILogger = params.level || 'info';
            logger[level](
                `Automation pipeline log action ${state.trigger.eventAction} for user ${ctx.userId}: ${params.message}`,
                {previousResults: state.results},
            );

            return {
                status: ActionExecutionResultStatus.CONTINUE,
                result: params.message,
            };
        },
    };
}
