// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {AdminPermissionsActions} from '../../_types/permissions';
import adminPermissionDomain from './adminPermissionDomain';
import {IGlobalPermissionHelper} from './helpers/globalPermission';

describe('PermissionDomain', () => {
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
    describe('getAppPermission', () => {
        test('Return app permission', async () => {
            const permDomain = adminPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getAdminPermission({
                action: AdminPermissionsActions.ACCESS_ATTRIBUTES,
                userId: '12345',
                ctx
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getInheritedAppPermission', () => {
        test('Return herited admin permission', async () => {
            const permDomain = adminPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getInheritedAdminPermission({
                action: AdminPermissionsActions.ACCESS_ATTRIBUTES,
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
