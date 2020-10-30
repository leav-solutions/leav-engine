import {IQueryInfos} from '_types/queryInfos';
import {AppPermissionsActions, PermissionTypes} from '../../../_types/permissions';
import permissionByUserGroupsHelper from './permissionByUserGroups';
import {ISimplePermissionHelper} from './simplePermission';

describe('getPermissionByUserGroups', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    const mockUserGroups = [
        [
            {
                record: {
                    id: '9'
                }
            },
            {
                record: {
                    id: '1'
                }
            }
        ],
        [
            {
                record: {
                    id: '8'
                }
            },
            {
                record: {
                    id: '0'
                }
            }
        ]
    ];

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
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.APP,
            action: AppPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: mockUserGroups,
            ctx
        });

        expect(perm).toBe(true);
    });

    test('Return "forbidden" if no "allowed" found', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: jest.fn().mockImplementation(({usersGroupId}) => {
                if (usersGroupId === '0') {
                    return Promise.resolve(false);
                } else {
                    return Promise.resolve(null);
                }
            })
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.APP,
            action: AppPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: mockUserGroups,
            ctx
        });

        expect(perm).toBe(false);
    });

    test('Return root permission if nothing found on tree', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: jest.fn().mockImplementation(({usersGroupId}) => {
                return Promise.resolve(usersGroupId === null ? false : null);
            })
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.APP,
            action: AppPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: mockUserGroups,
            ctx
        });

        expect(perm).toBe(false);
    });

    test('If user has no group, return root permission', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: jest.fn().mockImplementation(({usersGroupId}) => {
                return Promise.resolve(usersGroupId === null ? false : null);
            })
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.APP,
            action: AppPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: [],
            ctx
        });

        expect(perm).toBe(false);
    });

    test('Return null if no permission found', async () => {
        const mockSimplePermHelper: Mockify<ISimplePermissionHelper> = {
            getSimplePermission: global.__mockPromise(null)
        };

        const permByGroupHelper = permissionByUserGroupsHelper({
            'core.domain.permission.helpers.simplePermission': mockSimplePermHelper as ISimplePermissionHelper
        });

        const perm = await permByGroupHelper.getPermissionByUserGroups({
            type: PermissionTypes.APP,
            action: AppPermissionsActions.CREATE_ATTRIBUTE,
            userGroupsPaths: mockUserGroups,
            ctx
        });

        expect(perm).toBe(null);
    });
});
