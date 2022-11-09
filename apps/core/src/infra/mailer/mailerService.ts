// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import nodemailer from 'nodemailer';
import {Attachment} from 'nodemailer/lib/mailer';
import {IConfig} from '_types/config';

export interface IMailerService {
    mailer?: nodemailer.Transporter;
    sendEmail?: ({to, subject, text, html, attachments}: ISendMailParams) => Promise<void>;
}

interface IDeps {
    config?: IConfig;
    'core.infra.mailer'?: nodemailer.Transporter;
}

interface ISendMailParams {
    to: string;
    subject?: string;
    text?: string; // The plaintext version of the message
    html?: string; // The HTML version of the message,
    attachments?: Array<{filename: string; content?: string | Buffer; path?: string}>;
}

export default function ({config = null, 'core.infra.mailer': mailer = null}: IDeps = {}): IMailerService {
    return {
        mailer,
        async sendEmail({to, subject, text, html, attachments}: ISendMailParams): Promise<void> {
            await mailer.sendMail({
                from: config.mailer.auth.user,
                to,
                subject,
                text,
                html,
                attachments: attachments as Attachment[]
            });
        }
    };
}
