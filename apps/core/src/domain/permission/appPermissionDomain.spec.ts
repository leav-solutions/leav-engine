// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {AppPermissionsActions} from '../../_types/permissions';
import appPermissionDomain from './appPermissionDomain';
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
            const permDomain = appPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getAppPermission({
                action: AppPermissionsActions.ACCESS_ATTRIBUTES,
                userId: '12345',
                ctx
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getInheritedAppPermission', () => {
        test('Return herited admin permission', async () => {
            const permDomain = appPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getInheritedAppPermission({
                action: AppPermissionsActions.ACCESS_ATTRIBUTES,
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
