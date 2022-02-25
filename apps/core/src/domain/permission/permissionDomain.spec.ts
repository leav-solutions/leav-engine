// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {i18n} from 'i18next';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IConfig} from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {
    AppPermissionsActions,
    PermissionTypes,
    RecordAttributePermissionsActions,
    RecordPermissionsActions
} from '../../_types/permissions';
import {mockTranslator} from '../../__tests__/mocks/translator';
import {IAppPermissionDomain} from './appPermissionDomain';
import {IAttributePermissionDomain} from './attributePermissionDomain';
import {ILibraryPermissionDomain} from './libraryPermissionDomain';
import permissionDomain from './permissionDomain';
import {IRecordAttributePermissionDomain} from './recordAttributePermissionDomain';
import {IRecordPermissionDomain} from './recordPermissionDomain';

describe('PermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    const mockAppPermDomain: Mockify<IAppPermissionDomain> = {
        getAppPermission: global.__mockPromise(true),
        getInheritedAppPermission: global.__mockPromise(true)
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
                    [RecordPermissionsActions.DELETE_RECORD]: false
                },
                permissionTreeTarget: 'test_lib/12345'
            };

            const mockPermRepo: Mockify<IPermissionRepo> = {
                savePermission: global.__mockPromise(permData)
            };

            const permDomain = permissionDomain({
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain,
                'core.infra.permission': mockPermRepo as IPermissionRepo
            });

            const newPerm = await permDomain.savePermission(
                {
                    type: PermissionTypes.RECORD,
                    usersGroup: 'users/12345',
                    actions: {
                        [RecordPermissionsActions.ACCESS_RECORD]: true,
                        [RecordPermissionsActions.EDIT_RECORD]: false,
                        [RecordPermissionsActions.DELETE_RECORD]: false
                    },
                    permissionTreeTarget: {
                        nodeId: '12345',
                        tree: 'test_tree'
                    }
                },
                {userId: '1'}
            );

            expect(mockPermRepo.savePermission.mock.calls.length).toBe(1);

            expect(newPerm).toMatchObject(permData);
        });
    });

    describe('isAllowed', () => {
        test('Return admin permission', async () => {
            const permsHelperDomain = permissionDomain({
                'core.domain.permission.app': mockAppPermDomain as IAppPermissionDomain
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.APP,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '123',
                ctx
            });

            expect(perm).toBe(true);
            expect(mockAppPermDomain.getAppPermission).toHaveBeenCalled();
        });

        test('Return library permission', async () => {
            const mockLibPermDomain: Mockify<ILibraryPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionDomain({
                'core.domain.permission.library': mockLibPermDomain as ILibraryPermissionDomain
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.LIBRARY,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '123',
                applyTo: 'test_lib',
                ctx
            });

            expect(perm).toBe(true);
            expect(mockLibPermDomain.getLibraryPermission).toHaveBeenCalled();
        });

        test('Return attribute permission', async () => {
            const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
                getAttributePermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionDomain({
                'core.domain.permission.attribute': mockAttrPermDomain as IAttributePermissionDomain
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.ATTRIBUTE,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '123',
                applyTo: 'test_attr',
                ctx
            });

            expect(perm).toBe(true);
            expect(mockAttrPermDomain.getAttributePermission).toHaveBeenCalled();
        });

        test('Return record permission', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionDomain({
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.RECORD,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '123',
                applyTo: 'test_lib',
                target: {
                    recordId: '1345'
                },
                ctx
            });

            expect(perm).toBe(true);
            expect(mockRecordPermDomain.getRecordPermission).toHaveBeenCalled();
        });

        test('Throw if asked record permission without record ID', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionDomain({
                'core.domain.permission.record': mockRecordPermDomain as IRecordPermissionDomain
            });

            // No target at all
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD,
                    action: AppPermissionsActions.CREATE_ATTRIBUTE,
                    userId: '123',
                    applyTo: 'test_lib',
                    ctx
                })
            ).rejects.toThrow(ValidationError);

            // Empty target
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD,
                    action: AppPermissionsActions.CREATE_ATTRIBUTE,
                    userId: '123',
                    applyTo: 'test_lib',
                    target: {},
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });

        test('Return record attribute permission', async () => {
            const mockRecordAttrPermDomain: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionDomain({
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.RECORD_ATTRIBUTE,
                action: RecordAttributePermissionsActions.EDIT_VALUE,
                userId: '123',
                applyTo: 'test_lib',
                target: {
                    recordId: '1345',
                    attributeId: 'test_attr'
                },
                ctx
            });

            expect(perm).toBe(true);
            expect(mockRecordAttrPermDomain.getRecordAttributePermission).toHaveBeenCalled();
        });

        test('Throw if asked attribute permission without record and attribute ID', async () => {
            const mockRecordAttrPermDomain: Mockify<IRecordAttributePermissionDomain> = {
                getRecordAttributePermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionDomain({
                'core.domain.permission.recordAttribute': mockRecordAttrPermDomain as IRecordAttributePermissionDomain
            });

            // No target at all
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action: RecordAttributePermissionsActions.EDIT_VALUE,
                    userId: '123',
                    applyTo: 'test_lib',
                    ctx
                })
            ).rejects.toThrow(ValidationError);

            // Missing record ID
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action: RecordAttributePermissionsActions.EDIT_VALUE,
                    userId: '123',
                    applyTo: 'test_lib',
                    target: {},
                    ctx
                })
            ).rejects.toThrow(ValidationError);

            // Missing attribute ID
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.RECORD_ATTRIBUTE,
                    action: RecordAttributePermissionsActions.EDIT_VALUE,
                    userId: '123',
                    applyTo: 'test_lib',
                    target: {
                        recordId: '12345'
                    },
                    ctx
                })
            ).rejects.toThrow(ValidationError);
        });
    });

    describe('getActionsByType', () => {
        const mockConfig = {
            lang: {
                available: ['fr']
            }
        };

        test('Return actions by type with registered actions', async () => {
            const permsDomain = permissionDomain({config: mockConfig as IConfig, translator: mockTranslator as i18n});

            // Register actions
            permsDomain.registerActions(PermissionTypes.APP, ['test_perm']);

            // Retrieve actions
            const permsByType = permsDomain.getActionsByType({type: PermissionTypes.APP});

            expect(permsByType.findIndex(p => p.name === 'test_perm')).toBeGreaterThanOrEqual(0);
        });

        test('Return actions by type with registered actions, filtered', async () => {
            const permsDomain = permissionDomain({config: mockConfig as IConfig, translator: mockTranslator as i18n});

            // Register actions
            permsDomain.registerActions(PermissionTypes.APP, ['test_perm'], ['my_lib_name']);
            permsDomain.registerActions(PermissionTypes.APP, ['other_test_perm'], ['my_other_lib_name']);

            // Retrieve actions
            const permsByType = permsDomain.getActionsByType({type: PermissionTypes.APP, applyOn: 'my_lib_name'});

            expect(permsByType.findIndex(p => p.name === 'test_perm')).toBeGreaterThanOrEqual(0);
            expect(permsByType.findIndex(p => p.name === 'other_test_perm')).toBe(-1);

            const otherPermsByType = permsDomain.getActionsByType({
                type: PermissionTypes.APP,
                applyOn: 'my_other_lib_name'
            });

            expect(otherPermsByType.findIndex(p => p.name === 'other_test_perm')).toBeGreaterThanOrEqual(0);
            expect(otherPermsByType.findIndex(p => p.name === 'test_perm')).toBe(-1);
        });

        test('Return all actions if forced too', async () => {
            const permsDomain = permissionDomain({config: mockConfig as IConfig, translator: mockTranslator as i18n});

            // Register actions
            permsDomain.registerActions(PermissionTypes.APP, ['test_perm'], ['my_lib_name']);

            // Retrieve actions
            const permsByType = permsDomain.getActionsByType({type: PermissionTypes.APP, skipApplyOn: true});

            expect(permsByType.findIndex(p => p.name === 'test_perm')).toBeGreaterThanOrEqual(0);
        });
    });
});
