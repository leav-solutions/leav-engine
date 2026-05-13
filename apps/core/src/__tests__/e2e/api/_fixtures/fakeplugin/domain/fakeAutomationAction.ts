import z from 'zod';
import {logger} from '@leav/logger';
import {ActionExecutionResultStatus, type IAutomationAction} from '../../../../../../domain/automation/actions/_types';
import {type ZodMetaUISchema} from '../../../../../../_types/jsonSchemaForm';

const LogPluginAutomationActionParamsSchema = z.object({
    message: z.string().meta({
        title: 'Plugin log message',
        description: 'The message to log when this plugin action is executed.',
        ui: {
            title: 'automation.form.pipeline.params.plugin_log_action.message',
        },
    } satisfies ZodMetaUISchema),
});

export type LogPluginActionParams = z.infer<typeof LogPluginAutomationActionParamsSchema>;
export const FAKE_PLUGIN_AUTOMATION_ACTION_TYPE = 'plugin_log_action';

export const fakePluginAutomationAction: IAutomationAction<LogPluginActionParams> = {
    type: FAKE_PLUGIN_AUTOMATION_ACTION_TYPE,
    paramsSchema: LogPluginAutomationActionParamsSchema,
    async execute(params, state, ctx) {
        logger.info(
            `Automation pipeline plugin log action ${state.trigger.eventAction} for user ${ctx.userId}: ${params.message}`,
            {previousResults: state.results},
        );

        return {
            status: ActionExecutionResultStatus.CONTINUE,
            result: params.message,
        };
    },
};
