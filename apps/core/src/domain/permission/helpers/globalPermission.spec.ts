// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeRepo} from 'infra/attribute/attributeRepo';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {LibraryPermissionsActions, PermissionTypes} from '../../../_types/permissions';
import globalPermissions, {IGlobalPermissionDeps} from './globalPermission';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {ICachesService, ICacheService} from '../../../infra/cache/cacheService';
import {ToAny} from '../../../utils/utils';

const mockCacheService: Mockify<ICacheService> = {
    getData: global.__mockPromise([null]),
    storeData: global.__mockPromise()
};

const mockCachesService: Mockify<ICachesService> = {
    getCache: jest.fn().mockReturnValue(mockCacheService)
};

const depsBase: ToAny<IGlobalPermissionDeps> = {
    'core.domain.permission.helpers.permissionByUserGroups': jest.fn(),
    'core.domain.permission.helpers.defaultPermission': jest.fn(),
    'core.infra.permission': jest.fn(),
    'core.infra.attribute': jest.fn(),
    'core.infra.tree': jest.fn(),
    'core.infra.value': jest.fn(),
    'core.infra.cache.cacheService': jest.fn()
};

describe('globalPermissionsHelper', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'permissionDomainTest',
        groupsId: ['1']
    };

    const defaultPerm = false;

    describe('getGlobalPermission', () => {
        const mockAttrRepo: Mockify<IAttributeRepo> = {
            getAttributes: global.__mockPromise({
                list: [
                    {
                        id: 'user_groups',
                        linked_tree: 'users_groups'
                    }
                ],
                totalCount: 0
            })
        };

        const mockValRepo: Mockify<IValueRepo> = {
            getValues: global.__mockPromise([
                {
                    id_value: 54321,
                    value: {
                        record: {
                            id: 1,
                            library: 'users_groups'
                        }
                    }
                }
            ])
        };

        const mockTreeRepo: Mockify<ITreeRepo> = {
            getNodesByRecord: global.__mockPromise([]),
            getElementAncestors: global.__mockPromise([
                [
                    {
                        record: {
                            id: 1,
                            library: 'users_groups'
                        }
                    },
                    {
                        record: {
                            id: 2,
                            library: 'users_groups'
                        }
                    },
                    {
                        record: {
                            id: 3,
                            library: 'users_groups'
                        }
                    }
                ]
            ])
        };

        test('Return global permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permHelper = globalPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.attribute': mockAttrRepo as IAttributeRepo,
                'core.infra.value': mockValRepo as IValueRepo,
                'core.infra.tree': mockTreeRepo as ITreeRepo,
                'core.infra.cache.cacheService': mockCachesService as ICachesService
            });

            const perm = await permHelper.getGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    userId: '12345',
                    getDefaultPermission: () => false
                },
                ctx
            );

            expect(perm).toBe(true);
        });
    });

    describe('getInheritedGlobalPermission', () => {
        const mockTreeRepo: Mockify<ITreeRepo> = {
            getElementAncestors: global.__mockPromise([
                [
                    {
                        record: {
                            id: 1,
                            library: 'users_groups'
                        }
                    },
                    {
                        record: {
                            id: 2,
                            library: 'users_groups'
                        }
                    },
                    {
                        record: {
                            id: 3,
                            library: 'users_groups'
                        }
                    }
                ]
            ])
        };
        test('Return inherited global permission', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(true)
            };

            const permHelper = globalPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.infra.tree': mockTreeRepo as ITreeRepo
            });

            const perm = await permHelper.getInheritedGlobalPermission(
                {
                    type: PermissionTypes.LIBRARY,
                    action: LibraryPermissionsActions.ACCESS_RECORD,
                    applyTo: 'test_lib',
                    userGroupNodeId: '12345',
                    getDefaultPermission: () => false
                },
                ctx
            );

            expect(perm).toBe(true);
        });
    });
});
