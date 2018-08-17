import permissionDomain from './permissionDomain';
import {PermissionTypes, RecordPermissionsActions, AdminPermisisonsActions} from '../../_types/permissions';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';

describe('PermissionDomain', () => {
    describe('savePermission', () => {
        test('Should save a new permission', async function() {
            const permData = {
                type: PermissionTypes.RECORD,
                userGroup: 'users/12345',
                actions: {
                    [RecordPermissionsActions.ACCESS]: true,
                    [RecordPermissionsActions.EDIT]: false,
                    [RecordPermissionsActions.DELETE]: false
                },
                permissionTreeTarget: 'test_lib/12345'
            };

            const mockPermRepo: Mockify<IPermissionRepo> = {
                savePermission: global.__mockPromise(permData)
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);
            permDomain.getAdminPermission = global.__mockPromise(true);

            const newPerm = await permDomain.savePermission(
                {
                    type: PermissionTypes.RECORD,
                    usersGroup: 'users/12345',
                    actions: {
                        [RecordPermissionsActions.ACCESS]: true,
                        [RecordPermissionsActions.EDIT]: false,
                        [RecordPermissionsActions.DELETE]: false
                    },
                    permissionTreeTarget: {
                        library: 'test_lib',
                        id: 12345,
                        tree: 'test_tree'
                    }
                },
                {userId: 1}
            );

            expect(mockPermRepo.savePermission.mock.calls.length).toBe(1);

            expect(newPerm).toMatchObject(permData);
        });
    });
    describe('getPermission', () => {
        test('Should return a permission', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {
                getPermissions: global.__mockPromise({
                    type: PermissionTypes.RECORD,
                    applyTo: 'test_lib',
                    usersGroup: '12345',
                    actions: {
                        [RecordPermissionsActions.ACCESS]: true,
                        [RecordPermissionsActions.EDIT]: false,
                        [RecordPermissionsActions.DELETE]: null
                    },
                    permissionTreeTarget: 'test_lib/12345'
                })
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            const permAccess = await permDomain.getSimplePermission(
                PermissionTypes.RECORD,
                'test_lib',
                RecordPermissionsActions.ACCESS,
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            const permEdit = await permDomain.getSimplePermission(
                PermissionTypes.RECORD,
                'test_lib',
                RecordPermissionsActions.EDIT,
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            const permDelete = await permDomain.getSimplePermission(
                PermissionTypes.RECORD,
                'test_lib',
                RecordPermissionsActions.DELETE,
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
                        [RecordPermissionsActions.ACCESS]: true
                    },
                    permissionTreeTarget: 'test_lib/12345'
                })
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            const permEdit = await permDomain.getSimplePermission(
                PermissionTypes.RECORD,
                'test_lib',
                RecordPermissionsActions.EDIT,
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

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo, null, null, null, config);

            const perm = permDomain.getDefaultPermission();

            expect(perm).toBe(config.permissions.default);
        });
    });

    describe('getPermissionByUserGroups', () => {
        const mockUserGroups = [
            [
                {
                    record: {
                        id: 9
                    }
                },
                {
                    record: {
                        id: 1
                    }
                }
            ],
            [
                {
                    record: {
                        id: 8
                    }
                },
                {
                    record: {
                        id: 0
                    }
                }
            ]
        ];

        test('Retrieve first "allowed" permission', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            permDomain.getSimplePermission = jest.fn().mockImplementation((type, applyTo, action, grpId, targ) => {
                if (grpId === 1) {
                    return true;
                } else if (grpId === 0) {
                    return false;
                } else {
                    return null;
                }
            });

            const perm = await permDomain.getPermissionByUserGroups(
                PermissionTypes.ADMIN,
                AdminPermisisonsActions.CREATE_ATTRIBUTE,
                mockUserGroups,
                null,
                null
            );

            expect(perm).toBe(true);
        });

        test('Return "forbidden" if no "allowed" found', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            permDomain.getSimplePermission = jest.fn().mockImplementation((type, applyTo, action, grpId, targ) => {
                if (grpId === 0) {
                    return false;
                } else {
                    return null;
                }
            });

            const perm = await permDomain.getPermissionByUserGroups(
                PermissionTypes.ADMIN,
                AdminPermisisonsActions.CREATE_ATTRIBUTE,
                mockUserGroups,
                null,
                null
            );

            expect(perm).toBe(false);
        });

        test('Return null if no permission found', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            permDomain.getSimplePermission = global.__mockPromise(null);

            const perm = await permDomain.getPermissionByUserGroups(
                PermissionTypes.ADMIN,
                AdminPermisisonsActions.CREATE_ATTRIBUTE,
                mockUserGroups,
                null,
                null
            );

            expect(perm).toBe(null);
        });
    });

    describe('getAdminPermission', () => {
        const defaultPerm = false;
        const mockAttrRepo: Mockify<IAttributeRepo> = {
            getAttributes: global.__mockPromise([
                {
                    id: 'user_groups',
                    linked_tree: 'users_groups'
                }
            ])
        };
        const mockValRepo: Mockify<IValueRepo> = {
            getValues: global.__mockPromise([
                {
                    id_value: 54321,
                    value: {
                        record: {
                            id: 1,
                            library: 'users_groups'
                        }
                    }
                }
            ])
        };
        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: global.__mockPromise([
                {
                    record: {
                        id: 1,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 2,
                        library: 'users_groups'
                    }
                },
                {
                    record: {
                        id: 3,
                        library: 'users_groups'
                    }
                }
            ])
        };

        test('Return admin permission', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = permissionDomain(
                mockPermRepo as IPermissionRepo,
                mockAttrRepo as IAttributeRepo,
                mockValRepo as IValueRepo,
                mockTreeRepo as ITreeRepo
            );
            permDomain.getPermissionByUserGroups = global.__mockPromise(true);
            permDomain.getDefaultPermission = jest.fn().mockReturnValue(defaultPerm);

            const perm = await permDomain.getAdminPermission(AdminPermisisonsActions.CREATE_ATTRIBUTE, 12345);

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = permissionDomain(
                mockPermRepo as IPermissionRepo,
                mockAttrRepo as IAttributeRepo,
                mockValRepo as IValueRepo,
                mockTreeRepo as ITreeRepo
            );
            permDomain.getPermissionByUserGroups = global.__mockPromise(null);
            permDomain.getDefaultPermission = jest.fn().mockReturnValue(defaultPerm);

            const perm = await permDomain.getAdminPermission(AdminPermisisonsActions.CREATE_ATTRIBUTE, 12345);

            expect(perm).toBe(defaultPerm);
        });
    });
});
