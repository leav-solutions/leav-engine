import {SystemLibraries} from '../../_constants/systemLibraries';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type ITreeRepo} from '../../infra/tree/treeRepo';
import {type IValueRepo} from '../../infra/value/valueRepo';
import {type IQueryInfos} from '../../_types/queryInfos';
import {PermissionsRelations, TreeNodePermissionsActions} from '../../_types/permissions';
import {type ITree, type ITreeElement, type TreePath} from '../../_types/tree';
import {mockAttrTree} from '../../__tests__/mocks/attribute';
import {mockTree} from '../../__tests__/mocks/tree';
import {type ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import {type ITreeLibraryPermissionDomain} from './treeLibraryPermissionDomain';
import treeNodePermissionDomain, {type ITreeNodePermissionDomainDeps} from './treeNodePermissionDomain';
import {type ITreePermissionDomain} from './treePermissionDomain';
import {type IGetTreeBasedPermissionParams} from './_types';
import {type ToAny} from '../../utils/utils';
import {type IElementAncestorsHelper} from '../tree/helpers/elementAncestors';

const depsBase: ToAny<ITreeNodePermissionDomainDeps> = {
    'core.domain.permission.tree': vi.fn(),
    'core.domain.permission.treeLibrary': vi.fn(),
    'core.domain.permission.helpers.treeBasedPermissions': vi.fn(),
    'core.domain.permission.helpers.permissionByUserGroups': vi.fn(),
    'core.domain.tree.helpers.elementAncestors': vi.fn(),
    'core.domain.helpers.getCoreEntityById': vi.fn(),
    'core.infra.tree': vi.fn(),
    'core.domain.attribute': vi.fn(),
    'core.infra.value': vi.fn(),
};

describe('treeNodePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordPermissionDomainTest',
    };

    afterEach(() => vi.clearAllMocks());

    describe('getTreeNodePermission', () => {
        const treeNode: ITreeElement = {
            id: 'baseElement',
            library: 'lib1',
        };

        const mockTreeRepoNoPerm: Mockify<ITreeRepo> = {
            getTrees: global.__mockPromise({list: [{...mockTree, permissions_conf: null}]}),
            getRecordByNodeId: global.__mockPromise(treeNode),
        };

        const mockTreeLibPermissionDomain: Mockify<ITreeLibraryPermissionDomain> = {
            getTreeLibraryPermission: global.__mockPromise(true),
        };

        const treeWithPerms: ITree = {
            ...mockTree,
            permissions_conf: {
                lib1: {
                    permissionTreeAttributes: ['attr1'],
                    relation: PermissionsRelations.AND,
                },
            },
        };

        const mockAncestors: TreePath = [
            {
                id: 'parentNode1',
                record: {
                    id: 'parent1',
                    library: 'lib1',
                },
            },
            {
                id: 'parentNode2',
                record: {
                    id: 'parent2',
                    library: 'lib1',
                },
            },
        ];

        const mockElementAncestors: Mockify<IElementAncestorsHelper> = {
            getCachedElementAncestors: global.__mockPromise(mockAncestors),
        };

        const mockTreeRepoWithPerm: Mockify<ITreeRepo> = {
            getTrees: global.__mockPromise({list: [treeWithPerms]}),
            getRecordByNodeId: global.__mockPromise(treeNode),
        };

        const mockAttrDomain: Mockify<IAttributeDomain> = {
            getAttributeProperties: global.__mockPromise({...mockAttrTree, id: 'category'}),
        };

        const mockValueRepo: Mockify<IValueRepo> = {
            getValues: vi.fn().mockImplementation(({attribute, recordId}) => {
                let val;
                switch (attribute.id) {
                    case 'category':
                        val = {
                            id_value: 12345,
                            payload: {
                                id: recordId === 'parent1' ? 'parentCategory' : 'elementCategory',
                                record: {
                                    id: recordId === 'parent1' ? 'parentCategory' : 'elementCategory',
                                    library: 'category',
                                },
                            },
                        };
                        break;
                    case 'user_groups':
                        val = {
                            id_value: 54321,
                            payload: {
                                id: '12346',
                                record: {
                                    id: 1,
                                    library: SystemLibraries.USERS_GROUPS,
                                },
                            },
                        };
                        break;
                }

                return Promise.resolve([val]);
            }),
        };

        test('Should return global tree library permission if no permissions conf defined', async () => {
            const mockTreePermDomain: Mockify<ITreePermissionDomain> = {
                getTreePermission: global.__mockPromise(false),
            };

            const domain = treeNodePermissionDomain({
                ...depsBase,
                'core.infra.tree': mockTreeRepoNoPerm as ITreeRepo,
                'core.domain.permission.tree': mockTreePermDomain as ITreePermissionDomain,
                'core.domain.permission.treeLibrary': mockTreeLibPermissionDomain as ITreeLibraryPermissionDomain,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestors as IElementAncestorsHelper,
                'core.domain.helpers.getCoreEntityById': vi.fn().mockReturnValue(mockTree),
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.EDIT_CHILDREN,
                nodeId: '123456',
                treeId: 'test',
                ctx,
            });

            expect(mockTreeLibPermissionDomain.getTreeLibraryPermission).toBeCalled();
            expect(perm).toBe(true);
        });

        test('Should return permission defined on element', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getTreeBasedPermission: global.__mockPromise(false),
            };

            const domain = treeNodePermissionDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.tree': mockTreeRepoWithPerm as ITreeRepo,
                'core.domain.permission.treeLibrary': mockTreeLibPermissionDomain as ITreeLibraryPermissionDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestors as IElementAncestorsHelper,
                'core.domain.helpers.getCoreEntityById': vi.fn().mockReturnValue(treeWithPerms),
                'core.infra.value': mockValueRepo as IValueRepo,
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                nodeId: '123456',
                treeId: 'test',
                ctx,
            });

            expect(mockTreeLibPermissionDomain.getTreeLibraryPermission).not.toBeCalled();
            expect(perm).toBe(false);
        });

        test('If nothing defined on element, should return a permission defined on tree library', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getTreeBasedPermission: vi.fn().mockImplementation((params: IGetTreeBasedPermissionParams) => {
                    switch (params.treeValues.attr1[0]) {
                        case 'elementCategory':
                            return Promise.resolve(null);
                        case 'parentCategory':
                            return Promise.resolve(false);
                    }
                    return Promise.reject(new Error('Unknown mock call'));
                }),
            };

            const domain = treeNodePermissionDomain({
                ...depsBase,
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.infra.tree': mockTreeRepoWithPerm as ITreeRepo,
                'core.domain.permission.treeLibrary': mockTreeLibPermissionDomain as ITreeLibraryPermissionDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.tree.helpers.elementAncestors': mockElementAncestors as IElementAncestorsHelper,
                'core.domain.helpers.getCoreEntityById': vi.fn().mockReturnValue(mockTree),
                'core.infra.value': mockValueRepo as IValueRepo,
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                nodeId: '123456',
                treeId: 'test',
                ctx,
            });

            expect(mockTreeLibPermissionDomain.getTreeLibraryPermission).toBeCalled();
            expect(perm).toBe(true);
        });
    });

    describe('getInheritedTreeNodePermission', () => {
        test('Return herited tree node permission', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getInheritedTreeBasedPermission: global.__mockPromise(false),
            };

            const treeNodePermDomain = treeNodePermissionDomain({
                ...depsBase,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
            });

            const perm = await treeNodePermDomain.getInheritedTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userGroupId: '12345',
                treeId: 'test_tree',
                libraryId: 'test_lib',
                permTree: 'categories',
                permTreeNode: '54321',
                ctx,
            });

            expect(perm).toBe(false);
        });
    });
});
