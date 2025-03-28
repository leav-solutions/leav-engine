// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {AdminPermissionsActions, PermissionTypes} from '../../../_types/permissions';
import permissionByUserGroupsHelper, {type IPermissionByUserGroupsHelperDeps} from './permissionByUserGroups';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';
import {ISimplePermissionHelper} from './simplePermission';
import {IDefaultPermissionHelper} from './defaultPermission';
import {IElementAncestorsHelper} from '../../tree/helpers/elementAncestors';
import {ToAny} from '../../../utils/utils';

const depsBase: ToAny<IPermissionByUserGroupsHelperDeps> = {
    'core.domain.permission.helpers.simplePermission': jest.fn(),
    'core.domain.permission.helpers.reducePermissionsArray': jest.fn(),
    'core.domain.permission.helpers.defaultPermission': jest.fn(),
    'core.domain.tree.helpers.elementAncestors': jest.fn()
};

describe('getPermissionByUserGroups', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    const mockUserGroups = [
        [
            {
                id: '9',
                record: {
                    id: '9'
                }
            },
            {
                id: '1',
                record: {
                    id: '1'
                }
            }
        ],
        [
            {
                id: '8',
                record: {
                    id: '8'
                }
            },
            {
                id: '0',
                record: {
                    id: '0'
                }
            }
        ]
    ];

    const mockReducePermissionsArrayHelper: IReducePermissionsArrayHelper = {
        reducePermissionsArray: jest.fn().mockReturnValue(true)
    };

    const mockReducePermissionsArrayHelperFalse: IReducePermissionsArrayHelper = {
        reducePermissionsArray: jest.fn().mockReturnValue(false)
    };

    const mockReducePermissionsArrayHelperNull: IReducePermissionsArrayHelper = {
        reducePermissionsArray: jest.fn().mockReturnValue(null)
    };

    const mockDefaultPermHelper: Mockify<IDefaultPermissionHelper> = {
        getDefaultPermission: jest.fn().mockReturnValue(true)
    };

    test('Retrieve first "allowed" permission', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: jest.fn().mockImplementation(({usersGroupId}) => {
                if (usersGroupId === '1') {
                    return Promise.resolve(true);
                } else if (usersGroupId === '0') {
                    return Promise.resolve(false);
                } else {
                    return Promise.resolve(null);
                }
            })
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            ...depsBase,
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper,
            'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
            'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.ADMIN,
            action: AdminPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: mockUserGroups,
            ctx
        });

        expect(perm).toBe(true);
    });

    test('Return "forbidden" if no "allowed" found', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: jest.fn().mockImplementation(({usersGroupNodeId}) => {
                if (usersGroupNodeId === '0') {
                    return Promise.resolve(false);
                } else {
                    return Promise.resolve(null);
                }
            })
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            ...depsBase,
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper,
            'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelperFalse,
            'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.ADMIN,
            action: AdminPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: mockUserGroups,
            ctx
        });

        expect(mockReducePermissionsArrayHelperFalse.reducePermissionsArray).toBeCalledWith([
            mockDefaultPermHelper.getDefaultPermission(),
            false
        ]);
        expect(perm).toBe(false);
    });

    test('Return root permission if nothing found on tree', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: jest
                .fn()
                .mockImplementation(({usersGroupNodeId}) => Promise.resolve(usersGroupNodeId === null ? false : null))
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            ...depsBase,
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper,
            'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelperFalse,
            'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.ADMIN,
            action: AdminPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: mockUserGroups,
            ctx
        });

        expect(mockReducePermissionsArrayHelperFalse.reducePermissionsArray).toBeCalledWith([false, false]);
        expect(perm).toBe(false);
    });

    test('If user has no group, return root permission', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: jest
                .fn()
                .mockImplementation(({usersGroupId}) => Promise.resolve(usersGroupId === null ? false : null))
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            ...depsBase,
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper,
            'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelperFalse,
            'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.ADMIN,
            action: AdminPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: [],
            ctx
        });

        expect(perm).toBe(false);
        expect(mockSimplePermHelper.getSimplePermission).toBeCalled();
    });

    test('Return default permission if no permission found', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: global.__mockPromise(null)
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            ...depsBase,
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper,
            'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
            'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.ADMIN,
            action: AdminPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: mockUserGroups,
            ctx
        });

        expect(mockReducePermissionsArrayHelper.reducePermissionsArray).toBeCalledWith([
            mockDefaultPermHelper.getDefaultPermission(),
            mockDefaultPermHelper.getDefaultPermission()
        ]);

        expect(perm).toBe(true);
    });
});
