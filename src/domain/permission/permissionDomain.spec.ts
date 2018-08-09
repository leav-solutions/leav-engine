import permissionDomain from './permissionDomain';
import {PermissionTypes, RecordPermissions} from '../../_types/permissions';
import {IPermissionRepo} from 'infra/permission/permissionRepo';

describe('PermissionDomain', () => {
    describe('savePermission', () => {
        test('Should save a new permission', async function() {
            const permData = {
                type: PermissionTypes.RECORD,
                userGroup: 'users/12345',
                actions: {
                    [RecordPermissions.ACCESS]: true,
                    [RecordPermissions.EDIT]: false,
                    [RecordPermissions.DELETE]: false
                },
                target: 'test_lib/12345'
            };

            const mockPermRepo: Mockify<IPermissionRepo> = {
                savePermission: global.__mockPromise(permData)
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            const newPerm = await permDomain.savePermission({
                type: PermissionTypes.RECORD,
                usersGroup: 'users/12345',
                actions: {
                    [RecordPermissions.ACCESS]: true,
                    [RecordPermissions.EDIT]: false,
                    [RecordPermissions.DELETE]: false
                },
                target: 'test_lib/12345'
            });

            expect(mockPermRepo.savePermission.mock.calls.length).toBe(1);

            expect(newPerm).toMatchObject(permData);
        });
    });
    describe('getPermission', () => {
        test('Should return a permission', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {
                getPermissions: global.__mockPromise({
                    type: PermissionTypes.RECORD,
                    usersGroup: '12345',
                    actions: {
                        [RecordPermissions.ACCESS]: true,
                        [RecordPermissions.EDIT]: false,
                        [RecordPermissions.DELETE]: null
                    },
                    target: 'test_lib/12345'
                })
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            const permAccess = await permDomain.getSimplePermission(
                PermissionTypes.RECORD,
                RecordPermissions.ACCESS,
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            const permEdit = await permDomain.getSimplePermission(
                PermissionTypes.RECORD,
                RecordPermissions.EDIT,
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            const permDelete = await permDomain.getSimplePermission(
                PermissionTypes.RECORD,
                RecordPermissions.DELETE,
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            expect(permAccess).toBe(true);
            expect(permEdit).toBe(false);
            expect(permDelete).toBe(null);
        });

        test('Should return null if no permission defined for this action', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {
                getPermissions: global.__mockPromise({
                    type: PermissionTypes.RECORD,
                    usersGroup: '12345',
                    actions: {
                        [RecordPermissions.ACCESS]: true
                    },
                    target: 'test_lib/12345'
                })
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            const permEdit = await permDomain.getSimplePermission(
                PermissionTypes.RECORD,
                RecordPermissions.EDIT,
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            expect(permEdit).toBe(null);
        });
    });

    describe('getDefaultPermission', () => {
        test('Return default permissions', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const config = {
                permissions: {
                    default: false
                }
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo, config);

            const perm = permDomain.getDefaultPermission();

            expect(perm).toBe(config.permissions.default);
        });
    });
});
