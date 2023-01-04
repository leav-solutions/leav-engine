// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGlobalSettingsDomain} from 'domain/globalSettings/globalSettingsDomain';
import nodemailer from 'nodemailer';
import {Attachment} from 'nodemailer/lib/mailer';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';

export interface IMailerService {
    mailer?: nodemailer.Transporter;
    sendEmail?: ({to, subject, text, html, attachments}: ISendMailParams, ctx: IQueryInfos) => Promise<void>;
}

interface IDeps {
    config?: IConfig;
    'core.domain.globalSettings'?: IGlobalSettingsDomain;
    'core.infra.mailer'?: nodemailer.Transporter;
}

interface ISendMailParams {
    to: string;
    subject?: string;
    text?: string; // The plaintext version of the message
    html?: string; // The HTML version of the message,
    attachments?: Array<{filename: string; content?: string | Buffer; path?: string}>;
}

export default function({
    config = null,
    'core.domain.globalSettings': globalSettingsDomain = null,
    'core.infra.mailer': mailer = null
}: IDeps = {}): IMailerService {
    return {
        mailer,
        async sendEmail({to, subject, text, html, attachments}, ctx): Promise<void> {
            const globalSettings = await globalSettingsDomain.getSettings(ctx);

            await mailer.sendMail({
                from: `${globalSettings.name} <${config.mailer.auth.user}>`,
                to,
                subject,
                text,
                html,
                attachments: attachments as Attachment[]
            });
        }
    };
}
