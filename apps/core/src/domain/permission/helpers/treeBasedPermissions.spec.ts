// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {IElementAncestorsHelper} from 'domain/tree/helpers/elementAncestors';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {ICacheService, ICachesService} from '../../../infra/cache/cacheService';
import {PermissionsRelations, PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import {IGetTreeBasedPermissionParams} from '../_types';
import {IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {IReducePermissionsArrayHelper} from './reducePermissionsArray';
import treeBasedPermissions, {ITreeBasedPermissionsDeps} from './treeBasedPermissions';
import {ToAny} from '../../../utils/utils';

const mockCacheService: Mockify<ICacheService> = {
    getData: global.__mockPromise([null]),
    storeData: global.__mockPromise()
};

const mockCachesService: Mockify<ICachesService> = {
    getCache: jest.fn().mockReturnValue(mockCacheService)
};

const depsBase: ToAny<ITreeBasedPermissionsDeps> = {
    'core.domain.attribute': jest.fn(),
    'core.domain.permission.helpers.permissionByUserGroups': jest.fn(),
    'core.domain.permission.helpers.defaultPermission': jest.fn(),
    'core.domain.permission.helpers.reducePermissionsArray': jest.fn(),
    'core.domain.tree.helpers.elementAncestors': jest.fn(),
    'core.infra.permission': jest.fn(),
    'core.infra.cache.cacheService': jest.fn()
};

describe('TreeBasedPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'treePermissionDomainTest',
        groupsId: ['1']
    };

    beforeEach(() => jest.clearAllMocks());

    describe('getTreePermission', () => {
        const mockAttrProps = {
            category: {
                id: 'category',
                type: 'tree',
                linked_tree: 'categories'
            },
            user_groups: {
                id: 'user_groups',
                type: 'tree',
                linked_tree: 'users_groups'
            }
        };
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: jest.fn().mockImplementation(({id}) => Promise.resolve(mockAttrProps[id]))
        };

        const defaultPerm = false;

        const ancestors = {
            categories: [
                [
                    {
                        record: {
                            id: 'A',
                            library: 'category'
                        }
                    },
                    {
                        record: {
                            id: 'B',
                            library: 'category'
                        }
                    },
                    {
                        record: {
                            id: 'C',
                            library: 'category'
                        }
                    }
                ]
            ],
            statuses: [
                [
                    {
                        record: {
                            id: 'AA',
                            library: 'status'
                        }
                    },
                    {
                        record: {
                            id: 'BB',
                            library: 'status'
                        }
                    },
                    {
                        record: {
                            id: 'CC',
                            library: 'status'
                        }
                    }
                ]
            ],
            users_groups: [
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
            ]
        };

        const mockElementAncestorsHelper = {
            getCachedElementAncestors: jest.fn().mockImplementation(({treeId}) => Promise.resolve(ancestors[treeId])),
            clearElementAncestorsCache: jest.fn()
        } satisfies Mockify<IElementAncestorsHelper>;

        const attributesProps = {
            category: {
                id: 'category',
                type: 'tree',
                linked_tree: 'categories'
            },
            status: {
                id: 'status',
                type: 'tree',
                linked_tree: 'statuses'
            },
            user_groups: {
                id: 'user_groups',
                type: 'tree',
                linked_tree: 'users_groups'
            }
        };
        const mockAttrMultipleDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: jest.fn().mockImplementation(({id}) => Promise.resolve(attributesProps[id]))
        };

        const values = {
            category: {
                id_value: 12345,
                value: {
                    record: {
                        id: 'A',
                        library: 'category'
                    }
                }
            },
            status: {
                id_value: 98765,
                value: {
                    record: {
                        id: 'AA',
                        library: 'statuses'
                    }
                }
            },
            user_groups: {
                id_value: 54321,
                value: {
                    record: {
                        id: 1,
                        library: 'users_groups'
                    }
                }
            }
        };

        const mockPermConf = {
            relation: PermissionsRelations.AND,
            permissionTreeAttributes: ['category']
        };

        const mockReducePermissionsArrayHelper: IReducePermissionsArrayHelper = {
            reducePermissionsArray: jest.fn().mockReturnValue(true)
        };

        const mockReducePermissionsArrayHelperFalse: IReducePermissionsArrayHelper = {
            reducePermissionsArray: jest.fn().mockReturnValue(false)
        };

        const mockReducePermissionsArrayHelperNull: IReducePermissionsArrayHelper = {
            reducePermissionsArray: jest.fn().mockReturnValue(null)
        };

        const params: IGetTreeBasedPermissionParams = {
            type: PermissionTypes.RECORD_ATTRIBUTE,
            action: RecordPermissionsActions.ACCESS_RECORD,
            userId: '987654',
            applyTo: 'test_lib',
            treeValues: {
                category: ['321654']
            },
            permissions_conf: mockPermConf,
            getDefaultPermission: jest.fn().mockReturnValue(defaultPerm)
        };

        beforeEach(() => jest.clearAllMocks());

        test('1 tree / 1 user group with heritage', async () => {
            const mockPermByUserGroupsHelper = {
                getPermissionByUserGroups: global.__mockPromise(true)
            } satisfies Mockify<IPermissionByUserGroupsHelper>;

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.cache.cacheService': mockCachesService as ICachesService
            });

            const perm = await treePermDomain.getTreeBasedPermission(params, ctx);

            expect(mockElementAncestorsHelper.getCachedElementAncestors.mock.calls.length).toBe(2);
            expect(perm).toBe(true);
            expect(mockPermByUserGroupsHelper.getPermissionByUserGroups.mock.calls.length).toBe(1);
        });

        test('1 tree with multiple values on tree attribute', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromiseMultiple([false, true])
            };

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.cache.cacheService': mockCachesService as ICachesService
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params,
                    treeValues: {
                        category: ['cat1', 'cat2']
                    }
                },
                ctx
            );

            expect(perm).toBe(true);
        });

        test('No permissions defined (default config)', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelperNull,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.infra.cache.cacheService': mockCachesService as ICachesService
            });

            const perm = await treePermDomain.getTreeBasedPermission(params, ctx);

            expect(params.getDefaultPermission).toBeCalled();
            expect(perm).toBe(false);
        });

        test('Return permission on tree root level', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: jest
                    .fn()
                    .mockImplementation(({permissionTreeTarget}) =>
                        Promise.resolve(permissionTreeTarget.id === null ? true : null)
                    )
            };

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.infra.cache.cacheService': mockCachesService as ICachesService
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params
                },
                ctx
            );

            expect(perm).toBe(true);
        });

        test('No value on permission tree attribute', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromise(null)
            };

            const mockValueNoCatRepo: Mockify<IValueRepo> = {
                getValues: jest.fn().mockImplementation(({library, recordId, attribute}) => {
                    switch (attribute.id) {
                        case 'category':
                            return Promise.resolve([]);
                        case 'user_groups':
                            return Promise.resolve([
                                {
                                    id_value: 54321,
                                    value: {
                                        record: {
                                            id: 1,
                                            library: 'users_groups'
                                        }
                                    }
                                }
                            ]);
                    }
                })
            };

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.infra.cache.cacheService': mockCachesService as ICachesService
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params,
                    treeValues: {
                        category: []
                    }
                },
                ctx
            );

            expect(perm).toBe(defaultPerm);
        });

        test('n permissions trees with AND', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: jest.fn().mockImplementation(({permissionTreeTarget}) => {
                    if (permissionTreeTarget.tree === 'categories' && permissionTreeTarget.id === 'C') {
                        return Promise.resolve(true);
                    } else if (permissionTreeTarget.tree === 'statuses' && permissionTreeTarget.id === 'CC') {
                        return Promise.resolve(false);
                    } else {
                        return Promise.resolve(null);
                    }
                })
            };

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelperFalse,
                'core.domain.attribute': mockAttrMultipleDomain as IAttributeDomain,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.infra.cache.cacheService': mockCachesService as ICachesService
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params,
                    treeValues: {
                        category: ['321654'],
                        status: ['123456']
                    },
                    permissions_conf: {
                        relation: PermissionsRelations.AND,
                        permissionTreeAttributes: ['category', 'status']
                    }
                },
                ctx
            );

            expect(mockElementAncestorsHelper.getCachedElementAncestors.mock.calls.length).toBe(3);
            expect(perm).toBe(false);
            expect(mockPermByUserGroupsHelper.getPermissionByUserGroups.mock.calls.length).toBe(2);
        });

        test('n permissions trees with OR', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: jest.fn().mockImplementation(({permissionTreeTarget}) => {
                    if (permissionTreeTarget.tree === 'categories' && permissionTreeTarget.id === 'C') {
                        return Promise.resolve(true);
                    } else if (permissionTreeTarget.tree === 'statuses' && permissionTreeTarget.id === 'CC') {
                        return Promise.resolve(false);
                    } else {
                        return Promise.resolve(null);
                    }
                })
            };

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
                'core.domain.attribute': mockAttrMultipleDomain as IAttributeDomain,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.infra.cache.cacheService': mockCachesService as ICachesService
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params,
                    treeValues: {
                        category: ['321654'],
                        status: ['123456']
                    },
                    permissions_conf: {
                        relation: PermissionsRelations.OR,
                        permissionTreeAttributes: ['category', 'status']
                    }
                },
                ctx
            );

            expect(perm).toBe(true);
        });
    });
});
