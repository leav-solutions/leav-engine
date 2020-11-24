import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IValueRepo} from 'infra/value/valueRepo';
import {IQueryInfos} from '_types/queryInfos';
import {PermissionsRelations, TreeNodePermissionsActions} from '../../_types/permissions';
import {ITree, ITreeElement, ITreeNode} from '../../_types/tree';
import {mockAttrTree} from '../../__tests__/mocks/attribute';
import {mockTree} from '../../__tests__/mocks/tree';
import {IDefaultPermissionHelper} from './helpers/defaultPermission';
import {ITreeBasedPermissionHelper} from './helpers/treeBasedPermissions';
import treeNodePermissionDomain from './treeNodePermissionDomain';
import {ITreePermissionDomain} from './treePermissionDomain';
import {IGetTreeBasedPermissionParams} from './_types';

describe('treeNodePermissionDomain', () => {
    const ctx: IQueryInfos = {
        userId: '1',
        queryId: 'recordPermissionDomainTest'
    };

    describe('getTreeNodePermission', () => {
        const treeNode: ITreeElement = {
            id: 'baseElement',
            library: 'lib1'
        };

        const mockTreeDomainNoPerm: Mockify<ITreeDomain> = {
            getTreeProperties: global.__mockPromise({...mockTree, permissions_conf: null})
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

        const mockAncestors: ITreeNode[] = [
            {
                record: {
                    id: 'parent1',
                    library: 'lib1'
                }
            },
            {
                record: {
                    id: 'parent2',
                    library: 'lib1'
                }
            }
        ];

        const mockTreeDomainWithPerm: Mockify<ITreeDomain> = {
            getTreeProperties: global.__mockPromise(treeWithPerms),
            getElementAncestors: global.__mockPromise(mockAncestors)
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
                            value: {
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
                            value: {
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

        test('Should return global tree permission if no permissions conf defined', async () => {
            const mockTreePermDomain: Mockify<ITreePermissionDomain> = {
                getTreePermission: global.__mockPromise(false)
            };

            const mockDefaultPerm: Mockify<IDefaultPermissionHelper> = {
                getDefaultPermission: jest.fn().mockReturnValue(true)
            };

            const domain = treeNodePermissionDomain({
                'core.domain.tree': mockTreeDomainNoPerm as ITreeDomain,
                'core.domain.permission.tree': mockTreePermDomain as ITreePermissionDomain,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPerm as IDefaultPermissionHelper
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.EDIT_CHILDREN,
                userId: ctx.userId,
                node: treeNode,
                treeId: 'test',
                ctx
            });

            expect(perm).toBe(false);
        });

        test('Should return permission defined on element', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getTreeBasedPermission: global.__mockPromise(false)
            };

            const domain = treeNodePermissionDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.tree': mockTreeDomainWithPerm as ITreeDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userId: ctx.userId,
                node: treeNode,
                treeId: 'test',
                ctx
            });

            expect(perm).toBe(false);
        });

        test('If nothing defined on element, should return a permission defined on parent', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getTreeBasedPermission: jest.fn().mockImplementation((params: IGetTreeBasedPermissionParams) => {
                    switch (params.treeValues.attr1[0].record.id) {
                        case 'elementCategory':
                            return Promise.resolve(null);
                        case 'parentCategory':
                            return Promise.resolve(false);
                    }
                })
            };

            const domain = treeNodePermissionDomain({
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.tree': mockTreeDomainWithPerm as ITreeDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userId: ctx.userId,
                node: treeNode,
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
                'core.domain.attribute': mockAttrDomain as IAttributeDomain,
                'core.domain.tree': mockTreeDomainWithPerm as ITreeDomain,
                'core.domain.permission.tree': mockTreePermissionDomain as ITreePermissionDomain,
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper,
                'core.domain.permission.helpers.defaultPermission': mockDefaultPermHelper as IDefaultPermissionHelper,
                'core.infra.value': mockValueRepo as IValueRepo
            });

            const perm = await domain.getTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userId: ctx.userId,
                node: treeNode,
                treeId: 'test',
                ctx
            });

            expect(perm).toBe(false);
        });
    });

    describe('getHeritedTreeNodePermission', () => {
        test('Return herited tree node permission', async () => {
            const mockTreeBasedPerm: Mockify<ITreeBasedPermissionHelper> = {
                getHeritedTreeBasedPermission: global.__mockPromise(false)
            };

            const treeNodePermDomain = treeNodePermissionDomain({
                'core.domain.permission.helpers.treeBasedPermissions': mockTreeBasedPerm as ITreeBasedPermissionHelper
            });

            const perm = await treeNodePermDomain.getHeritedTreeNodePermission({
                action: TreeNodePermissionsActions.ACCESS_TREE,
                userGroupId: '12345',
                treeId: 'test_tree',
                libraryId: 'test_lib',
                permTree: 'categories',
                permTreeNode: {id: '54321', library: 'categories'},
                ctx
            });

            expect(perm).toBe(false);
        });
    });
});
