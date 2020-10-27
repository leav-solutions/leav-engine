import {IPermissionRepo} from 'infra/permission/permissionRepo';
import {IQueryInfos} from '_types/queryInfos';
import {PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import getPermissionsByActions from './getPermissionsByActions';

describe('getPermissionsByActions', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    test('Return permission for each actions', async () => {
        const mockPermRepo: Mockify<IPermissionRepo> = {
            getPermissions: global.__mockPromise({
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: '12345',
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.EDIT_RECORD]: false,
                    [RecordPermissionsActions.DELETE_RECORD]: null
                },
                permissionTreeTarget: 'test_lib/12345'
            })
        };

        const perms = await getPermissionsByActions(
            {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                actions: [
                    RecordPermissionsActions.ACCESS_RECORD,
                    RecordPermissionsActions.EDIT_RECORD,
                    RecordPermissionsActions.DELETE_RECORD
                ],
                usersGroupId: '12345',
                permissionTreeTarget: {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                },
                ctx
            },
            {'core.infra.permission': mockPermRepo as IPermissionRepo}
        );

        expect(perms).toEqual({
            [RecordPermissionsActions.ACCESS_RECORD]: true,
            [RecordPermissionsActions.EDIT_RECORD]: false,
            [RecordPermissionsActions.DELETE_RECORD]: null
        });
    });

    test('Return null for one action if no permission defined for this action', async () => {
        const mockPermRepo: Mockify<IPermissionRepo> = {
            getPermissions: global.__mockPromise({
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                usersGroup: '12345',
                actions: {
                    [RecordPermissionsActions.ACCESS_RECORD]: true,
                    [RecordPermissionsActions.DELETE_RECORD]: false
                },
                permissionTreeTarget: 'test_lib/12345'
            })
        };

        const permEdit = await getPermissionsByActions(
            {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                actions: [
                    RecordPermissionsActions.ACCESS_RECORD,
                    RecordPermissionsActions.EDIT_RECORD,
                    RecordPermissionsActions.DELETE_RECORD
                ],
                usersGroupId: '12345',
                permissionTreeTarget: {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                },
                ctx
            },
            {'core.infra.permission': mockPermRepo as IPermissionRepo}
        );

        expect(permEdit).toEqual({
            [RecordPermissionsActions.ACCESS_RECORD]: true,
            [RecordPermissionsActions.EDIT_RECORD]: null,
            [RecordPermissionsActions.DELETE_RECORD]: false
        });
    });

    test('Return null for each action if no permission defined', async () => {
        const mockPermRepo: Mockify<IPermissionRepo> = {
            getPermissions: global.__mockPromise(null)
        };

        const permEdit = await getPermissionsByActions(
            {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                actions: [
                    RecordPermissionsActions.ACCESS_RECORD,
                    RecordPermissionsActions.EDIT_RECORD,
                    RecordPermissionsActions.DELETE_RECORD
                ],
                usersGroupId: '12345',
                permissionTreeTarget: {
                    id: '123',
                    library: 'category',
                    tree: 'categories'
                },
                ctx
            },
            {'core.infra.permission': mockPermRepo as IPermissionRepo}
        );

        expect(permEdit).toEqual({
            [RecordPermissionsActions.ACCESS_RECORD]: null,
            [RecordPermissionsActions.EDIT_RECORD]: null,
            [RecordPermissionsActions.DELETE_RECORD]: null
        });
    });
});
