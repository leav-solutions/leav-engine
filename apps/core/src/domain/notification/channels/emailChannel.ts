// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type INotification, type INotificationChannel, NotificationChannels} from '../../../_types/notification';
import {type IQueryInfos} from '_types/queryInfos';
import {type IMailerService} from 'infra/mailer/mailerService';

export interface INotificationByEmailChannelDeps {
    'core.infra.mailer.mailerService': IMailerService;
}

export default function ({
    'core.infra.mailer.mailerService': mailerService
}: INotificationByEmailChannelDeps): INotificationChannel {
    return {
        type: NotificationChannels.EMAIL,
        async sendNotifications(notifications: INotification[], ctx: IQueryInfos): Promise<void> {
            // userDomain.getUserEmail / getRecordFieldValue ...

            for (const notification of notifications) {
                logger.debug(
                    `Sending email notification "${notification.content.title}" to ${notification.recipientUserId}`
                );
            }

            // mailerService.sendEmail
        }
    };
}
