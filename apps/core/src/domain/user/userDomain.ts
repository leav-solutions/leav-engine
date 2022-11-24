// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {readFile} from 'fs/promises';
import {IMailerService} from 'infra/mailer/mailerService';
import {IUserDataRepo} from 'infra/userData/userDataRepo';
import {IQueryInfos} from '_types/queryInfos';
import {IUserData} from '_types/userData';
import PermissionError from '../../errors/PermissionError';
import {AdminPermissionsActions, PermissionTypes} from '../../_types/permissions';
import handlebars from 'handlebars';
import * as Config from '_types/config';
import {i18n} from 'i18next';
import {IUtils} from 'utils/utils';

export interface IUserDomain {
    saveUserData(key: string, value: any, global: boolean, ctx: IQueryInfos): Promise<IUserData>;
    getUserData(keys: string[], global: boolean, ctx: IQueryInfos): Promise<IUserData>;
    sendResetPasswordEmail(
        email: string,
        token: string,
        login: string,
        browser: string,
        os: string,
        lang: 'fr' | 'en'
    ): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.domain.permissions'?: IPermissionDomain;
    'core.infra.userData'?: IUserDataRepo;
    'core.domain.permission'?: IPermissionDomain;
    'core.infra.mailer.mailerService'?: IMailerService;
    'core.utils'?: IUtils;
    translator?: i18n;
}

export default function ({
    config = null,
    'core.infra.userData': userDataRepo = null,
    'core.domain.permission': permissionDomain = null,
    'core.infra.mailer.mailerService': mailerService = null,
    'core.utils': utils = null,
    translator = null
}: IDeps = {}): IUserDomain {
    return {
        async sendResetPasswordEmail(
            email: string,
            token: string,
            login: string,
            browser: string,
            os: string,
            lang: 'fr' | 'en' // FIXME: temporary
        ): Promise<void> {
            const html = await readFile(__dirname + `/resetPassword_${lang}.html`, {encoding: 'utf-8'});
            const template = handlebars.compile(html);

            const loginAppEndpoint = utils.getFullApplicationEndpoint('login');

            const htmlWithData = template({
                login,
                resetPasswordUrl: `${config.server.publicUrl}/${loginAppEndpoint}/reset-password/${token}`,
                supportEmail: config.server.supportEmail,
                browser,
                os
            });

            await mailerService.sendEmail({
                to: email,
                subject: translator.t('mailer.reset_password_subject', {lng: lang}),
                html: htmlWithData
            });
        },
        async saveUserData(key: string, value: any, global: boolean, ctx: IQueryInfos): Promise<IUserData> {
            if (
                global &&
                !(await permissionDomain.isAllowed({
                    type: PermissionTypes.ADMIN,
                    action: AdminPermissionsActions.MANAGE_GLOBAL_PREFERENCES,
                    userId: ctx.userId,
                    ctx
                }))
            ) {
                throw new PermissionError(AdminPermissionsActions.MANAGE_GLOBAL_PREFERENCES);
            }

            return userDataRepo.saveUserData(key, value, global, ctx);
        },
        async getUserData(keys: string[], global: boolean = false, ctx: IQueryInfos): Promise<IUserData> {
            const isAllowed = await permissionDomain.isAllowed({
                type: PermissionTypes.ADMIN,
                action: AdminPermissionsActions.MANAGE_GLOBAL_PREFERENCES,
                userId: ctx.userId,
                ctx
            });

            if (global && !isAllowed) {
                throw new PermissionError(AdminPermissionsActions.MANAGE_GLOBAL_PREFERENCES);
            }

            const res = await userDataRepo.getUserData(keys, global, ctx);

            if (isAllowed && !global) {
                for (const k of keys) {
                    if (typeof res.data[k] === 'undefined') {
                        const globalData = (await userDataRepo.getUserData([k], true, ctx)).data;
                        res.data[k] = globalData ? globalData[k] : null;
                    }
                }
            }

            return res;
        }
    };
}
