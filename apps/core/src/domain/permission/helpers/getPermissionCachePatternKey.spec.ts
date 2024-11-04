// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {PermissionTypes, AttributePermissionsActions} from '../../../_types/permissions';
import getPermissionCachePatternKey from './getPermissionCachePatternKey';
import {PERMISSIONS_CACHE_HEADER} from '../_types';

describe('getPermissionCacheKey', () => {
    test('Return full permission cache key pattern', async () => {
        const groupsId = ['1', '2', '3'];
        const permissionType = PermissionTypes.ATTRIBUTE;
        const applyTo = 'attribute';
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCachePatternKey({groupsId, permissionType, applyTo, permissionAction, key});

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId
                .sort()
                .join('+')}:${permissionType}:${applyTo}:${permissionAction}:${key}`
        );
    });

    test('Return permission cache key pattern without groupsId', async () => {
        const permissionType = PermissionTypes.ATTRIBUTE;
        const applyTo = 'attribute';
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCachePatternKey({permissionType, applyTo, permissionAction, key});

        expect(cacheKey).toBe(`${PERMISSIONS_CACHE_HEADER}:*:${permissionType}:${applyTo}:${permissionAction}:${key}`);
    });

    test('Return permission cache key pattern without permissionType', async () => {
        const groupsId = ['1', '2', '3'];
        const applyTo = 'attribute';
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCachePatternKey({groupsId, applyTo, permissionAction, key});

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId.sort().join('+')}:*:${applyTo}:${permissionAction}:${key}`
        );
    });

    test('Return permission cache key pattern without applyTo', async () => {
        const groupsId = ['1', '2', '3'];
        const permissionType = PermissionTypes.ATTRIBUTE;
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCachePatternKey({groupsId, permissionType, permissionAction, key});

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId.sort().join('+')}:${permissionType}:*:${permissionAction}:${key}`
        );
    });

    test('Return permission cache key pattern without permissionAction', async () => {
        const groupsId = ['1', '2', '3'];
        const permissionType = PermissionTypes.ATTRIBUTE;
        const applyTo = 'attribute';
        const key = 'key';

        const cacheKey = getPermissionCachePatternKey({groupsId, permissionType, applyTo, key});

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId.sort().join('+')}:${permissionType}:${applyTo}:*:${key}`
        );
    });

    test('Return permission cache key pattern without key', async () => {
        const groupsId = ['1', '2', '3'];
        const permissionType = PermissionTypes.ATTRIBUTE;
        const applyTo = 'attribute';
        const permissionAction = AttributePermissionsActions.ACCESS_ATTRIBUTE;
        const key = 'key';

        const cacheKey = getPermissionCachePatternKey({groupsId, permissionType, applyTo, permissionAction});

        expect(cacheKey).toBe(
            `${PERMISSIONS_CACHE_HEADER}:${groupsId
                .sort()
                .join('+')}:${permissionType}:${applyTo}:${permissionAction}:*`
        );
    });
});
