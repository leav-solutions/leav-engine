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
                    [RecordPermissionsActions.ACCESS]: true,
                    [RecordPermissionsActions.EDIT]: false,
                    [RecordPermissionsActions.DELETE]: null
                },
                permissionTreeTarget: 'test_lib/12345'
            })
        };

        const perms = await getPermissionsByActions(
            {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                actions: [
                    RecordPermissionsActions.ACCESS,
                    RecordPermissionsActions.EDIT,
                    RecordPermissionsActions.DELETE
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
            [RecordPermissionsActions.ACCESS]: true,
            [RecordPermissionsActions.EDIT]: false,
            [RecordPermissionsActions.DELETE]: null
        });
    });

    test('Return null for one action if no permission defined for this action', async () => {
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

        const permEdit = await getPermissionsByActions(
            {
                type: PermissionTypes.RECORD,
                applyTo: 'test_lib',
                actions: [
                    RecordPermissionsActions.ACCESS,
                    RecordPermissionsActions.EDIT,
                    RecordPermissionsActions.DELETE
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
            [RecordPermissionsActions.ACCESS]: true,
            [RecordPermissionsActions.EDIT]: null,
            [RecordPermissionsActions.DELETE]: false
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
                    RecordPermissionsActions.ACCESS,
                    RecordPermissionsActions.EDIT,
                    RecordPermissionsActions.DELETE
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
            [RecordPermissionsActions.ACCESS]: null,
            [RecordPermissionsActions.EDIT]: null,
            [RecordPermissionsActions.DELETE]: null
        });
    });
});
