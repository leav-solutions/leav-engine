// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes, AttributePermissionsActions} from '../../../_types/permissions';
import getPermissionCacheKey from './getPermissionCacheKey';
import {PERMISSIONS_CACHE_HEADER} from '../_types';

describe('getPermissionCacheKey', () => {
    test('Return full permission cache key', async () => {
        const groupsId = ['1', '2', '3'];
        const permissionType = PermissionTypes.ATTRIBUTE;
        const applyTo = 'attribute';
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCacheKey(groupsId, permissionType, applyTo, permissionAction, key);

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId
                .sort()
                .join('+')}:${permissionType}:${applyTo}:${permissionAction}:${key}`
        );
    });

    test('Return permission cache key without groupsId', async () => {
        const permissionType = PermissionTypes.ATTRIBUTE;
        const applyTo = 'attribute';
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCacheKey(null, permissionType, applyTo, permissionAction, key);

        expect(cacheKey).toBe(`${PERMISSIONS_CACHE_HEADER}::${permissionType}:${applyTo}:${permissionAction}:${key}`);
    });

    test('Return permission cache key without permissionType', async () => {
        const groupsId = ['1', '2', '3'];
        const applyTo = 'attribute';
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCacheKey(groupsId, null, applyTo, permissionAction, key);

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId.sort().join('+')}::${applyTo}:${permissionAction}:${key}`
        );
    });

    test('Return permission cache key without applyTo', async () => {
        const groupsId = ['1', '2', '3'];
        const permissionType = PermissionTypes.ATTRIBUTE;
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCacheKey(groupsId, permissionType, null, permissionAction, key);

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId.sort().join('+')}:${permissionType}::${permissionAction}:${key}`
        );
    });

    test('Return permission cache key without permissionAction', async () => {
        const groupsId = ['1', '2', '3'];
        const permissionType = PermissionTypes.ATTRIBUTE;
        const applyTo = 'attribute';
        const key = 'key';

        const cacheKey = getPermissionCacheKey(groupsId, permissionType, applyTo, null, key);

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId.sort().join('+')}:${permissionType}:${applyTo}::${key}`
        );
    });

    test('Return permission cache key without key', async () => {
        const groupsId = ['1', '2', '3'];
        const permissionType = PermissionTypes.ATTRIBUTE;
        const applyTo = 'attribute';
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;

        const cacheKey = getPermissionCacheKey(groupsId, permissionType, applyTo, permissionAction, null);

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId.sort().join('+')}:${permissionType}:${applyTo}:${permissionAction}:`
        );
    });
});
