import {
    AdminPermissionsActions,
    LibraryPermissionsActions,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import heritedPermissionDomain from './heritedPermissionDomain';
import {IPermissionDomain} from './permissionDomain';
import {IRecordPermissionDomain} from './recordPermissionDomain';

describe('HeritedPermissionDomain', () => {
    describe('getHeritedPermissions', () => {
        test('Return record herited permission', async () => {
            const mockRecordPermDomain: Mockify<IRecordPermissionDomain> = {
                getHeritedRecordPermission: global.__mockPromise(true)
            };

            const heritedPermDomain = heritedPermissionDomain(mockRecordPermDomain as IRecordPermissionDomain, null);

            const perm = await heritedPermDomain.getHeritedPermissions(
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

            const heritedPermDomain = heritedPermissionDomain(null, mockPermDomain as IPermissionDomain);

            const perm = await heritedPermDomain.getHeritedPermissions(
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

            const heritedPermDomain = heritedPermissionDomain(null, mockPermDomain as IPermissionDomain);

            const perm = await heritedPermDomain.getHeritedPermissions(
                PermissionTypes.ADMIN,
                'test_lib',
                AdminPermissionsActions.CREATE_ATTRIBUTE,
                987654321
            );

            expect(perm).toBe(true);
            expect(mockPermDomain.getHeritedAdminPermission).toHaveBeenCalled();
        });
    });
});
