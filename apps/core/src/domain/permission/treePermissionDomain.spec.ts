// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {TreePermissionsActions} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import treePermissionDomain from './treePermissionDomain';

describe('TreePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest'
    };
    const globalPerm = false;
    const inheritGlobalPerm = true;

    const mockGlobalPermHelper: Mockify<IGlobalPermissionHelper> = {
        getGlobalPermission: global.__mockPromise(globalPerm),
        getInheritedGlobalPermission: global.__mockPromise(inheritGlobalPerm)
    };

    describe('getTreePermission', () => {
        test('Return tree permission', async () => {
            const permDomain = treePermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getTreePermission({
                action: TreePermissionsActions.ACCESS_TREE,
                treeId: 'test_tree',
                userId: '12345',
                ctx
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getHeritedTreePermission', () => {
        test('Return herited permission', async () => {
            const permDomain = treePermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getHeritedTreePermission({
                action: TreePermissionsActions.ACCESS_TREE,
                treeId: 'test_tree',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
