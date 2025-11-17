// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    makeGraphQlCall,
} from '../e2eUtils';
import {PermissionTypes, RecordPermissionsActions} from '../../../../_types/permissions';
import {AttributeTypes} from '../../../../_types/attribute';

describe('Trees', () => {
    const testTreeName = 'test_tree_node_children';
    const testLibName = 'trees_node_children_library_test';
    const treeAttributeId = 'tree_attribute';

    let recordId1;
    let recordNode1;
    let recordId2;
    let recordNode2;
    let recordId3;
    let recordNode3;
    let recordId4;
    let recordNode4;

    beforeAll(async () => {
        await gqlSaveAttribute({
            id: 'tree_attribute',
            type: AttributeTypes.TREE,
            multipleValues: false,
            label: 'Tree attribute',
            linkedTree: testTreeName,
        });

        await gqlSaveLibrary(testLibName, 'Test Lib', [treeAttributeId]);
        await gqlSaveTree(testTreeName, 'Test tree', [testLibName]);

        recordId1 = await gqlCreateRecord(testLibName);
        recordId2 = await gqlCreateRecord(testLibName);
        recordId3 = await gqlCreateRecord(testLibName);
        recordId4 = await gqlCreateRecord(testLibName);

        recordNode1 = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId1});
        recordNode2 = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId2});
        recordNode3 = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId3}, recordNode1, 1);
        recordNode4 = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId4}, recordNode1, 0);
    });

    test('Get Trees node children', async () => {
        const res = await makeGraphQlCall(`{
            rootChildren: treeNodeChildren(treeId: "${testTreeName}") {
                totalCount
                list {
                    id
                    childrenCount
                    record {id}
                }
              }
            record1Children: treeNodeChildren(treeId: "${testTreeName}", node: "${recordNode1}") {
                totalCount
                list {
                    id
                    childrenCount
                    record {id}
                }
              }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.rootChildren.totalCount).toBe(2);
        expect(res.data.data.rootChildren.list).toHaveLength(2);
        expect(res.data.data.rootChildren.list[0].childrenCount).toBe(2);
        expect(res.data.data.record1Children.totalCount).toBe(2);
        expect(res.data.data.record1Children.list).toHaveLength(2);
        expect(res.data.data.record1Children.list[0].id).toBe(recordNode4);
        expect(res.data.data.record1Children.list[1].id).toBe(recordNode3);
    });

    test('Get Trees node children with pagination', async () => {
        const res = await makeGraphQlCall(`{
            rootChildrenPage1: treeNodeChildren(treeId: "${testTreeName}", pagination: {limit: 1, offset: 0}) {
                totalCount
                list {
                    id
                    childrenCount
                    record {id}
                }
              },
            rootChildrenPage2: treeNodeChildren(treeId: "${testTreeName}", pagination: {limit: 1, offset: 1}) {
                totalCount
                list {
                    id
                    childrenCount
                    record {id}
                }
              }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.rootChildrenPage1.totalCount).toBe(2);
        expect(res.data.data.rootChildrenPage1.list).toHaveLength(1);
        expect(res.data.data.rootChildrenPage1.list[0].id).toBe(recordNode1);

        expect(res.data.data.rootChildrenPage2.totalCount).toBe(2);
        expect(res.data.data.rootChildrenPage2.list).toHaveLength(1);
        expect(res.data.data.rootChildrenPage2.list[0].id).toBe(recordNode2);
    });

    test('Get Trees node children with filters "childrenAsRecordValuePermissionFilter" filter', async () => {
        await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.RECORD},
                        applyTo: "${testLibName}",
                        usersGroup: null,
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${recordNode1}"
                        },
                        actions: [
                            {name: ${RecordPermissionsActions.CREATE_RECORD}, allowed: false}
                        ]
                    }
                ) {
                    type
                    applyTo
                    usersGroup
                    permissionTreeTarget {
                        tree
                        nodeId
                    }
                    actions {
                        allowed
                        name
                    }
                }
            }`);

        const res = await makeGraphQlCall(`{
            rootChildren: treeNodeChildren(
                treeId: "${testTreeName}",
                childrenAsRecordValuePermissionFilter: {
                    action: ${RecordPermissionsActions.CREATE_RECORD},
                    libraryId: "${testLibName}",
                    attributeId: "${treeAttributeId}"
                }
            ) {
                totalCount
                list {
                    id
                }
              }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();

        expect(res.data.data.rootChildren.totalCount).toBe(2);
        expect(res.data.data.rootChildren.list).toHaveLength(1);
        expect(res.data.data.rootChildren.list[0].id).toBe(recordNode2);
    });

    test('Get Trees node children with accessRecordByDefaultPermission', async () => {
        await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.RECORD},
                        applyTo: "${testLibName}",
                        usersGroup: null,
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${recordNode1}"
                        },
                        actions: [
                            {name: ${RecordPermissionsActions.ACCESS_RECORD_BY_DEFAULT}, allowed: false}
                        ]
                    }
                ) {
                    type
                    applyTo
                    usersGroup
                    permissionTreeTarget {
                        tree
                        nodeId
                    }
                    actions {
                        allowed
                        name
                    }
                }
            }`);

        const res = await makeGraphQlCall(`{
            rootChildren: treeNodeChildren(
                treeId: "${testTreeName}",
                accessRecordByDefaultPermission: {
                    libraryId: "${testLibName}",
                    attributeId: "${treeAttributeId}"
                }
            ) {
                totalCount
                list {
                    id
                    accessRecordByDefaultPermission
                }
              }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.errors).toBeUndefined();
        expect(res.data.data.rootChildren.totalCount).toBe(2);
        expect(res.data.data.rootChildren.list).toHaveLength(2);
        expect(res.data.data.rootChildren.list[0]).toMatchObject({
            id: recordNode1,
            accessRecordByDefaultPermission: false,
        });
        expect(res.data.data.rootChildren.list[1]).toMatchObject({
            id: recordNode2,
            accessRecordByDefaultPermission: true,
        });
    });
});
