import {type IQueryInfos} from '../../../_types/queryInfos';
import {LibraryPermissionsActions, PermissionTypes} from '../../../_types/permissions';
import globalPermissions, {type IGlobalPermissionDeps} from './globalPermission';
import {type IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {type ToAny} from '../../../utils/utils';
import {type IElementAncestorsHelper} from '../../tree/helpers/elementAncestors';

const depsBase: ToAny<IGlobalPermissionDeps> = {
    'core.domain.permission.helpers.permissionByUserGroups': vi.fn(),
    'core.domain.permission.helpers.defaultPermission': vi.fn(),
    'core.domain.tree.helpers.elementAncestors': vi.fn(),
};

describe('globalPermissionsHelper', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest',
        groupsId: ['1'],
    };

    describe('getGlobalPermission', () => {
        const mockElementAncestors: Mockify<IElementAncestorsHelper> = {
            getCachedElementAncestors: global.__mockPromise([
                [
                    {
                        record: {
                            id: 1,
                            library: 'users_groups',
                        },
                    },
                    {
                        record: {
                            id: 2,
                            library: 'users_groups',
                        },
                    },
                    {
                        record: {
                            id: 3,
                            library: 'users_groups',
                        },
                    },
                ],
            ]),
        };

        test('Return global permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true),
            };

            const permHelper = globalPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestors as IElementAncestorsHelper,
            });

            const perm = await permHelper.getGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    getDefaultGlobalPermission: () => false,
                },
                ctx,
            );

            expect(perm).toBe(true);
        });
    });

    describe('getInheritedGlobalPermission', () => {
        const mockElementAncestors: Mockify<IElementAncestorsHelper> = {
            getCachedElementAncestors: global.__mockPromise([
                [
                    {
                        record: {
                            id: 1,
                            library: 'users_groups',
                        },
                    },
                    {
                        record: {
                            id: 2,
                            library: 'users_groups',
                        },
                    },
                    {
                        record: {
                            id: 3,
                            library: 'users_groups',
                        },
                    },
                ],
            ]),
        };
        test('Return inherited global permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true),
            };

            const permHelper = globalPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestors as IElementAncestorsHelper,
            });

            const perm = await permHelper.getInheritedGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    userGroupNodeId: '12345',
                    getDefaultGlobalPermission: () => false,
                },
                ctx,
            );

            expect(perm).toBe(true);
        });
    });
});
