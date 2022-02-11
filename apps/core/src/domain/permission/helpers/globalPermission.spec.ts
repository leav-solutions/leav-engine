// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {LibraryPermissionsActions, PermissionTypes} from '../../../_types/permissions';
import globalPermissions from './globalPermission';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';

describe('globalPermissionsHelper', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    const defaultPerm = false;

    describe('getGlobalPermission', () => {
        const mockAttrRepo: Mockify<IAttributeRepo> = {
            getAttributes: global.__mockPromise({
                list: [
                    {
                        id: 'user_groups',
                        linked_tree: 'users_groups'
                    }
                ],
                totalCount: 0
            })
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
            getNodesByRecord: global.__mockPromise([]),
            getElementAncestors: global.__mockPromise([
                [
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
                ]
            ])
        };

        test('Return global permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permHelper = globalPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permHelper.getGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    userId: '12345',
                    getDefaultPermission: () => false
                },
                ctx
            );

            expect(perm).toBe(true);
        });

        test('Return default permission if nothing defined', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const permHelper = globalPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permHelper.getGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    userId: '12345',
                    getDefaultPermission: () => defaultPerm
                },
                ctx
            );

            expect(perm).toBe(defaultPerm);
        });
    });

    describe('getInheritedGlobalPermission', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: global.__mockPromise([
                [
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
                ]
            ])
        };
        test('Return inherited global permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permHelper = globalPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permHelper.getInheritedGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    userGroupNodeId: '12345',
                    getDefaultPermission: () => false
                },
                ctx
            );

            expect(perm).toBe(true);
        });

        test('Herit of default perm if nothing defined', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const permHelper = globalPermissions({
                'core.domain.permission.helpers.permissionByUserGroups': mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permHelper.getInheritedGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    userGroupNodeId: '12345',
                    getDefaultPermission: () => defaultPerm
                },
                ctx
            );

            expect(perm).toBe(defaultPerm);
        });
    });
});
