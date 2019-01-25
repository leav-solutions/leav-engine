import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {
    AdminPermissionsActions,
    LibraryPermissionsActions,
    PermissionTypes,
    RecordPermissionsActions
} from '../../_types/permissions';
import permissionDomain from './permissionDomain';

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
    describe('getSimplePermission', () => {
        test('Should return a permission', async () => {
            const permDomain = permissionDomain();
            permDomain.getPermissionsByActions = global.__mockPromise({
                [RecordPermissionsActions.ACCESS]: true,
                [RecordPermissionsActions.EDIT]: false,
                [RecordPermissionsActions.DELETE]: null
            });

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
    });

    describe('getPermissionsByActions', () => {
        test('Return permission for each actions', async () => {
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

            const perms = await permDomain.getPermissionsByActions(
                PermissionTypes.RECORD,
                'test_lib',
                [RecordPermissionsActions.ACCESS, RecordPermissionsActions.EDIT, RecordPermissionsActions.DELETE],
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            expect(perms).toEqual({
                [RecordPermissionsActions.ACCESS]: true,
                [RecordPermissionsActions.EDIT]: false,
                [RecordPermissionsActions.DELETE]: null
            });
        });

        test('Return null for ine action if no permission defined for this action', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {
                getPermissions: global.__mockPromise({
                    type: PermissionTypes.RECORD,
                    applyTo: 'test_lib',
                    usersGroup: '12345',
                    actions: {
                        [RecordPermissionsActions.ACCESS]: true,
                        [RecordPermissionsActions.DELETE]: false
                    },
                    permissionTreeTarget: 'test_lib/12345'
                })
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            const permEdit = await permDomain.getPermissionsByActions(
                PermissionTypes.RECORD,
                'test_lib',
                [RecordPermissionsActions.ACCESS, RecordPermissionsActions.EDIT, RecordPermissionsActions.DELETE],
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            expect(permEdit).toEqual({
                [RecordPermissionsActions.ACCESS]: true,
                [RecordPermissionsActions.EDIT]: null,
                [RecordPermissionsActions.DELETE]: false
            });
        });

        test('Return null for each action if no permission defined', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {
                getPermissions: global.__mockPromise(null)
            };

            const permDomain = permissionDomain(mockPermRepo as IPermissionRepo);

            const permEdit = await permDomain.getPermissionsByActions(
                PermissionTypes.RECORD,
                'test_lib',
                [RecordPermissionsActions.ACCESS, RecordPermissionsActions.EDIT, RecordPermissionsActions.DELETE],
                12345,
                {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                }
            );

            expect(permEdit).toEqual({
                [RecordPermissionsActions.ACCESS]: null,
                [RecordPermissionsActions.EDIT]: null,
                [RecordPermissionsActions.DELETE]: null
            });
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
                AdminPermissionsActions.CREATE_ATTRIBUTE,
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
                AdminPermissionsActions.CREATE_ATTRIBUTE,
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
                AdminPermissionsActions.CREATE_ATTRIBUTE,
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

            const perm = await permDomain.getAdminPermission(AdminPermissionsActions.CREATE_ATTRIBUTE, 12345);

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

            const perm = await permDomain.getAdminPermission(AdminPermissionsActions.CREATE_ATTRIBUTE, 12345);

            expect(perm).toBe(defaultPerm);
        });
    });

    describe('getLibraryPermission', () => {
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

        test('Return library permission', async () => {
            const mockPermRepo: Mockify<IPermissionRepo> = {};
            const permDomain = permissionDomain(
                mockPermRepo as IPermissionRepo,
                mockAttrRepo as IAttributeRepo,
                mockValRepo as IValueRepo,
                mockTreeRepo as ITreeRepo
            );
            permDomain.getPermissionByUserGroups = global.__mockPromise(true);
            permDomain.getDefaultPermission = jest.fn().mockReturnValue(defaultPerm);

            const perm = await permDomain.getLibraryPermission(LibraryPermissionsActions.ACCESS, 'test_lib', 12345);

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

            const perm = await permDomain.getLibraryPermission(LibraryPermissionsActions.ACCESS, 'test_lib', 12345);

            expect(perm).toBe(defaultPerm);
        });
    });

    describe('getHeritedLibraryPermission', () => {
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
        test('Return herited library permission', async () => {
            const permDomain = permissionDomain(null, null, null, mockTreeRepo as ITreeRepo);
            permDomain.getPermissionByUserGroups = global.__mockPromise(true);

            const perm = await permDomain.getHeritedLibraryPermission(
                LibraryPermissionsActions.ACCESS,
                'test_lib',
                12345
            );

            expect(perm).toBe(true);
        });
        test('Herit of default perm if nothing defined', async () => {
            const permDomain = permissionDomain(null, null, null, mockTreeRepo as ITreeRepo);
            permDomain.getPermissionByUserGroups = global.__mockPromise(null);
            permDomain.getDefaultPermission = global.__mockPromise(false);

            const perm = await permDomain.getHeritedLibraryPermission(
                LibraryPermissionsActions.ACCESS,
                'test_lib',
                12345
            );

            expect(perm).toBe(false);
        });
    });

    describe('getHeritedAdminPermission', () => {
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
        test('Return herited admin permission', async () => {
            const permDomain = permissionDomain(null, null, null, mockTreeRepo as ITreeRepo);
            permDomain.getPermissionByUserGroups = global.__mockPromise(true);

            const perm = await permDomain.getHeritedAdminPermission(AdminPermissionsActions.CREATE_ATTRIBUTE, 12345);

            expect(perm).toBe(true);
        });
        test('Herit of default perm if nothing defined', async () => {
            const permDomain = permissionDomain(null, null, null, mockTreeRepo as ITreeRepo);
            permDomain.getPermissionByUserGroups = global.__mockPromise(null);
            permDomain.getDefaultPermission = global.__mockPromise(false);

            const perm = await permDomain.getHeritedAdminPermission(AdminPermissionsActions.CREATE_ATTRIBUTE, 12345);

            expect(perm).toBe(false);
        });
    });
});
