import ValidationError from '../../errors/ValidationError';
import {
    AdminPermissionsActions,
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
    describe('getHeritedPermissions', () => {
        test('Return record herited permission', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getHeritedRecordPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(mockRecordPermDomain as IRecordPermissionDomain, null);

            const perm = await permsHelperDomain.getHeritedPermissions(
                PermissionTypes.RECORD,
                'test_lib',
                RecordPermissionsActions.ACCESS,
                987654321,
                {id: 12345, library: 'test', tree: 'test_tree'}
            );

            expect(perm).toBe(true);
            expect(mockRecordPermDomain.getHeritedRecordPermission).toHaveBeenCalled();
        });

        test('Return record library permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getHeritedLibraryPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(null, mockPermDomain as IPermissionDomain);

            const perm = await permsHelperDomain.getHeritedPermissions(
                PermissionTypes.LIBRARY,
                'test_lib',
                LibraryPermissionsActions.ACCESS,
                987654321
            );

            expect(perm).toBe(true);
            expect(mockPermDomain.getHeritedLibraryPermission).toHaveBeenCalled();
        });

        test('Return record admin permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getHeritedAdminPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(null, mockPermDomain as IPermissionDomain);

            const perm = await permsHelperDomain.getHeritedPermissions(
                PermissionTypes.ADMIN,
                'test_lib',
                AdminPermissionsActions.CREATE_ATTRIBUTE,
                987654321
            );

            expect(perm).toBe(true);
            expect(mockPermDomain.getHeritedAdminPermission).toHaveBeenCalled();
        });
    });

    describe('isAllowed', () => {
        test('Return admin permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getAdminPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(null, mockPermDomain as IPermissionDomain);

            const perm = await permsHelperDomain.isAllowed(
                PermissionTypes.ADMIN,
                AdminPermissionsActions.CREATE_ATTRIBUTE,
                123
            );

            expect(perm).toBe(true);
            expect(mockPermDomain.getAdminPermission).toHaveBeenCalled();
        });

        test('Return library permission', async () => {
            const mockPermDomain: Mockify<IPermissionDomain> = {
                getLibraryPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(null, mockPermDomain as IPermissionDomain);

            const perm = await permsHelperDomain.isAllowed(
                PermissionTypes.LIBRARY,
                AdminPermissionsActions.CREATE_ATTRIBUTE,
                123,
                'test_lib'
            );

            expect(perm).toBe(true);
            expect(mockPermDomain.getLibraryPermission).toHaveBeenCalled();
        });

        test('Return record permission', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(mockRecordPermDomain as IRecordPermissionDomain);

            const perm = await permsHelperDomain.isAllowed(
                PermissionTypes.RECORD,
                AdminPermissionsActions.CREATE_ATTRIBUTE,
                123,
                'test_lib',
                {
                    recordId: 1345
                }
            );

            expect(perm).toBe(true);
            expect(mockRecordPermDomain.getRecordPermission).toHaveBeenCalled();
        });

        test('Throw if asked record permission without record ID', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getRecordPermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(mockRecordPermDomain as IRecordPermissionDomain);

            // No target at all
            await expect(
                permsHelperDomain.isAllowed(
                    PermissionTypes.RECORD,
                    AdminPermissionsActions.CREATE_ATTRIBUTE,
                    123,
                    'test_lib'
                )
            ).rejects.toThrow(ValidationError);

            // Empty target
            await expect(
                permsHelperDomain.isAllowed(
                    PermissionTypes.RECORD,
                    AdminPermissionsActions.CREATE_ATTRIBUTE,
                    123,
                    'test_lib',
                    {}
                )
            ).rejects.toThrow(ValidationError);
        });

        test('Return attribute permission', async () => {
            const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
                getAttributePermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(
                null,
                null,
                null,
                mockAttrPermDomain as IAttributePermissionDomain
            );

            const perm = await permsHelperDomain.isAllowed(
                PermissionTypes.ATTRIBUTE,
                AttributePermissionsActions.EDIT_VALUE,
                123,
                'test_lib',
                {
                    recordId: 1345,
                    attributeId: 'test_attr'
                }
            );

            expect(perm).toBe(true);
            expect(mockAttrPermDomain.getAttributePermission).toHaveBeenCalled();
        });

        test('Throw if asked attribute permission without record and attribute ID', async () => {
            const mockAttrPermDomain: Mockify<IAttributePermissionDomain> = {
                getAttributePermission: global.__mockPromise(true)
            };

            const permsHelperDomain = permissionsHelperDomain(
                null,
                null,
                null,
                mockAttrPermDomain as IAttributePermissionDomain
            );

            // No target at all
            await expect(
                permsHelperDomain.isAllowed(
                    PermissionTypes.ATTRIBUTE,
                    AttributePermissionsActions.EDIT_VALUE,
                    123,
                    'test_lib'
                )
            ).rejects.toThrow(ValidationError);

            // Missing record ID
            await expect(
                permsHelperDomain.isAllowed(
                    PermissionTypes.ATTRIBUTE,
                    AttributePermissionsActions.EDIT_VALUE,
                    123,
                    'test_lib',
                    {}
                )
            ).rejects.toThrow(ValidationError);

            // Missing attribute ID
            await expect(
                permsHelperDomain.isAllowed(
                    PermissionTypes.ATTRIBUTE,
                    AttributePermissionsActions.EDIT_VALUE,
                    123,
                    'test_lib',
                    {
                        recordId: 12345
                    }
                )
            ).rejects.toThrow(ValidationError);
        });
    });
});
