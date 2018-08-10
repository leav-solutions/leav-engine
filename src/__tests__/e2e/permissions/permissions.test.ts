import {makeGraphQlCall} from '../e2eUtils';
import {responsePathAsArray} from 'graphql';

describe('Permissions', () => {
    const permTreeName = 'perm_tree';
    const permTreeLibName = 'perm_tree_lib';
    const permLibName = 'perm_test_lib';
    const userGroupAttrId = 'user_groups';
    const testLibId = 'test_lib_permission';
    const testLibAttrId = 'test_attr_permission';

    let permTreeElemId;
    let allUsersTreeElemId;
    let testLibRecordId;

    beforeAll(async () => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${permTreeLibName}", label: {fr: "Test lib"}}) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveTree(
                tree: {id: "${permTreeName}", label: {fr: "Permissions Test tree"}, libraries: ["${permTreeLibName}"]}
            ) {
                id
            }
        }`);

        // Create an element to insert in permissions tree
        const res = await makeGraphQlCall(`mutation {
            createRecord(library: "${permTreeLibName}") {
                id
            }
        }`);
        permTreeElemId = res.data.data.createRecord.id;

        // Add element to permission tree
        const resAddTree = await makeGraphQlCall(`mutation {
            treeAddElement(
                treeId: "${permTreeName}",
                element: {id: "${permTreeElemId}", library: "${permTreeLibName}"}
            ) {
                id
            }
        }`);

        // Retrieve "all users" element ID in users group tree
        const usersGroupsTreeContent = await makeGraphQlCall(`{
            treeContent(treeId: "users_groups") {
                record {
                    id
                }
            }
        }`);
        allUsersTreeElemId = usersGroupsTreeContent.data.data.treeContent[0].record.id;

        // Add user to group
        await makeGraphQlCall(`mutation {
            saveValue(library: "users", recordId: "1", attribute: "${userGroupAttrId}", value: {
                value: "users_groups/${allUsersTreeElemId}"
            }) {
                id_value
                value
            }
        }`);

        // Create a library using this perm tree
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${testLibId}", label: {fr: "Test lib"}}) { id }
        }`);

        await makeGraphQlCall(`mutation {
            saveAttribute(attribute: {
                id: "${testLibAttrId}",
                type: tree,
                linked_tree: "${permTreeName}"
            }) {
                id
            },
            saveLibrary(library: {
                id: "${testLibId}",
                attributes: ["${testLibAttrId}"],
                permissionsConf: {permissionTreeAttributes: ["${testLibAttrId}"], relation: AND}
            }) {
                id
            }
        }`);

        // Create a record on this library
        const resCreaRecordTestLib = await makeGraphQlCall(`mutation {
            createRecord(library: "${testLibId}") {
                id
            }
        }`);
        testLibRecordId = resCreaRecordTestLib.data.data.createRecord.id;

        // Link this record to perm tree
        await makeGraphQlCall(`mutation {
            saveValue(library: "${testLibId}", recordId: "${testLibRecordId}", attribute: "${testLibAttrId}", value: {
                value: "${permLibName}/${permTreeElemId}"
            }) {
                id_value
                value
            }
        }`);
    });

    test('Save library permissions config', async () => {
        const res = await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${permLibName}",
                label: {fr: "Permissions Test lib"},
                permissionsConf: {permissionTreeAttributes: ["${permTreeName}"], relation: AND}
            }) {
                permissionsConf {
                    permissionTreeAttributes
                    relation
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.saveLibrary.permissionsConf).toBeDefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Save a permission', async () => {
        const res = await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                    type: RECORD,
                    applyTo: "${testLibId}",
                    usersGroup: "${allUsersTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"
                    },
                    actions: [
                        {name: ACCESS, allowed: true}, {name: EDIT, allowed: true}, {name: DELETE, allowed: false}
                    ]
                }
            ) {
                type
                applyTo
                usersGroup
                permissionTreeTarget {
                    tree
                    library
                    id
                }
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.savePermission.type).toBeDefined();
        expect(res.data.errors).toBeUndefined();
    });

    test('Get a permission', async () => {
        const res = await makeGraphQlCall(`{
            permission(
                type: RECORD,
                applyTo: "${testLibId}",
                usersGroup: "${allUsersTreeElemId}",
                permissionTreeTarget: {tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"},
                action: ACCESS
            )
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.permission).toBe(true);
        expect(res.data.errors).toBeUndefined();
    });

    test('Apply permission', async () => {
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibId}",
                permissionsConf: {permissionTreeAttributes: ["${permTreeName}"], relation: AND}
            }) {
                permissionsConf {
                    permissionTreeAttributes
                    relation
                }
            }
        }`);

        const res = await makeGraphQlCall(`mutation {
            deleteRecord(library: "${testLibId}", id: "${testLibRecordId}") {
                id
            }
        }`);

        expect(res.status).toBe(200);
        expect(res.data.data.deleteRecord).toBe(null);
        expect(res.data.errors).toBeDefined();
        expect(res.data.errors.length).toBeGreaterThanOrEqual(1);
    });
});
