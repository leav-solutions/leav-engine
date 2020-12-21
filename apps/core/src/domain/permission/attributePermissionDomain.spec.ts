// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IQueryInfos} from '_types/queryInfos';
import {AttributePermissionsActions} from '../../_types/permissions';
import attributePermissionDomain from './attributePermissionDomain';
import {IGlobalPermissionHelper} from './helpers/globalPermission';

describe('AttributePermissionDomain', () => {
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

    describe('getAttributePermission', () => {
        test('Return attribute permission', async () => {
            const permDomain = attributePermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_tree',
                ctx
            });

            expect(perm).toBe(globalPerm);
        });
    });

    describe('getHeritedAttributePermission', () => {
        test('Return herited library permission', async () => {
            const permDomain = attributePermissionDomain({
                'core.domain.permission.helpers.globalPermission': mockGlobalPermHelper as IGlobalPermissionHelper
            });

            const perm = await permDomain.getHeritedAttributePermission({
                action: AttributePermissionsActions.ACCESS_ATTRIBUTE,
                attributeId: 'test_tree',
                userGroupId: '12345',
                ctx
            });

            expect(perm).toBe(inheritGlobalPerm);
        });
    });
});
