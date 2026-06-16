import {SystemLibraries} from '../../../_constants/systemLibraries';
import {z} from 'zod';
import {type IAutomationAction, AutomationRuleActions, ActionExecutionResultStatus} from './_types';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';
import {type INotificationDomain} from '../../notification/notificationDomain';
import {NotificationChannels} from '../../../_types/notification';
import {type IJexlAutomation} from '../jexl/jexlAutomation';
import {type IRecord} from '../../../_types/record';
import ValidationError from '../../../errors/ValidationError';

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
            'The Jexl expression to determine the recipients of the notification with a list of user record (https://aristid.atlassian.net/wiki/spaces/PRODUIT/pages/2087256077/Calcul+Jexl). ',
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
    function _checkIsUserRecord(record: IRecord): boolean {
        return typeof record.id === 'string' && record.library === SystemLibraries.USERS;
    }

    function _extractRecordIds(records: IRecord[], library: string): string[] {
        return records.filter(record => record.library === library).map(record => record.id);
    }

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

            // For now, accept ony users record, but later we could accept groups as well
            const recipientsRecordMaybeArray = await jexlAutomation.eval<IRecord | IRecord[]>(recipients, jexlCtx);
            const message = await jexlAutomation.eval<string>(jexlMessage, jexlCtx);

            const recipientsRecords = Array.isArray(recipientsRecordMaybeArray)
                ? recipientsRecordMaybeArray
                : [recipientsRecordMaybeArray];
            if (!recipientsRecords.every(_checkIsUserRecord)) {
                throw new ValidationError(
                    {
                        recipients: 'Recipients expression must evaluate to a single or array of user records',
                    },
                    'Invalid recipients',
                    true,
                    {recipientsRecords},
                );
            } else if (typeof message !== 'string') {
                throw new ValidationError(
                    {
                        message: 'Message expression must evaluate to a string.',
                    },
                    'Invalid message',
                    true,
                    {message},
                );
            }

            const userIds = _extractRecordIds(recipientsRecords, SystemLibraries.USERS);

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
