// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ITreeRepo} from 'infra/tree/treeRepo';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {PermissionsRelations, TreeNodePermissionsActions} from '../../_types/permissions';
import {ITree, ITreeElement, TreePaths} from '../../_types/tree';
import {mockAttrTree} from '../../__tests__/mocks/attribute';
import {mockTree} from '../../__tests__/mocks/tree';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {ITreeLibraryPermissionDomain} from './treeLibraryPermissionDomain';
import treeNodePermissionDomain, {IDeps} from './treeNodePermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';
import {IGetTreeBasedPermissionParams} from './_types';
import {ToAny} from 'utils/utils';

const depsBase: ToAny<IDeps> = {
    'core.domain.permission.tree': jest.fn(),
    'core.domain.permission.treeLibrary': jest.fn(),
    'core.domain.permission.helpers.treeBasedPermissions': jest.fn(),
    'core.domain.permission.helpers.permissionByUserGroups': jest.fn(),
    'core.domain.permission.helpers.defaultPermission': jest.fn(),
    'core.domain.helpers.getCoreEntityById': jest.fn(),
    'core.infra.tree': jest.fn(),
    'core.domain.attribute': jest.fn(),
    'core.infra.value': jest.fn()
};

describe('treeNodePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordPermissionDomainTest'
    };

    afterEach(() => jest.clearAllMocks());

    describe('getTreeNodePermission', () => {
        const treeNode: ITreeElement = {
            id: 'baseElement',
            library: 'lib1'
        };

        const mockTreeRepoNoPerm: Mockify<ITreeRepo> = {
            getTrees: global.__mockPromise({list: [{...mockTree, permissions_conf: null}]}),
            getRecordByNodeId: global.__mockPromise(treeNode)
        };

        const mockTreeLibPermissionDomain: Mockify<ITreeLibraryPermissionDomain> = {
            getTreeLibraryPermission: global.__mockPromise(true)
        };

        const mockTreeLibPermissionDomainNoPerm: Mockify<ITreeLibraryPermissionDomain> = {
            getTreeLibraryPermission: global.__mockPromise(null)
        };

        const treeWithPerms: ITree = {
            ...mockTree,
            permissions_conf: {
                lib1: {
                    permissionTreeAttributes: ['attr1'],
                    relation: PermissionsRelations.AND
                }
            }
        };

        const mockAncestors: TreePaths = [
            {
                id: 'parentNode1',
                record: {
                    id: 'parent1',
                    library: 'lib1'
                }
            },
            {
                id: 'parentNode2',
                record: {
                    id: 'parent2',
                    library: 'lib1'
                }
            }
        ];

        const mockTreeRepoWithPerm: Mockify<ITreeRepo> = {
            getTrees: global.__mockPromise({list: [treeWithPerms]}),
            getElementAncestors: global.__mockPromise(mockAncestors),
            getRecordByNodeId: global.__mockPromise(treeNode)
        };

        const mockDefaultPermHelper: Mockify<IDefaultPermissionHelper> = {
            getDefaultPermission: jest.fn().mockReturnValue(true)
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({...mockAttrTree, id: 'category'})
        };

        const mockValueRepo: Mockify<IValueRepo> = {
            getValues: jest.fn().mockImplementation(({attribute, recordId}) => {
                let val;
                switch (attribute.id) {
                    case 'category':
                        val = {
                            id_value: 12345,
                            payload: {
                                id: recordId === 'parent1' ? 'parentCategory' : 'elementCategory',
                                record: {
                                    id: recordId === 'parent1' ? 'parentCategory' : 'elementCategory',
                                    library: 'category'
                                }
                            }
                        };
                        break;
                    case 'user_groups':
                        val = {
                            id_value: 54321,
                            payload: {
                                id: '12346',
                                record: {
                                    id: 1,
                                    library: 'users_groups'
                                }
                            }
                        };
                        break;
                }

                return Promise.resolve([val]);
            })
        };

        test('Should return global tree library permission if no permissions conf defined', async () => {
            const mockTreePermDomain: Mockify<ITreePermissionDomain> = {
                getTreePermission: global.__mockPromise(false)
            };

            const mockDefaultPerm: Mockify<IDefaultPermissionHelper> = {
                getDefaultPermission: jest.fn().mockReturnValue(true)
            };

            const domain = treeNodePermissionDomain({
                ...depsBase,
                'core.infra.tree': mockTreeRepoNoPerm as ITreeRepo,
                'core.domain.permission.tree': mockTreePermDomain as ITreePermissionDomain,
                'core.domain.permission.treeLibrary': mockTreeLibPermissionDomain as ITreeLibraryPermissionDomain,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPerm as IDefaultPermissionHelper,
                'core.domain.helpers.getCoreEntityById': jest.fn().mockReturnValue(mockTree)
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.EDIT_CHILDREN,
                userId: ctx.userId,
                nodeId: '123456',
                treeId: 'test',
                ctx
            });

            expect(mockTreeLibPermissionDomain.getTreeLibraryPermission).toBeCalled();
            expect(perm).toBe(true);
        });

        test('Should return permission defined on element', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getTreeBasedPermission: global.__mockPromise(false)
            };

            const domain = treeNodePermissionDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.tree': mockTreeRepoWithPerm as ITreeRepo,
                'core.domain.permission.treeLibrary': mockTreeLibPermissionDomain as ITreeLibraryPermissionDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.helpers.getCoreEntityById': jest.fn().mockReturnValue(treeWithPerms),
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userId: ctx.userId,
                nodeId: '123456',
                treeId: 'test',
                ctx
            });

            expect(mockTreeLibPermissionDomain.getTreeLibraryPermission).not.toBeCalled();
            expect(perm).toBe(false);
        });

        test('If nothing defined on element, should return a permission defined on tree library', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getTreeBasedPermission: jest.fn().mockImplementation((params: IGetTreeBasedPermissionParams) => {
                    switch (params.treeValues.attr1[0]) {
                        case 'elementCategory':
                            return Promise.resolve(null);
                        case 'parentCategory':
                            return Promise.resolve(false);
                    }
                })
            };

            const domain = treeNodePermissionDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.tree': mockTreeRepoWithPerm as ITreeRepo,
                'core.domain.permission.treeLibrary': mockTreeLibPermissionDomain as ITreeLibraryPermissionDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.helpers.getCoreEntityById': jest.fn().mockReturnValue(mockTree),
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userId: ctx.userId,
                nodeId: '123456',
                treeId: 'test',
                ctx
            });

            expect(mockTreeLibPermissionDomain.getTreeLibraryPermission).toBeCalled();
            expect(perm).toBe(true);
        });

        test('If nothing defined on element and library, should return a permission defined on parent', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getTreeBasedPermission: jest.fn().mockImplementation((params: IGetTreeBasedPermissionParams) => {
                    switch (params.treeValues.attr1[0]) {
                        case 'elementCategory':
                            return Promise.resolve(null);
                        case 'parentCategory':
                            return Promise.resolve(false);
                    }
                })
            };

            const domain = treeNodePermissionDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.tree': mockTreeRepoWithPerm as ITreeRepo,
                'core.domain.permission.treeLibrary': mockTreeLibPermissionDomainNoPerm as ITreeLibraryPermissionDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.helpers.getCoreEntityById': jest.fn().mockReturnValue(treeWithPerms),
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userId: ctx.userId,
                nodeId: '123456',
                treeId: 'test',
                ctx
            });

            expect(perm).toBe(false);
        });

        test('If nothing defined on parents, should return tree permission ', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getTreeBasedPermission: global.__mockPromise(null)
            };

            const mockTreePermissionDomain: Mockify<ITreePermissionDomain> = {
                getTreePermission: global.__mockPromise(false)
            };

            const domain = treeNodePermissionDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.tree': mockTreeRepoWithPerm as ITreeRepo,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.permission.treeLibrary': mockTreeLibPermissionDomainNoPerm as ITreeLibraryPermissionDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.domain.helpers.getCoreEntityById': jest.fn().mockReturnValue(mockTree),
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userId: ctx.userId,
                nodeId: '123456',
                treeId: 'test',
                ctx
            });

            expect(mockTreePermissionDomain.getTreePermission).toBeCalled();
            expect(perm).toBe(false);
        });
    });

    describe('getInheritedTreeNodePermission', () => {
        test('Return herited tree node permission', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getInheritedTreeBasedPermission: global.__mockPromise(false)
            };

            const treeNodePermDomain = treeNodePermissionDomain({
                ...depsBase,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper
            });

            const perm = await treeNodePermDomain.getInheritedTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userGroupId: '12345',
                treeId: 'test_tree',
                libraryId: 'test_lib',
                permTree: 'categories',
                permTreeNode: '54321',
                ctx
            });

            expect(perm).toBe(false);
        });
    });
});
