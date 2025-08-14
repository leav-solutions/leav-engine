// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IQueryInfos} from '_types/queryInfos';
import {LibraryPermissionsActions, PermissionTypes} from '../../../_types/permissions';
import globalPermissions, {IGlobalPermissionDeps} from './globalPermission';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {ToAny} from '../../../utils/utils';

const depsBase: ToAny<IGlobalPermissionDeps> = {
    'core.domain.permission.helpers.permissionByUserGroups': jest.fn(),
    'core.domain.permission.helpers.defaultPermission': jest.fn(),
    'core.infra.tree': jest.fn()
};

describe('globalPermissionsHelper', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest',
        groupsId: ['1']
    };

    describe('getGlobalPermission', () => {
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
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permHelper.getGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    getDefaultPermission: () => false
                },
                ctx
            );

            expect(perm).toBe(true);
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
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
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
    });
});
