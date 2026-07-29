import {SystemLibraries} from '../../_constants/systemLibraries';
import {type IGlobalSettingsDomain} from '../globalSettings/globalSettingsDomain';
import {type IPermissionDomain} from '../permission/permissionDomain';
import {type IRecordDomain} from '../record/recordDomain';
import {type i18n} from 'i18next';
import {type IMailerService} from '../../infra/mailer/mailerService';
import {type IUserDataRepo} from '../../infra/userData/userDataRepo';
import {type IUtils, type ToAny} from '../../utils/utils';
import {type IConfig} from '../../_types/config';
import {LibraryPermissionsActions} from '../../_types/permissions';
import {type IQueryInfos} from '../../_types/queryInfos';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';
import {mockRecord} from '../../__tests__/mocks/record';
import {mockCtx} from '../../__tests__/mocks/shared';
import {mockTranslator} from '../../__tests__/mocks/translator';
import userDataDomain, {type IUserDomainDeps, UserCoreDataKeys} from './userDomain';

const depsBase: ToAny<IUserDomainDeps> = {
    config: {},
    'core.domain.permissions': vi.fn(),
    'core.infra.userData': vi.fn(),
    'core.domain.permission': vi.fn(),
    'core.infra.mailer.mailerService': vi.fn(),
    'core.domain.globalSettings': vi.fn(),
    'core.domain.value': vi.fn(),
    'core.domain.record': vi.fn(),
    'core.utils': vi.fn(),
    translator: {},
};

describe('UserDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'userDataDomainTest',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('get user record', () => {
        test('should return the user record', async function () {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({list: [mockRecord], totalCount: 1}),
            };

            const udd = userDataDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
            });

            const res = await udd.getUserRecord('1', ctx);

            expect(res).toBe(mockRecord);
            expect(mockRecordDomain.find.mock.calls[0][0].params).toMatchObject({
                library: SystemLibraries.USERS,
                retrieveInactive: true,
            });
        });

        test('should return null if the user does not exist', async function () {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({list: [], totalCount: 0}),
            };

            const udd = userDataDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
            });

            await expect(udd.getUserRecord('unknown_user', ctx)).resolves.toBeNull();
        });

        test('should return null if the users library is not accessible', async function () {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: vi.fn().mockRejectedValue(new PermissionError(LibraryPermissionsActions.ACCESS_LIBRARY)),
            };

            const udd = userDataDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
            });

            await expect(udd.getUserRecord('1', ctx)).resolves.toBeNull();
        });

        test('should not search anything if no user id is given', async function () {
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({list: [mockRecord], totalCount: 1}),
            };

            const udd = userDataDomain({
                ...depsBase,
                'core.domain.record': mockRecordDomain as IRecordDomain,
            });

            await expect(udd.getUserRecord(undefined, ctx)).resolves.toBeNull();
            expect(mockRecordDomain.find).not.toHaveBeenCalled();
        });
    });

    describe('save user data', () => {
        test('should save a user preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true),
            };

            const mockUserDataRepo = {
                saveUserData: global.__mockPromise(true),
            } satisfies Mockify<IUserDataRepo>;

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain,
            });

            const res = await udd.saveUserData({key: 'test1', value: 1, global: false, ctx});

            expect(mockUserDataRepo.saveUserData.mock.calls.length).toBe(1);
            expect(res).toBeTruthy();
        });

        test('should save a global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true),
            };

            const mockUserDataRepo = {
                saveUserData: global.__mockPromise(true),
            } satisfies Mockify<IUserDataRepo>;

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain,
            });

            const res = await udd.saveUserData({key: 'test3', value: 3, global: true, ctx});

            expect(mockUserDataRepo.saveUserData.mock.calls.length).toBe(1);
            expect(res).toBeTruthy();
        });

        test('should throw on saving global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(false),
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                saveUserData: global.__mockPromise(true),
            };

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain,
            });

            await expect(udd.saveUserData({key: 'test2', value: 2, global: true, ctx})).rejects.toThrow(
                PermissionError,
            );
        });

        test('should throw if key is forbidden', async function () {
            const udd = userDataDomain(depsBase); //{

            await expect(
                udd.saveUserData({key: UserCoreDataKeys.CONSULTED_APPS, value: ['fake'], global: false, ctx}),
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('get user data', () => {
        test('should get a user preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true),
            };

            const mockUserDataRepo = {
                getUserData: global.__mockPromise({global: false, data: {key: 'data'}}),
            } satisfies Mockify<IUserDataRepo>;

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain,
            });

            const res = await udd.getUserData(['key'], false, ctx);

            expect(mockUserDataRepo.getUserData.mock.calls.length).toBe(1);
            expect(res).toEqual({global: false, data: {key: 'data'}});
        });

        test('should get a global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(true),
            };

            const mockUserDataRepo = {
                getUserData: global.__mockPromise({global: true, data: {key: 'data'}}),
            } satisfies Mockify<IUserDataRepo>;

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain,
            });

            const res = await udd.getUserData(['key'], true, ctx);

            expect(mockUserDataRepo.getUserData.mock.calls.length).toBe(1);
            expect(res).toEqual({global: true, data: {key: 'data'}});
        });

        test('should throw on getting global preference', async function () {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                isAllowed: global.__mockPromise(false),
            };

            const mockUserDataRepo: Mockify<IUserDataRepo> = {
                getUserData: global.__mockPromise({global: true, data: {key: 'data'}}),
            };

            const udd = userDataDomain({
                ...depsBase,
                'core.infra.userData': mockUserDataRepo as IUserDataRepo,
                'core.domain.permission': mockPermDomain as IPermissionDomain,
            });

            await expect(udd.getUserData(['key'], true, ctx)).rejects.toThrow(PermissionError);
        });
    });

    describe('Reset password email', () => {
        const mockGlobalSettingsDomain: Mockify<IGlobalSettingsDomain> = {
            getSettings: global.__mockPromise({
                name: 'my app',
                icon: null,
            }),
        };

        test('should send a reset password email', async function () {
            const mockUtils: Mockify<IUtils> = {
                getFullApplicationEndpoint: vi.fn().mockReturnValue('endpoint'),
            };

            const mockMailerService = {
                sendEmail: global.__mockPromise(true),
            } satisfies Mockify<IMailerService>;

            const mockConfig = {
                server: {
                    publicUrl: 'http://localhost:4001',
                    supportEmail: 'email@domain.com',
                },
            };

            const udd = userDataDomain({
                ...depsBase,
                config: mockConfig as IConfig,
                'core.domain.globalSettings': mockGlobalSettingsDomain as IGlobalSettingsDomain,
                'core.infra.mailer.mailerService': mockMailerService as IMailerService,
                'core.utils': mockUtils as IUtils,
                translator: mockTranslator as i18n,
            });

            await udd.sendResetPasswordEmail('email@domain.com', 'token', 'login', 'firefox', 'Os X', 'fr', mockCtx);

            expect(mockMailerService.sendEmail.mock.calls.length).toBe(1);
        });
    });
});
