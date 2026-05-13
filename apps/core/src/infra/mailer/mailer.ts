import nodemailer from 'nodemailer';
import {type IConfig} from '../../_types/config';

interface IDeps {
    config?: IConfig;
}

export async function initMailer({config}: IDeps): Promise<nodemailer.Transporter> {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: config.mailer.host,
        port: Number(config.mailer.port),
        secure: config.mailer.secure,
        requireTLS: config.mailer.requireTLS,
        auth: {
            user: config.mailer.auth.user, //testAccount.user,
            pass: config.mailer.auth.password, // testAccount.pass
        },
    });

    return transporter;
}
