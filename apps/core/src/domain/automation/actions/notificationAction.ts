// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z} from 'zod';
import {type IAutomationAction, AutomationRuleActions, ActionExecutionResultStatus} from './_types';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';
import {type INotificationDomain} from '../../notification/notificationDomain';
import {NotificationChannels} from '../../../_types/notification';
import {type IJexlAutomation} from '../jexl/jexlAutomation';

const notificationActionParamsSchema = z.object({
    title: z.string().meta({
        title: 'Title',
        description: 'The title of the notification.',
        ui: {
            title: 'automation.form.pipeline.params.notification.title',
            placeholder: 'automation.form.pipeline.params.notification.title_placeholder',
        },
    } satisfies ZodMetaUISchema),
    recipients: z.string().meta({
        title: 'Recipients (Jexl expression)',
        description:
            'The Jexl expression to determine the recipients of the notification with a list of userIds (https://aristid.atlassian.net/wiki/spaces/PRODUIT/pages/2087256077/Calcul+Jexl). ',
        ui: {
            title: 'automation.form.pipeline.params.notification.recipients',
            placeholder: 'automation.form.pipeline.params.notification.recipients_placeholder',
        },
    } satisfies ZodMetaUISchema),
    message: z.string().meta({
        title: 'Message (Jexl expression)',
        description:
            'The Jexl expression to determine the message of the notification (https://aristid.atlassian.net/wiki/spaces/PRODUIT/pages/2087256077/Calcul+Jexl).',
        ui: {
            title: 'automation.form.pipeline.params.notification.message',
            placeholder: 'automation.form.pipeline.params.notification.message_placeholder',
        },
    } satisfies ZodMetaUISchema),
    mail: z
        .boolean()
        .optional()
        .meta({
            title: 'Send as email',
            description:
                'Whether to send the notification as an email (if false, it will be sent as a websocket notification only).',
            ui: {
                title: 'automation.form.pipeline.params.notification.mail',
            },
        } satisfies ZodMetaUISchema),
});

export type NotificationActionParams = z.infer<typeof notificationActionParamsSchema>;

interface INotificationActionDeps {
    'core.domain.automation.jexl': IJexlAutomation;
    'core.domain.notification': INotificationDomain;
}

export default function ({
    'core.domain.automation.jexl': jexlAutomation,
    'core.domain.notification': notification,
}: INotificationActionDeps): IAutomationAction<NotificationActionParams> {
    return {
        type: AutomationRuleActions.NOTIFICATION,
        paramsSchema: notificationActionParamsSchema,
        validateStep: async params => {
            await Promise.all([
                jexlAutomation.validate(params.step.params.recipients),
                jexlAutomation.validate(params.step.params.message),
            ]);
        },
        async execute(params, state, ctx) {
            const {title, recipients, message: jexlMessage, mail = false} = params;

            const jexlCtx = jexlAutomation.buildAutomationContext(state, ctx);

            const userIds = await jexlAutomation.eval<string[]>(recipients, jexlCtx);
            const message = await jexlAutomation.eval<string>(jexlMessage, jexlCtx);

            if (!Array.isArray(userIds) || !userIds.every(id => typeof id === 'string')) {
                throw new Error('Recipients expression must evaluate to an array of strings.');
            } else if (typeof message !== 'string') {
                throw new Error('Message expression must evaluate to a string.');
            }

            if (userIds.length) {
                await notification.createNotification(
                    {
                        emitterUserId: ctx.userId,
                        recipients: {userIds, groupIds: []},
                        content: {
                            level: 'info',
                            title,
                            message,
                        },
                        channels: [NotificationChannels.WEB_SOCKET, ...(mail ? [NotificationChannels.EMAIL] : [])],
                    },
                    ctx,
                );
            }

            return {
                status: ActionExecutionResultStatus.CONTINUE,
                result: {userIdsNotified: userIds},
            };
        },
    };
}
