// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IGlobalSettingsDomain} from 'domain/globalSettings/globalSettingsDomain';
import {IPermissionDomain} from 'domain/permission/permissionDomain';
import {i18n} from 'i18next';
import {IMailerService} from 'infra/mailer/mailerService';
import {IUserDataRepo} from 'infra/userData/userDataRepo';
import {IUtils, ToAny} from 'utils/utils';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {mockCtx} from '../../__tests__/mocks/shared';
import {mockTranslator} from '../../__tests__/mocks/translator';
import userDataDomain, {IUserDomainDeps, UserCoreDataKeys} from './userDomain';

const depsBase: ToAny<IUserDomainDeps> = {
    config: {},
    'core.domain.permissions': jest.fn(),
    'core.infra.userData': jest.fn(),
    'core.domain.permission': jest.fn(),
    'core.infra.mailer.mailerService': jest.fn(),
    'core.domain.globalSettings': jest.fn(),
    'core.utils': jest.fn(),
    translator: {}
};

describe('UserDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'userDataDomainTest'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('save user data', () => {
        test('should save a user preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true)
            };

            const mockUserDataRepo = {
                saveUserData: global.__mockPromise(true)
            } satisfies Mockify<IUserDataRepo>;

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const res = await udd.saveUserData({key: 'test1', value: 1, global: false, ctx});

            expect(mockUserDataRepo.saveUserData.mock.calls.length).toBe(1);
            expect(res).toBeTruthy();
        });

        test('should save a global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true)
            };

            const mockUserDataRepo = {
                saveUserData: global.__mockPromise(true)
            } satisfies Mockify<IUserDataRepo>;

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const res = await udd.saveUserData({key: 'test3', value: 3, global: true, ctx});

            expect(mockUserDataRepo.saveUserData.mock.calls.length).toBe(1);
            expect(res).toBeTruthy();
        });

        test('should throw on saving global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(false)
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                saveUserData: global.__mockPromise(true)
            };

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            await expect(udd.saveUserData({key: 'test2', value: 2, global: true, ctx})).rejects.toThrow(
                PermissionError
            );
        });

        test('should throw if key is forbidden', async function () {
            const udd = userDataDomain(depsBase); //{

            await expect(
                udd.saveUserData({key: UserCoreDataKeys.CONSULTED_APPS, value: ['fake'], global: false, ctx})
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('get user data', () => {
        test('should get a user preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true)
            };

            const mockUserDataRepo = {
                getUserData: global.__mockPromise({global: false, data: {key: 'data'}})
            } satisfies Mockify<IUserDataRepo>;

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const res = await udd.getUserData(['key'], false, ctx);

            expect(mockUserDataRepo.getUserData.mock.calls.length).toBe(1);
            expect(res).toEqual({global: false, data: {key: 'data'}});
        });

        test('should get a global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true)
            };

            const mockUserDataRepo = {
                getUserData: global.__mockPromise({global: true, data: {key: 'data'}})
            } satisfies Mockify<IUserDataRepo>;

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const res = await udd.getUserData(['key'], true, ctx);

            expect(mockUserDataRepo.getUserData.mock.calls.length).toBe(1);
            expect(res).toEqual({global: true, data: {key: 'data'}});
        });

        test('should throw on getting global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(false)
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                getUserData: global.__mockPromise({global: true, data: {key: 'data'}})
            };

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            await expect(udd.getUserData(['key'], true, ctx)).rejects.toThrow(PermissionError);
        });
    });

    describe('Reset password email', () => {
        const mockGlobalSettingsDomain: Mockify<IGlobalSettingsDomain> = {
            getSettings: global.__mockPromise({
                name: 'my app',
                icon: null
            })
        };

        test('should send a reset password email', async function () {
            const mockUtils: Mockify<IUtils> = {
                getFullApplicationEndpoint: jest.fn().mockReturnValue('endpoint')
            };

            const mockMailerService = {
                sendEmail: global.__mockPromise(true)
            } satisfies Mockify<IMailerService>;

            const mockConfig = {
                server: {
                    publicUrl: 'http://localhost:4001',
                    supportEmail: 'email@domain.com'
                }
            };

            const udd = userDataDomain({
                ...depsBase,
                config: mockConfig as IConfig,
                'core.domain.globalSettings': mockGlobalSettingsDomain as IGlobalSettingsDomain,
                'core.infra.mailer.mailerService': mockMailerService as IMailerService,
                'core.utils': mockUtils as IUtils,
                translator: mockTranslator as i18n
            });

            await udd.sendResetPasswordEmail('email@domain.com', 'token', 'login', 'firefox', 'Os X', 'fr', mockCtx);

            expect(mockMailerService.sendEmail.mock.calls.length).toBe(1);
        });
    });
});
