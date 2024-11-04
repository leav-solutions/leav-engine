// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import nodemailer from 'nodemailer';
import {IConfig} from '_types/config';

interface IDeps {
    config?: IConfig;
}

export async function initMailer({config}: IDeps): Promise<nodemailer.Transporter> {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: config.mailer.host,
        port: Number(config.mailer.port),
        secure: false,
        auth: {
            user: config.mailer.auth.user, //testAccount.user,
            pass: config.mailer.auth.password // testAccount.pass
        }
    });

    return transporter;
}
