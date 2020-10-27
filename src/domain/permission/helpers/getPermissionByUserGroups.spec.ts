import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IQueryInfos} from '_types/queryInfos';
import permissionDomain from '..';
import {AppPermissionsActions, PermissionTypes} from '../../../_types/permissions';
import getPermissionByUserGroups from './getPermissionByUserGroups';
import * as getSimplePermission from './getSimplePermission';

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
        const mockPermRepo: Mockify<IPermissionRepo> = {};

        jest.spyOn(getSimplePermission, 'default').mockImplementation(({usersGroupId}, {}) => {
            if (usersGroupId === '1') {
                return Promise.resolve(true);
            } else if (usersGroupId === '0') {
                return Promise.resolve(false);
            } else {
                return Promise.resolve(null);
            }
        });

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.APP,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupsPaths: mockUserGroups,
                ctx
            },
            {
                'core.infra.permission': mockPermRepo as IPermissionRepo
            }
        );

        expect(perm).toBe(true);
    });

    test('Return "forbidden" if no "allowed" found', async () => {
        const mockPermRepo: Mockify<IPermissionRepo> = {};
        const permDomain = permissionDomain({
            'core.infra.permission': mockPermRepo as IPermissionRepo
        });

        jest.spyOn(getSimplePermission, 'default').mockImplementation(({usersGroupId}, {}) => {
            if (usersGroupId === '0') {
                return Promise.resolve(false);
            } else {
                return Promise.resolve(null);
            }
        });

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.APP,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupsPaths: mockUserGroups,
                ctx
            },
            {
                'core.infra.permission': mockPermRepo as IPermissionRepo
            }
        );

        expect(perm).toBe(false);
    });

    test('Return root permission if nothing found on tree', async () => {
        const mockPermRepo: Mockify<IPermissionRepo> = {};
        const permDomain = permissionDomain({
            'core.infra.permission': mockPermRepo as IPermissionRepo
        });

        jest.spyOn(getSimplePermission, 'default').mockImplementation(({usersGroupId}, {}) => {
            return Promise.resolve(usersGroupId === null ? false : null);
        });

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.APP,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupsPaths: mockUserGroups,
                ctx
            },
            {
                'core.infra.permission': mockPermRepo as IPermissionRepo
            }
        );

        expect(perm).toBe(false);
    });

    test('If user has no group, return root permission', async () => {
        const mockPermRepo: Mockify<IPermissionRepo> = {};
        const permDomain = permissionDomain({
            'core.infra.permission': mockPermRepo as IPermissionRepo
        });

        jest.spyOn(getSimplePermission, 'default').mockImplementation(({usersGroupId}, {}) => {
            return Promise.resolve(usersGroupId === null ? false : null);
        });

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.APP,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupsPaths: [],
                ctx
            },
            {
                'core.infra.permission': mockPermRepo as IPermissionRepo
            }
        );

        expect(perm).toBe(false);
    });

    test('Return null if no permission found', async () => {
        const mockPermRepo: Mockify<IPermissionRepo> = {};
        const permDomain = permissionDomain({
            'core.infra.permission': mockPermRepo as IPermissionRepo
        });

        jest.spyOn(getSimplePermission, 'default').mockReturnValue(Promise.resolve(null));

        const perm = await getPermissionByUserGroups(
            {
                type: PermissionTypes.APP,
                action: AppPermissionsActions.CREATE_ATTRIBUTE,
                userGroupsPaths: mockUserGroups,
                ctx
            },
            {
                'core.infra.permission': mockPermRepo as IPermissionRepo
            }
        );

        expect(perm).toBe(null);
    });
});
