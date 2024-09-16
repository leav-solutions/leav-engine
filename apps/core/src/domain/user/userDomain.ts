// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ValidationError from '../../errors/ValidationError';
import {IGlobalSettingsDomain} from 'domain/globalSettings/globalSettingsDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {readFile} from 'fs/promises';
import handlebars from 'handlebars';
import {i18n} from 'i18next';
import {IMailerService} from 'infra/mailer/mailerService';
import {IUserDataRepo} from 'infra/userData/userDataRepo';
import {IUtils} from 'utils/utils';
import {Errors} from '../../_types/errors';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import {IUserData} from '_types/userData';
import PermissionError from '../../errors/PermissionError';
import {AdminPermissionsActions, PermissionTypes} from '../../_types/permissions';

interface ISaveUserDataParams {
    key: string;
    value: any;
    global: boolean;
    isCoreData?: boolean;
    ctx: IQueryInfos;
}

export interface IUserDomain {
    saveUserData(params: ISaveUserDataParams): Promise<IUserData>;
    getUserData(keys: string[], global: boolean, ctx: IQueryInfos): Promise<IUserData>;
    sendResetPasswordEmail(
        email: string,
        token: string,
        login: string,
        browser: string,
        os: string,
        lang: 'fr' | 'en',
        ctx: IQueryInfos
    ): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.domain.permissions'?: IPermissionDomain;
    'core.infra.userData'?: IUserDataRepo;
    'core.domain.permission'?: IPermissionDomain;
    'core.infra.mailer.mailerService'?: IMailerService;
    'core.domain.globalSettings'?: IGlobalSettingsDomain;
    'core.utils'?: IUtils;
    translator?: i18n;
}

export enum UserCoreDataKeys {
    CONSULTED_APPS = 'applications_consultation'
}

export default function ({
    config = null,
    'core.infra.userData': userDataRepo = null,
    'core.domain.permission': permissionDomain = null,
    'core.infra.mailer.mailerService': mailerService = null,
    'core.domain.globalSettings': globalSettingsDomain = null,
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
            lang: 'fr' | 'en', // FIXME: temporary
            ctx: IQueryInfos
        ): Promise<void> {
            const html = await readFile(__dirname + `/resetPassword_${lang}.html`, {encoding: 'utf-8'});
            const template = handlebars.compile(html);

            const loginAppEndpoint = utils.getFullApplicationEndpoint('login');
            const globalSettings = await globalSettingsDomain.getSettings(ctx);

            const htmlWithData = template({
                login,
                resetPasswordUrl: `${config.server.publicUrl}/${loginAppEndpoint}/reset-password/${token}`,
                supportEmail: config.server.supportEmail,
                browser,
                appName: globalSettings.name
            });

            await mailerService.sendEmail(
                {
                    to: email,
                    subject: translator.t('mailer.reset_password_subject', {lng: lang}),
                    html: htmlWithData
                },
                ctx
            );
        },
        async saveUserData({key, value, global, isCoreData = false, ctx}: ISaveUserDataParams): Promise<IUserData> {
            if (!isCoreData && Object.values(UserCoreDataKeys).includes(key as UserCoreDataKeys)) {
                throw new ValidationError({key: Errors.FORBIDDEN_KEY});
            }

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

            return userDataRepo.saveUserData({key, value, global, isCoreData, ctx});
        },
        async getUserData(keys: string[], global = false, ctx: IQueryInfos): Promise<IUserData> {
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
