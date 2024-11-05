// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {ApplicationPermissionsActions} from '../../_types/permissions';
import applicationPermissionDomain from './applicationPermissionDomain';
import {IGlobalPermissionHelper} from './helpers/globalPermission';

describe('applicationPermissionDomain', () => {
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

    describe('getApplicationPermission', () => {
        test('Return application permission', async () => {
            const permDomain = applicationPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getApplicationPermission({
                action: ApplicationPermissionsActions.ACCESS_APPLICATION,
                applicationId: 'test_app',
                userId: '12345',
                ctx
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getInheritedApplicationPermission', () => {
        test('Return herited application permission', async () => {
            const permDomain = applicationPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getInheritedApplicationPermission({
                action: ApplicationPermissionsActions.ACCESS_APPLICATION,
                applicationId: 'test_id',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
