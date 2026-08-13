import {SystemLibraries} from '../../../_constants/systemLibraries';
import {SystemTrees} from '../../../_constants/systemTrees';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IElementAncestorsHelper} from '../../tree/helpers/elementAncestors';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {PermissionsRelations, PermissionTypes, RecordPermissionsActions} from '../../../_types/permissions';
import {type IGetTreeBasedPermissionParams} from '../_types';
import {type IPermissionByUserGroupsHelper} from './permissionByUserGroups';
import {type IReducePermissionsArrayHelper} from './reducePermissionsArray';
import treeBasedPermissions, {type ITreeBasedPermissionsDeps} from './treeBasedPermissions';
import {type ToAny} from '../../../utils/utils';

const depsBase: ToAny<ITreeBasedPermissionsDeps> = {
    'core.domain.attribute': vi.fn(),
    'core.domain.permission.helpers.permissionByUserGroups': vi.fn(),
    'core.domain.permission.helpers.reducePermissionsArray': vi.fn(),
    'core.domain.tree.helpers.elementAncestors': vi.fn(),
    'core.infra.permission': vi.fn(),
};

describe('TreeBasedPermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'treePermissionDomainTest',
        groupsId: ['1'],
    };

    beforeEach(() => vi.clearAllMocks());

    describe('getTreePermission', () => {
        const mockAttrProps = {
            category: {
                id: 'category',
                type: 'tree',
                linked_tree: 'categories',
            },
            user_groups: {
                id: 'user_groups',
                type: 'tree',
                linked_tree: SystemTrees.USERS_GROUPS,
            },
        };
        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: vi.fn().mockImplementation(({id}) => Promise.resolve(mockAttrProps[id])),
        };

        const defaultPerm = false;

        const ancestors = {
            categories: [
                [
                    {
                        record: {
                            id: 'A',
                            library: 'category',
                        },
                    },
                    {
                        record: {
                            id: 'B',
                            library: 'category',
                        },
                    },
                    {
                        record: {
                            id: 'C',
                            library: 'category',
                        },
                    },
                ],
            ],
            statuses: [
                [
                    {
                        record: {
                            id: 'AA',
                            library: 'status',
                        },
                    },
                    {
                        record: {
                            id: 'BB',
                            library: 'status',
                        },
                    },
                    {
                        record: {
                            id: 'CC',
                            library: 'status',
                        },
                    },
                ],
            ],
            users_groups: [
                [
                    {
                        record: {
                            id: 1,
                            library: SystemLibraries.USERS_GROUPS,
                        },
                    },
                    {
                        record: {
                            id: 2,
                            library: SystemLibraries.USERS_GROUPS,
                        },
                    },
                    {
                        record: {
                            id: 3,
                            library: SystemLibraries.USERS_GROUPS,
                        },
                    },
                ],
            ],
        };

        const mockElementAncestorsHelper = {
            getCachedElementAncestors: vi.fn().mockImplementation(({treeId}) => Promise.resolve(ancestors[treeId])),
            clearElementAncestorsCache: vi.fn(),
        } satisfies Mockify<IElementAncestorsHelper>;

        const mockPermConf = {
            relation: PermissionsRelations.AND,
            permissionTreeAttributes: ['category'],
        };

        const mockReducePermissionsArrayHelper: IReducePermissionsArrayHelper = {
            reducePermissionsArray: vi.fn().mockReturnValue(true),
        };

        const params: IGetTreeBasedPermissionParams = {
            type: PermissionTypes.RECORD_ATTRIBUTE,
            action: RecordPermissionsActions.ACCESS_RECORD,
            applyTo: 'test_lib',
            treeValues: {
                category: ['321654'],
            },
            permissions_conf: mockPermConf,
            getDefaultPermission: vi.fn().mockReturnValue(defaultPerm),
        };

        beforeEach(() => vi.clearAllMocks());

        test('1 tree / 1 user group with heritage', async () => {
            const mockPermByUserGroupsHelper = {
                getPermissionByUserGroups: global.__mockPromise(true),
            } satisfies Mockify<IPermissionByUserGroupsHelper>;

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            });

            const perm = await treePermDomain.getTreeBasedPermission(params, ctx);

            expect(mockElementAncestorsHelper.getCachedElementAncestors.mock.calls.length).toBe(2);
            expect(perm).toBe(true);
            expect(mockPermByUserGroupsHelper.getPermissionByUserGroups.mock.calls.length).toBe(1);
        });

        test('1 tree with multiple values on tree attribute', async () => {
            const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
                getPermissionByUserGroups: global.__mockPromiseMultiple([false, true]),
            };

            const treePermDomain = treeBasedPermissions({
                ...depsBase,
                'core.domain.permission.helpers.permissionByUserGroups':
                    mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
                'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
            });

            const perm = await treePermDomain.getTreeBasedPermission(
                {
                    ...params,
                    treeValues: {
                        category: ['cat1', 'cat2'],
                    },
                },
                ctx,
            );

            expect(perm).toBe(true);
        });

        // TODO: move to permissionByUserGroups tests (next ticket)
        // test('Return permission on tree root level', async () => {
        //     const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
        //         getPermissionByUserGroups: jest
        //             .fn()
        //             .mockImplementation(({permissionTreeTarget}) =>
        //                 Promise.resolve(permissionTreeTarget.id === null ? true : null)
        //             )
        //     };
        //
        //     const treePermDomain = treeBasedPermissions({
        //         ...depsBase,
        //         'core.domain.permission.helpers.permissionByUserGroups':
        //             mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
        //         'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
        //         'core.domain.attribute': mockAttrDomain as IAttributeDomain,
        //         'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
        //         'core.infra.cache.cacheService': mockCachesService as ICachesService
        //     });
        //
        //     const perm = await treePermDomain.getTreeBasedPermission(
        //         {
        //             ...params
        //         },
        //         ctx
        //     );
        //
        //     expect(perm).toBe(true);
        // });

        // TODO: move to permissionByUserGroups tests (next ticket)
        // test('n permissions trees with AND', async () => {
        //     const mockPermByUserGroupsHelper = {
        //         getPermissionByUserGroups: vi.fn().mockImplementation(({permissionTreeTarget}) => {
        //             if (permissionTreeTarget.tree === 'categories' && permissionTreeTarget.id === 'C') {
        //                 return Promise.resolve(true);
        //             } else if (permissionTreeTarget.tree === 'statuses' && permissionTreeTarget.id === 'CC') {
        //                 return Promise.resolve(false);
        //             } else {
        //                 return Promise.resolve(defaultPerm);
        //             }
        //         })
        //     } satisfies Mockify<IPermissionByUserGroupsHelper>;
        //
        //     const treePermDomain = treeBasedPermissions({
        //         ...depsBase,
        //         'core.domain.permission.helpers.permissionByUserGroups':
        //             mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
        //         'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelperFalse,
        //         'core.domain.attribute': mockAttrMultipleDomain as IAttributeDomain,
        //         'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
        //         'core.infra.cache.cacheService': mockCachesService as ICachesService
        //     });
        //
        //     const perm = await treePermDomain.getTreeBasedPermission(
        //         {
        //             ...params,
        //             treeValues: {
        //                 category: ['321654'],
        //                 status: ['123456']
        //             },
        //             permissions_conf: {
        //                 relation: PermissionsRelations.AND,
        //                 permissionTreeAttributes: ['category', 'status']
        //             }
        //         },
        //         ctx
        //     );
        //
        //     expect(mockElementAncestorsHelper.getCachedElementAncestors.mock.calls.length).toBe(1);
        //     expect(perm).toBe(false);
        //     expect(mockPermByUserGroupsHelper.getPermissionByUserGroups.mock.calls.length).toBe(2);
        // });

        // TODO: move to permissionByUserGroups tests (next ticket)
        // test('n permissions trees with OR', async () => {
        //     const mockPermByUserGroupsHelper: Mockify<IPermissionByUserGroupsHelper> = {
        //         getPermissionByUserGroups: vi.fn().mockImplementation(({permissionTreeTarget}) => {
        //             if (permissionTreeTarget.tree === 'categories' && permissionTreeTarget.id === 'C') {
        //                 return Promise.resolve(true);
        //             } else if (permissionTreeTarget.tree === 'statuses' && permissionTreeTarget.id === 'CC') {
        //                 return Promise.resolve(false);
        //             } else {
        //                 return Promise.resolve(null);
        //             }
        //         })
        //     };
        //
        //     const treePermDomain = treeBasedPermissions({
        //         ...depsBase,
        //         'core.domain.permission.helpers.permissionByUserGroups':
        //             mockPermByUserGroupsHelper as IPermissionByUserGroupsHelper,
        //         'core.domain.permission.helpers.reducePermissionsArray': mockReducePermissionsArrayHelper,
        //         'core.domain.attribute': mockAttrMultipleDomain as IAttributeDomain,
        //         'core.domain.tree.helpers.elementAncestors': mockElementAncestorsHelper as IElementAncestorsHelper,
        //         'core.infra.cache.cacheService': mockCachesService as ICachesService
        //     });
        //
        //     const perm = await treePermDomain.getTreeBasedPermission(
        //         {
        //             ...params,
        //             treeValues: {
        //                 category: ['321654'],
        //                 status: ['123456']
        //             },
        //             permissions_conf: {
        //                 relation: PermissionsRelations.OR,
        //                 permissionTreeAttributes: ['category', 'status']
        //             }
        //         },
        //         ctx
        //     );
        //
        //     expect(perm).toBe(true);
        // });
    });
});
