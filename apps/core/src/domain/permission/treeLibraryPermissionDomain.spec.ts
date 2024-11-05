// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {TreeNodePermissionsActions} from '../../_types/permissions';
import {IGlobalPermissionHelper} from './helpers/globalPermission';
import treeNodeLibraryPermissionDomain from './treeLibraryPermissionDomain';

describe('TreeNodeLibraryPermissionDomain', () => {
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

    describe('getTreeLibraryPermission', () => {
        test('Return tree node library permission', async () => {
            const permDomain = treeNodeLibraryPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getTreeLibraryPermission({
                action: TreeNodePermissionsActions.EDIT_CHILDREN,
                treeId: 'test_tree',
                libraryId: 'test_lib',
                userId: '12345',
                ctx
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getInheritedTreeNodeLibraryPermission', () => {
        test('Return herited permission', async () => {
            const permDomain = treeNodeLibraryPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getInheritedTreeLibraryPermission({
                action: TreeNodePermissionsActions.EDIT_CHILDREN,
                treeId: 'test_tree',
                libraryId: 'test_lib',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
