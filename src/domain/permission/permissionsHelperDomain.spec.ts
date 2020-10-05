import {IQueryInfos} from '_types/queryInfos';
import ValidationError from '../../errors/ValidationError';
import {
    AppPermissionsActions,
    AttributePermissionsActions,
    LibraryPermissionsActions,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import {IAttributePermissionDomain} from './attributePermissionDomain';
import {IPermissionDomain} from './permissionDomain';
import permissionsHelperDomain from './permissionsHelperDomain';
import {IRecordPermissionDomain} from './recordPermissionDomain';

describe('HeritedPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'heritedPermissionDomainTest'
    };
    describe('getHeritedPermissions', () => {
        test('Return record herited permission', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getHeritedRecordPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain
            });

            const perm = await permsHelperDomain.getHeritedPermissions({
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                action: RecordPermissionsActions.ACCESS,
                userGroupId: '987654321',
                permissionTreeTarget: {id: '12345', library: 'test', tree: 'test_tree'},
                ctx
            });

            expect(perm).toBe(true);
            expect(mockRecordPermDomain.getHeritedRecordPermission).toHaveBeenCalled();
        });

        test('Return record library permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getHeritedLibraryPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const perm = await permsHelperDomain.getHeritedPermissions({
                type: PermissionTypes.LIBRARY,
                applyTo: 'test_lib',
                action: LibraryPermissionsActions.ACCESS,
                userGroupId: '987654321',
                ctx
            });

            expect(perm).toBe(true);
            expect(mockPermDomain.getHeritedLibraryPermission).toHaveBeenCalled();
        });

        test('Return record admin permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getHeritedAdminPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const perm = await permsHelperDomain.getHeritedPermissions({
                type: PermissionTypes.APP,
                applyTo: 'test_lib',
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupId: '987654321',
                ctx
            });

            expect(perm).toBe(true);
            expect(mockPermDomain.getHeritedAdminPermission).toHaveBeenCalled();
        });
    });

    describe('isAllowed', () => {
        test('Return admin permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.APP,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '123',
                ctx
            });

            expect(perm).toBe(true);
            expect(mockPermDomain.getAdminPermission).toHaveBeenCalled();
        });

        test('Return library permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission': mockPermDomain as IPermissionDomain
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.LIBRARY,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userId: '123',
                applyTo: 'test_lib',
                ctx
            });

            expect(perm).toBe(true);
            expect(mockPermDomain.getLibraryPermission).toHaveBeenCalled();
        });

        test('Return record permission', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain
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

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission.recordPermission': mockRecordPermDomain as IRecordPermissionDomain
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

        test('Return attribute permission', async () => {
            const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
                getAttributePermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain
            });

            const perm = await permsHelperDomain.isAllowed({
                type: PermissionTypes.ATTRIBUTE,
                action: AttributePermissionsActions.EDIT_VALUE,
                userId: '123',
                applyTo: 'test_lib',
                target: {
                    recordId: '1345',
                    attributeId: 'test_attr'
                },
                ctx
            });

            expect(perm).toBe(true);
            expect(mockAttrPermDomain.getAttributePermission).toHaveBeenCalled();
        });

        test('Throw if asked attribute permission without record and attribute ID', async () => {
            const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
                getAttributePermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain({
                'core.domain.permission.attributePermission': mockAttrPermDomain as IAttributePermissionDomain
            });

            // No target at all
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.ATTRIBUTE,
                    action: AttributePermissionsActions.EDIT_VALUE,
                    userId: '123',
                    applyTo: 'test_lib',
                    ctx
                })
            ).rejects.toThrow(ValidationError);

            // Missing record ID
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.ATTRIBUTE,
                    action: AttributePermissionsActions.EDIT_VALUE,
                    userId: '123',
                    applyTo: 'test_lib',
                    target: {},
                    ctx
                })
            ).rejects.toThrow(ValidationError);

            // Missing attribute ID
            await expect(
                permsHelperDomain.isAllowed({
                    type: PermissionTypes.ATTRIBUTE,
                    action: AttributePermissionsActions.EDIT_VALUE,
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
});
