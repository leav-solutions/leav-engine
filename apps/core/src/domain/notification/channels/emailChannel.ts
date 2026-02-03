// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type INotification, type INotificationChannel, NotificationChannels} from '../../../_types/notification';
import {type IQueryInfos} from '_types/queryInfos';
import {type IMailerService} from 'infra/mailer/mailerService';
import {type IUserDomain} from 'domain/user/userDomain';
import * as fs from 'fs';
import handlebars from 'handlebars';
import {type IGlobalSettingsDomain} from 'domain/globalSettings/globalSettingsDomain';
import {type IConfig} from '_types/config';
import {NOTIFICATION_EMAIL_TASK_ID_HEADER} from '../../../_constants/notifications';

export interface INotificationByEmailChannelDeps {
    config: IConfig;
    'core.infra.mailer.mailerService': IMailerService;
    'core.domain.globalSettings': IGlobalSettingsDomain;
    'core.domain.user': IUserDomain;
}

const templateLangs = ['en', 'fr'];

export default function ({
    config,
    'core.infra.mailer.mailerService': mailerService,
    'core.domain.globalSettings': globalSettingsDomain,
    'core.domain.user': userDomain,
}: INotificationByEmailChannelDeps): INotificationChannel {
    const emailTemplatesByLang: Record<string, handlebars.TemplateDelegate> = {};

    const getEmailTemplate = async (lang: string): Promise<handlebars.TemplateDelegate> => {
        const templateLang = getTemplateLang(lang);
        if (!emailTemplatesByLang[templateLang]) {
            const html = await fs.promises.readFile(__dirname + `/email_${templateLang}.html`, {encoding: 'utf-8'});
            emailTemplatesByLang[templateLang] = handlebars.compile(html);
        }
        return emailTemplatesByLang[templateLang];
    };

    const getTemplateLang = (lang: string): string => {
        if (templateLangs.includes(lang)) {
            return lang;
        }
        return config.lang.default;
    };

    const sendNotification = async (notification: INotification, ctx: IQueryInfos): Promise<void> => {
        const userIdentity = await userDomain.getUserIdentity(notification.userId, ctx);
        const email = await userIdentity.getEmail();
        const title = notification.title;
        const taskId = notification.taskId;

        logger.debug(`Sending email notification "${title}" ${taskId ? `for task "${taskId}"` : ''} to "${email}"`);

        const template = await getEmailTemplate(ctx.lang);
        const globalSettings = await globalSettingsDomain.getSettings(ctx);

        const htmlWithData = template({
            appName: globalSettings.name,
            publicUrl: config.server.publicUrl,
            message: notification.message,
            links: [...(notification.relatedEntities || []), ...(notification.attachments || [])],
        });

        await mailerService.sendEmail(
            {
                to: email,
                subject: title,
                html: htmlWithData,
                headers: taskId ? {[NOTIFICATION_EMAIL_TASK_ID_HEADER]: taskId} : undefined,
            },
            ctx,
        );
    };

    return {
        type: NotificationChannels.EMAIL,
        async sendNotifications(notifications: INotification[], ctx: IQueryInfos): Promise<void> {
            await Promise.all(
                notifications.map(async notification => {
                    try {
                        await sendNotification(notification, ctx);
                    } catch (error) {
                        logger.error(
                            `Error sending email notification "${notification.title}" to user ${notification.userId}: ${error.message}`,
                        );
                    }
                }),
            );
        },
    };
}
