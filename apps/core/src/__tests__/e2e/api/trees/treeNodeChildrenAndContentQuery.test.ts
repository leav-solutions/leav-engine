import {
    adminUserSdk,
    e2eGuestUser,
    e2eNonAdminGroupId,
    e2eNonAdminUser,
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
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

        await adminUserSdk.SaveLibrary({
            library: {id: testLibName, label: {en: 'Test Lib'}, attributes: [treeAttributeId]},
        });
        await gqlSaveTree(testTreeName, 'Test tree', [testLibName]);

        recordId1 = await gqlCreateRecord(testLibName);
        recordId2 = await gqlCreateRecord(testLibName);
        recordId3 = await gqlCreateRecord(testLibName);
        recordId4 = await gqlCreateRecord(testLibName);

        recordNode1 = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId1});
        recordNode2 = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId2});
        recordNode3 = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId3}, recordNode1, 1);
        recordNode4 = await gqlAddElemToTree(testTreeName, {library: testLibName, id: recordId4}, recordNode1, 0);

        await makeGraphQlCall(
            `mutation {
                    savePermission(
                        permission: {
                            type: tree,
                            applyTo: "${testTreeName}",
                            usersGroup: "${e2eNonAdminGroupId()}",
                            actions: [
                                {name: access_tree, allowed: true},
                                {name: edit_children, allowed: true},
                                {name: detach, allowed: true},
                            ]
                        }
                    ) { type }
                }`,
        );
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

    test('Should not have the permission to get tree node children', async () => {
        await makeGraphQlCall(
            `mutation {
                    savePermission(
                        permission: {
                            type: tree,
                            applyTo: "${testTreeName}",
                            usersGroup: null,
                            actions: [
                                {name: access_tree, allowed: false},
                            ]
                        }
                    ) { type }
                }`,
        );

        await expect(
            makeGraphQlCall(
                `
                {
                    treeNodeChildren(treeId: "${testTreeName}") {
                        totalCount
                        list {
                            id
                        }
                    }
                }
            `,
                {user: e2eGuestUser()},
            ),
        ).rejects.toThrow(/Action forbidden/);
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

    describe('Trees node children and content queries with permissions filters', () => {
        beforeEach(async () => {
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.RECORD},
                        applyTo: "${testLibName}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${recordNode1}"
                        },
                        actions: [
                            {name: ${RecordPermissionsActions.CREATE_RECORD}, allowed: true}
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
        });

        test('Get Trees node children with filters "childrenAsRecordValuePermissionFilter" filter', async () => {
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.RECORD},
                        applyTo: "${testLibName}",
                        usersGroup: "${e2eNonAdminGroupId()}",
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

            const res = await makeGraphQlCall(
                `{
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
        }`,
                {
                    user: e2eNonAdminUser(),
                },
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();

            expect(res.data.data.rootChildren.totalCount).toBe(2);
            expect(res.data.data.rootChildren.list).toHaveLength(1);
            expect(res.data.data.rootChildren.list[0].id).toBe(recordNode2);
        });

        test('Get Tree content with filters "childrenAsRecordValuePermissionFilter" filter', async () => {
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.RECORD},
                        applyTo: "${testLibName}",
                        usersGroup: "${e2eNonAdminGroupId()}",
                        permissionTreeTarget: {
                            tree: "${testTreeName}", nodeId: "${recordNode3}"
                        },
                        actions: [
                            {name: ${RecordPermissionsActions.CREATE_RECORD}, allowed: false}
                        ]
                    }
                ) {
                    type
                }
            }`);

            const res = await makeGraphQlCall(
                `{
            content: treeContent(
                treeId: "${testTreeName}",
                childrenAsRecordValuePermissionFilter: {
                    action: ${RecordPermissionsActions.CREATE_RECORD},
                    libraryId: "${testLibName}",
                    attributeId: "${treeAttributeId}"
                }
            ) {
                id
                children {
                    id
                }
              }
        }`,
                {
                    user: e2eNonAdminUser(),
                },
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.content).toHaveLength(2);
            expect(res.data.data.content[0].id).toBe(recordNode1);
            expect(res.data.data.content[1].id).toBe(recordNode2);

            expect(res.data.data.content[0].children).toHaveLength(1);
            expect(res.data.data.content[0].children[0]).toMatchObject({
                id: recordNode4,
            });
        });

        test('Get Trees node children with accessRecordByDefaultPermission', async () => {
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.RECORD},
                        applyTo: "${testLibName}",
                        usersGroup: "${e2eNonAdminGroupId()}",
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

            const res = await makeGraphQlCall(
                `{
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
        }`,
                {
                    user: e2eNonAdminUser(),
                },
            );

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

        test('Get tree content with accessRecordByDefaultPermission', async () => {
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: ${PermissionTypes.RECORD},
                        applyTo: "${testLibName}",
                        usersGroup: "${e2eNonAdminGroupId()}",
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

            const res = await makeGraphQlCall(
                `{
            content: treeContent(
                treeId: "${testTreeName}",
                accessRecordByDefaultPermission: {
                    libraryId: "${testLibName}",
                    attributeId: "${treeAttributeId}"
                }
            ) {
                id
                accessRecordByDefaultPermission
                children {
                    id
                    accessRecordByDefaultPermission
                }
              }
        }`,
                {
                    user: e2eNonAdminUser(),
                },
            );

            expect(res.status).toBe(200);
            expect(res.data.errors).toBeUndefined();
            expect(res.data.data.content).toHaveLength(2);

            expect(res.data.data.content[0]).toMatchObject({
                id: recordNode1,
                accessRecordByDefaultPermission: false,
            });
            expect(res.data.data.content[1]).toMatchObject({
                id: recordNode2,
                accessRecordByDefaultPermission: true,
            });

            expect(res.data.data.content[0].children).toHaveLength(2);
            expect(res.data.data.content[0].children[0]).toMatchObject({
                id: recordNode4,
                accessRecordByDefaultPermission: false,
            });
            expect(res.data.data.content[0].children[1]).toMatchObject({
                id: recordNode3,
                accessRecordByDefaultPermission: false,
            });
        });
    });
});
