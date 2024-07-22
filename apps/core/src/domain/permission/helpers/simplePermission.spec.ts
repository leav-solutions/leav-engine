// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import {IPermissionsByActionsHelper} from './permissionsByActions';
import simplePermissionHelper from './simplePermission';

describe('getSimplePermission', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };

    test('Should return a permission', async () => {
        const mockPermsByActionsHelper: Mockify<IPermissionsByActionsHelper> = {
            getPermissionsByActions: global.__mockPromise({
                [RecordPermissionsActions.ACCESS_RECORD]: true,
                [RecordPermissionsActions.EDIT_RECORD]: false,
                [RecordPermissionsActions.DELETE_RECORD]: null
            })
        };

        const simplePermHelper = simplePermissionHelper({
            'core.domain.permission.helpers.permissionsByActions':
                mockPermsByActionsHelper as IPermissionsByActionsHelper
        });

        const permAccess = await simplePermHelper.getSimplePermission({
            type: PermissionTypes.RECORD,
            applyTo: 'test_lib',
            action: RecordPermissionsActions.ACCESS_RECORD,
            usersGroupNodeId: '12345',
            permissionTreeTarget: {
                nodeId: '123',
                tree: 'categories'
            },
            ctx
        });

        const permEdit = await simplePermHelper.getSimplePermission({
            type: PermissionTypes.RECORD,
            applyTo: 'test_lib',
            action: RecordPermissionsActions.EDIT_RECORD,
            usersGroupNodeId: '12345',
            permissionTreeTarget: {
                nodeId: '123',
                tree: 'categories'
            },
            ctx
        });

        const permDelete = await simplePermHelper.getSimplePermission({
            type: PermissionTypes.RECORD,
            applyTo: 'test_lib',
            action: RecordPermissionsActions.DELETE_RECORD,
            usersGroupNodeId: '12345',
            permissionTreeTarget: {
                nodeId: '123',
                tree: 'categories'
            },
            ctx
        });

        expect(permAccess).toBe(true);
        expect(permEdit).toBe(false);
        expect(permDelete).toBe(null);
    });
});
