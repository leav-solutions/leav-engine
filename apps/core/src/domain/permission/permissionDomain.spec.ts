// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type i18n} from 'i18next';
import {type IPermissionRepo} from 'infra/permission/permissionRepo';
import {type IConfig} from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {type ICacheService, type ICachesService} from '../../infra/cache/cacheService';
import {adminUserId, systemUserId} from '../../_constants/users';
import {
    AdminPermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions,
    RecordPermissionsActions,
} from '../../_types/permissions';
import {mockTranslator} from '../../__tests__/mocks/translator';
import {type IAdminPermissionDomain} from './adminPermissionDomain';
import {type IAttributePermissionDomain} from './attributePermissionDomain';
import {type ILibraryPermissionDomain} from './libraryPermissionDomain';
import permissionDomain, {type IPermissionDomainDeps} from './permissionDomain';
import {type IRecordAttributePermissionDomain} from './recordAttributePermissionDomain';
import {type IRecordPermissionDomain} from './recordPermissionDomain';
import {type ToAny} from 'utils/utils';

const mockCacheService: Mockify<ICacheService> = {
    getData: global.__mockPromise([null]),
    storeData: global.__mockPromise(),
    deleteData: global.__mockPromise(),
};

const mockCachesService: Mockify<ICachesService> = {
    getCache: jest.fn().mockReturnValue(mockCacheService),
};

const mockCtx: IQueryInfos = {
    userId: '1',
    queryId: 'permissionDomain.spec',
};

const depsBase: ToAny<IPermissionDomainDeps> = {
    'core.domain.permission.admin': jest.fn(),
    'core.domain.permission.library': jest.fn(),
    'core.domain.permission.record': jest.fn(),
    'core.domain.permission.attributeDependentValues': jest.fn(),
    'core.domain.permission.attribute': jest.fn(),
    'core.domain.permission.recordAttribute': jest.fn(),
    'core.domain.permission.tree': jest.fn(),
    'core.domain.permission.treeNode': jest.fn(),
    'core.domain.permission.treeLibrary': jest.fn(),
    'core.domain.permission.application': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.infra.permission': jest.fn(),
    'core.infra.cache.cacheService': jest.fn(),
    'core.domain.permission.helpers.defaultPermission': jest.fn(),
    translator: {},
    config: {},
};

