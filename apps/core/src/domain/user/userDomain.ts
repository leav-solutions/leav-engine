import {SystemLibraries} from '../../_constants/systemLibraries';
import {CommonAttributes, UsersAttributes} from '../../_constants/systemAttributes';
import * as bcrypt from 'bcryptjs';
import ValidationError from '../../errors/ValidationError';
import {type IGlobalSettingsDomain} from '../globalSettings/globalSettingsDomain';
import {type IPermissionDomain} from '../permission/permissionDomain';
import {type IRecordDomain} from '../record/recordDomain';
import {readFile} from 'fs/promises';
import handlebars from 'handlebars';
import {type i18n} from 'i18next';
import {type IMailerService} from '../../infra/mailer/mailerService';
import {type IUserDataRepo} from '../../infra/userData/userDataRepo';
import {type IUtils} from '../../utils/utils';
import {Errors} from '../../_types/errors';
import type * as Config from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IUserIdentity, type IUserData} from '../../_types/userData';
import PermissionError from '../../errors/PermissionError';
import {AdminPermissionsActions, PermissionTypes} from '../../_types/permissions';
import {type IStandardValue} from '../../_types/value';
import {type IValueDomain} from '../value/valueDomain';
import {AttributeCondition, type IRecord} from '../../_types/record';

interface ISaveUserDataParams {
    key: string;
    value: any;
    global: boolean;
    isCoreData?: boolean;
    ctx: IQueryInfos;
}

export interface IUserDomain {
    getUserRecord(userId: string, ctx: IQueryInfos): Promise<IRecord | null>;
    getUserIdentity(userId: string, ctx: IQueryInfos): Promise<IUserIdentity>;
    saveUserData(params: ISaveUserDataParams): Promise<IUserData>;
    getUserData(keys: string[], global: boolean, ctx: IQueryInfos): Promise<IUserData>;
    sendResetPasswordEmail(
        email: string,
        token: string,
        login: string,
        browser: string,
        os: string,
        lang: 'fr' | 'en',
        ctx: IQueryInfos,
    ): Promise<void>;
    verifyPassword(userId: string, password: string, ctx: IQueryInfos): Promise<boolean>;
}

export interface IUserDomainDeps {
    config: Config.IConfig;
    'core.domain.value': IValueDomain;
    'core.domain.record': IRecordDomain;
    'core.domain.permissions': IPermissionDomain;
    'core.infra.userData': IUserDataRepo;
    'core.domain.permission': IPermissionDomain;
    'core.infra.mailer.mailerService': IMailerService;
    'core.domain.globalSettings': IGlobalSettingsDomain;
    'core.utils': IUtils;
    translator: i18n;
}

export enum UserCoreDataKeys {
    CONSULTED_APPS = 'applications_consultation',
}

export default function ({
    config,
    'core.domain.value': valueDomain,
    'core.domain.record': recordDomain,
    'core.infra.userData': userDataRepo,
    'core.domain.permission': permissionDomain,
    'core.infra.mailer.mailerService': mailerService,
    'core.domain.globalSettings': globalSettingsDomain,
    'core.utils': utils,
    translator,
}: IUserDomainDeps): IUserDomain {
    const getUserEmail = async (userId: string, ctx: IQueryInfos): Promise<string | null> => {
        const values = await valueDomain.getValues({
            library: SystemLibraries.USERS,
            recordId: userId,
            attribute: UsersAttributes.EMAIL,
            ctx,
        });
        if (!values?.[0].payload) {
            throw new Error(`User ${userId} has no email defined`);
        }
        return values?.[0].payload as string;
    };

    return {
        /**
         * Retrieve the record of a user, or null if it doesn't exist or if the current user is not
         * allowed to access the users library.
         */
        async getUserRecord(userId: string, ctx: IQueryInfos): Promise<IRecord | null> {
            if (!userId) {
                return null;
            }

            let result: Awaited<ReturnType<IRecordDomain['find']>>;
            try {
                result = await recordDomain.find({
                    params: {
                        filters: [
                            {
                                field: CommonAttributes.ID,
                                value: userId,
                                condition: AttributeCondition.EQUAL,
                            },
                        ],
                        library: SystemLibraries.USERS,
                        retrieveInactive: true,
                    },
                    ctx,
                });
            } catch (error) {
                if (error instanceof PermissionError) {
                    return null;
                }
                throw error;
            }

            return result.list[0] ?? null;
        },
        async getUserIdentity(userId: string, ctx: IQueryInfos): Promise<IUserIdentity> {
            const recordIdentity = await recordDomain.getRecordIdentity(
                {
                    library: SystemLibraries.USERS,
                    id: userId,
                },
                ctx,
            );
            return {
                id: userId,
                getEmail: () => getUserEmail(userId, ctx),
                getLabel: () => recordIdentity.getLabel?.(),
            };
        },
        async sendResetPasswordEmail(
            email: string,
            token: string,
            login: string,
            browser: string,
            os: string,
            lang: 'fr' | 'en', // FIXME: temporary
            ctx: IQueryInfos,
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
                appName: globalSettings.name,
            });

            await mailerService.sendEmail(
                {
                    to: email,
                    subject: translator.t('mailer.reset_password_subject', {lng: lang}),
                    html: htmlWithData,
                },
                ctx,
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
                    ctx,
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
                ctx,
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
        },
        async verifyPassword(userId, password, ctx): Promise<boolean> {
            const userPwd: IStandardValue[] = await valueDomain.getValues({
                library: SystemLibraries.USERS,
                recordId: userId,
                attribute: UsersAttributes.PASSWORD,
                ctx,
                options: {skipActions: true},
            });

            return !!userPwd[0]?.payload && bcrypt.compare(password, userPwd[0].payload);
        },
    };
}
