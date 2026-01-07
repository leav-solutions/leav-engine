// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type IGlobalSettingsDomain} from 'domain/globalSettings/globalSettingsDomain';
import type nodemailer from 'nodemailer';
import {type Attachment} from 'nodemailer/lib/mailer';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';

export interface IMailerService {
    mailer?: nodemailer.Transporter;
    sendEmail?: ({to, subject, text, html, attachments, headers}: ISendMailParams, ctx: IQueryInfos) => Promise<void>;
}

interface IDeps {
    config: IConfig;
    'core.domain.globalSettings': IGlobalSettingsDomain;
    'core.infra.mailer': nodemailer.Transporter;
}

interface ISendMailParams {
    to: string;
    subject?: string;
    text?: string; // The plaintext version of the message
    html?: string; // The HTML version of the message,
    attachments?: Array<{filename: string; content?: string | Buffer; path?: string}>;
    headers?: Record<string, string>;
}

export default function ({
    config,
    'core.domain.globalSettings': globalSettingsDomain,
    'core.infra.mailer': mailer,
}: IDeps): IMailerService {
    return {
        mailer,
        async sendEmail({to, subject, text, html, attachments, headers}, ctx): Promise<void> {
            const globalSettings = await globalSettingsDomain.getSettings(ctx);
            const from = `${globalSettings.name || config.mailer.from.name} <${config.mailer.from.email}>`;

            logger.debug(`Sending email "${subject}" to ${to} from ${from}`);

            await mailer.sendMail({
                from,
                to,
                subject,
                text,
                html,
                attachments: attachments as Attachment[],
                headers,
            });
        },
    };
}