describe('PermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest',
    };

    const mockAdminPermDomain: Mockify<IAdminPermissionDomain> = {
        getAdminPermission: global.__mockPromise(true),
        getInheritedAdminPermission: global.__mockPromise(true),
    };

    const mockEventsManagerDomain: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise(),
    };

    beforeEach(() => jest.clearAllMocks());

    describe('savePermission', () => {
        test('Should save a new permission', async function () {
            const permData = {
                type: PermissionTypes.RECORD,
                userGroup: 'users/12345',
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.EDIT_RECORD]: false,
                    [RecordPermissionsActions.DELETE_RECORD]: false,
                },
                permissionTreeTarget: 'test_lib/12345',
            };

            const mockPermRepo = {
                savePermission: global.__mockPromise(permData),
            } satisfies Mockify<IPermissionRepo>;

            const permDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                'core.domain.eventsManager': mockEventsManagerDomain as IEventsManagerDomain,
                'core.infra.permission': mockPermRepo as IPermissionRepo,
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
            });

            const newPerm = await permDomain.savePermission(
                {
                    type: PermissionTypes.RECORD,
                    usersGroup: 'users/12345',
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                        [RecordPermissionsActions.EDIT_RECORD]: false,
                        [RecordPermissionsActions.DELETE_RECORD]: false,
                    },
                    permissionTreeTarget: {
                        nodeId: '12345',
                        tree: 'test_tree',
                    },
                },
                {userId: '1'},
            );

            expect(mockPermRepo.savePermission.mock.calls.length).toBe(1);
            // disable cache temporary: expect(mockCacheService.deleteData).toBeCalledTimes(3);

            expect(newPerm).toMatchObject(permData);
        });
    });

    describe('isAllowed', () => {
        test('Return admin permission', async () => {
            const permsHelperDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.ADMIN,
                action: AdminPermissionsActions.CREATE_ATTRIBUTE,
                ctx,
            });

            expect(perm).toBe(true);
            expect(mockAdminPermDomain.getAdminPermission).toHaveBeenCalled();
        });

        test('Return library permission', async () => {
            const mockLibPermDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true),
            };

            const permsHelperDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.library': mockLibPermDomain as ILibraryPermissionDomain,
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.LIBRARY,
                action: AdminPermissionsActions.CREATE_ATTRIBUTE,
                applyTo: 'test_lib',
                ctx,
            });

            expect(perm).toBe(true);
            expect(mockLibPermDomain.getLibraryPermission).toHaveBeenCalled();
        });

        test('Return attribute permission', async () => {
            const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
                getAttributePermission: global.__mockPromise(true),
            };

            const permsHelperDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.attribute': mockAttrPermDomain as IAttributePermissionDomain,
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.ATTRIBUTE,
                action: AdminPermissionsActions.CREATE_ATTRIBUTE,
                applyTo: 'test_attr',
                ctx,
            });

            expect(perm).toBe(true);
            expect(mockAttrPermDomain.getAttributePermission).toHaveBeenCalled();
        });

        test('Return record permission', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true),
            };

            const permsHelperDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.RECORD,
                action: AdminPermissionsActions.CREATE_ATTRIBUTE,
                applyTo: 'test_lib',
                target: {
                    recordId: '1345',
                },
                ctx,
            });

            expect(perm).toBe(true);
            expect(mockRecordPermDomain.getRecordPermission).toHaveBeenCalled();
        });

        test('Throw if asked record permission without record ID', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true),
            };

            const permsHelperDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain,
            });

            // No target at all
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD,
                    action: AdminPermissionsActions.CREATE_ATTRIBUTE,
                    applyTo: 'test_lib',
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);

            // Empty target
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD,
                    action: AdminPermissionsActions.CREATE_ATTRIBUTE,
                    applyTo: 'test_lib',
                    target: {},
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);
        });

        test('Return record attribute permission', async () => {
            const mockRecordAttrPermDomain: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: global.__mockPromise(true),
            };

            const permsHelperDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.RECORD_ATTRIBUTE,
                action: RecordAttributePermissionsActions.EDIT_VALUE,
                applyTo: 'test_lib',
                target: {
                    recordId: '1345',
                    attributeId: 'test_attr',
                },
                ctx,
            });

            expect(perm).toBe(true);
            expect(mockRecordAttrPermDomain.getRecordAttributePermission).toHaveBeenCalled();
        });

        test('Throw if asked attribute permission without record and attribute ID', async () => {
            const mockRecordAttrPermDomain: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: global.__mockPromise(true),
            };

            const permsHelperDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain,
            });

            // No target at all
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action: RecordAttributePermissionsActions.EDIT_VALUE,
                    applyTo: 'test_lib',
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);

            // Missing record ID
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action: RecordAttributePermissionsActions.EDIT_VALUE,
                    applyTo: 'test_lib',
                    target: {},
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);

            // Missing attribute ID
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action: RecordAttributePermissionsActions.EDIT_VALUE,
                    applyTo: 'test_lib',
                    target: {
                        recordId: '12345',
                    },
                    ctx,
                }),
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('getActionsByType', () => {
        const mockConfig = {
            lang: {
                available: ['fr'],
            },
        };

        test('Return actions by type with registered actions', async () => {
            const permsDomain = permissionDomain({
                ...depsBase,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                config: mockConfig as IConfig,
                translator: mockTranslator as i18n,
            });

            // Register actions
            permsDomain.registerActions(PermissionTypes.ADMIN, ['test_perm']);

            // Retrieve actions
            const permsByType = await permsDomain.getActionsByType({type: PermissionTypes.ADMIN, ctx: mockCtx});

            expect(permsByType.findIndex(p => p.name === 'test_perm')).toBeGreaterThanOrEqual(0);
        });

        test('Return actions by type with registered actions, filtered', async () => {
            const permsDomain = permissionDomain({
                ...depsBase,
                config: mockConfig as IConfig,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                translator: mockTranslator as i18n,
            });

            // Register actions
            permsDomain.registerActions(PermissionTypes.ADMIN, ['test_perm'], ['my_lib_name']);
            permsDomain.registerActions(PermissionTypes.ADMIN, ['other_test_perm'], ['my_other_lib_name']);

            // Retrieve actions
            const permsByType = await permsDomain.getActionsByType({
                type: PermissionTypes.ADMIN,
                applyOn: 'my_lib_name',
                ctx: mockCtx,
            });

            expect(permsByType.findIndex(p => p.name === 'test_perm')).toBeGreaterThanOrEqual(0);
            expect(permsByType.findIndex(p => p.name === 'other_test_perm')).toBe(-1);

            const otherPermsByType = await permsDomain.getActionsByType({
                type: PermissionTypes.ADMIN,
                applyOn: 'my_other_lib_name',
                ctx: mockCtx,
            });

            expect(otherPermsByType.findIndex(p => p.name === 'other_test_perm')).toBeGreaterThanOrEqual(0);
            expect(otherPermsByType.findIndex(p => p.name === 'test_perm')).toBe(-1);
        });

        test('Return all actions if forced too', async () => {
            const permsDomain = permissionDomain({
                ...depsBase,
                config: mockConfig as IConfig,
                'core.domain.permission.admin': mockAdminPermDomain as IAdminPermissionDomain,
                translator: mockTranslator as i18n,
            });

            // Register actions
            permsDomain.registerActions(PermissionTypes.ADMIN, ['test_perm'], ['my_lib_name']);

            // Retrieve actions
            const permsByType = await permsDomain.getActionsByType({
                type: PermissionTypes.ADMIN,
                skipApplyOn: true,
                ctx: mockCtx,
            });

            expect(permsByType.findIndex(p => p.name === 'test_perm')).toBeGreaterThanOrEqual(0);
        });
    });

    describe('isAdminOrSystemUser', () => {
        test('Should return true for admin user', async () => {
            const permsDomain = permissionDomain(depsBase);

            expect(await permsDomain.isAdminOrSystemUser({userId: adminUserId})).toBe(true);
            expect(await permsDomain.isAdminOrSystemUser({userId: systemUserId})).toBe(true);
        });

        test('Should return false for non-admin user', async () => {
            const permsDomain = permissionDomain(depsBase);

            expect(await permsDomain.isAdminOrSystemUser({userId: '123'})).toBe(false);
        });
    });
});
