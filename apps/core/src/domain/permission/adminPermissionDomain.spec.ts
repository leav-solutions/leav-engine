import {type IQueryInfos} from '../../_types/queryInfos';
import {AdminPermissionsActions} from '../../_types/permissions';
import adminPermissionDomain from './adminPermissionDomain';
import {type IGlobalPermissionHelper} from './helpers/globalPermission';

describe('PermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest',
    };
    const globalPerm = false;
    const inheritGlobalPerm = true;

    const mockGlobalPermHelper: Mockify<IGlobalPermissionHelper> = {
        getGlobalPermission: global.__mockPromise(globalPerm),
        getInheritedGlobalPermission: global.__mockPromise(inheritGlobalPerm),
    };
    describe('getAppPermission', () => {
        test('Return app permission', async () => {
            const permDomain = adminPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper,
            });

            const perm = await permDomain.getAdminPermission({
                action: AdminPermissionsActions.ACCESS_ATTRIBUTES,
                ctx,
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getInheritedAppPermission', () => {
        test('Return herited admin permission', async () => {
            const permDomain = adminPermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper,
            });

            const perm = await permDomain.getInheritedAdminPermission({
                action: AdminPermissionsActions.ACCESS_ATTRIBUTES,
                userGroupId: '12345',
                ctx,
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
