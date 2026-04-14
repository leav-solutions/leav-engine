// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {type ILogger, logger} from '@leav/logger';
import {AutomationRuleActions} from '../../../_types/automation';
import {type IAutomationAction} from '../types';

const logActionParamsSchema = z.object({
    message: z.string().meta({
        title: 'Log message',
        description: 'The message to log when this action is executed.',
    }),
    level: z.enum(['silly', 'debug', 'verbose', 'info', 'warn', 'error']).optional().meta({
        title: 'Log level',
        description: 'The level at which to log the message. Default is "info".',
    }),
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
            );
        },
    };
}
