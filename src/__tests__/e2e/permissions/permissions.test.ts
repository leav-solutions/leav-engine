import {makeGraphQlCall} from '../e2eUtils';

describe('Permissions', () => {
    const permTreeName = 'perm_tree';
    const permTreeLibName = 'perm_tree_lib';
    const permLibName = 'perm_test_lib';
    const userGroupAttrId = 'user_groups';
    const testLibId = 'test_lib_permission';
    const testLibAttrId = 'test_attr_permission';
    const testPermAttrId = 'attr_perm_test';

    let permTreeElemId;
    let allUsersTreeElemId;
    let testLibRecordId;

    beforeAll(async () => {
        // Create library to use in permissions tree
        await makeGraphQlCall(`mutation {
            saveLibrary(library: {id: "${permTreeLibName}", label: {fr: "Test lib"}}) { id }
        }`);

        // Create permissions tree
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
        await makeGraphQlCall(`mutation {
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

        // Create tree attribute linking to perm tree
        // Link this attribute to library
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
                attributes: [
                    "id",
                    "modified_by",
                    "modified_at",
                    "created_by",
                    "created_at",
                    "${testLibAttrId}"
                ],
                permissionsConf: {permissionTreeAttributes: ["${testLibAttrId}"], relation: and}
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
                value: "${permTreeLibName}/${permTreeElemId}"
            }) {
                id_value
                value
            }
        }`);
    });

    describe('Records permissions', () => {
        test('Save and apply permissions', async () => {
            // Save Permission
            const resSavePerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: record,
                        applyTo: "${testLibId}",
                        usersGroup: "${allUsersTreeElemId}",
                        permissionTreeTarget: {
                            tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"
                        },
                        actions: [
                            {name: access, allowed: true}, {name: edit, allowed: true}, {name: delete, allowed: false}
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

            expect(resSavePerm.status).toBe(200);
            expect(resSavePerm.data.data.savePermission.type).toBeDefined();
            expect(resSavePerm.data.errors).toBeUndefined();

            const resGetPerm = await makeGraphQlCall(`{
                permissions(
                    type: record,
                    applyTo: "${testLibId}",
                    usersGroup: "${allUsersTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"
                    },
                    actions: [access]
                ){
                    name
                    allowed
                }
            }`);

            expect(resGetPerm.status).toBe(200);
            expect(resGetPerm.data.data.permissions).toEqual([{name: 'access', allowed: true}]);
            expect(resGetPerm.data.errors).toBeUndefined();

            // Save library's permissions config
            const resSaveLib = await makeGraphQlCall(`mutation {
                saveLibrary(library: {
                    id: "${testLibId}",
                    permissionsConf: {permissionTreeAttributes: ["${testLibAttrId}"], relation: and}
                }) {
                    permissionsConf {
                        permissionTreeAttributes {
                            id
                        }
                        relation
                    }
                }
            }`);

            expect(resSaveLib.status).toBe(200);
            expect(resSaveLib.data.data.saveLibrary.permissionsConf).toBeDefined();
            expect(resSaveLib.data.errors).toBeUndefined();

            const resDelRecord = await makeGraphQlCall(`mutation {
                deleteRecord(library: "${testLibId}", id: "${testLibRecordId}") {
                    id
                }
            }`);

            expect(resDelRecord.status).toBe(200);
            expect(resDelRecord.data.data).toBe(null);
            expect(resDelRecord.data.errors).toBeDefined();
            expect(resDelRecord.data.errors.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('AttributesPermissions', () => {
        test('Save and apply permissions', async () => {
            // Create attribute with permissions conf
            const resSaveAttr = await makeGraphQlCall(`mutation {
                saveAttribute(attribute: {
                    id: "${testPermAttrId}",
                    type: simple,
                    label: {fr: "Permissions Test Attribute"},
                    permissionsConf: {permissionTreeAttributes: ["${testLibAttrId}"], relation: and}
                }) {
                    permissionsConf {
                        permissionTreeAttributes {
                            id
                        }
                        relation
                    }
                }
            }`);

            expect(resSaveAttr.status).toBe(200);
            expect(resSaveAttr.data.data.saveAttribute.permissionsConf).toBeDefined();
            expect(resSaveAttr.data.data.saveAttribute.permissionsConf.permissionTreeAttributes[0].id).toBeDefined();
            expect(resSaveAttr.data.errors).toBeUndefined();

            // Save permission on attribute
            const resSavePerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: attribute,
                        applyTo: "${testPermAttrId}",
                        usersGroup: "${allUsersTreeElemId}",
                        permissionTreeTarget: {
                            tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"
                        },
                        actions: [
                            {name: access_attribute, allowed: true},
                            {name: create_value, allowed: false},
                            {name: edit_value, allowed: false},
                            {name: delete_value, allowed: false}
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

            expect(resSavePerm.status).toBe(200);
            expect(resSavePerm.data.data.savePermission.type).toBeDefined();
            expect(resSavePerm.data.errors).toBeUndefined();

            // Link attribute to library
            await makeGraphQlCall(`mutation {
                saveLibrary(library: {
                    id: "${permTreeLibName}",
                    attributes: [
                        "id",
                        "modified_by",
                        "modified_at",
                        "created_by",
                        "created_at",
                        "${testLibAttrId}",
                        "${testPermAttrId}"
                    ]
                }) {
                    id
                }
            }`);

            // Apply permission
            const res = await makeGraphQlCall(`mutation {
                saveValue(
                    library: "${testLibId}",
                    recordId: "${testLibRecordId}",
                    attribute: "${testPermAttrId}",
                    value: {value: "TEST VAL"}
                ) {
                    id_value
                }
            }`);

            expect(res.status).toBe(200);
            expect(res.data.data).toBe(null);
            expect(res.data.errors).toBeDefined();
            expect(res.data.errors.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('AdminPermissions', () => {
        test('Save and get admin permissions', async () => {
            // Save admin permissions
            const resSaveAdminPerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: admin,
                        usersGroup: "${allUsersTreeElemId}",
                        actions: [
                            {name: create_library, allowed: true},
                            {name: edit_library, allowed: true},
                            {name: delete_library, allowed: true},
                            {name: create_attribute, allowed: true},
                            {name: edit_attribute, allowed: true},
                            {name: delete_attribute, allowed: true},
                            {name: create_tree, allowed: true},
                            {name: edit_tree, allowed: true},
                            {name: delete_tree, allowed: true},
                            {name: edit_permission allowed: true}
                        ]
                    }
                ) {
                    type
                    usersGroup
                    actions {
                        name
                        allowed
                    }
                }
            }`);

            expect(resSaveAdminPerm.status).toBe(200);
            expect(resSaveAdminPerm.data.data.savePermission.type).toBeDefined();
            expect(resSaveAdminPerm.data.errors).toBeUndefined();

            // Get admin permissions
            const resGetAdminPerm = await makeGraphQlCall(`{
                permissions(
                    type: admin,
                    usersGroup: "${allUsersTreeElemId}",
                    actions: [create_library]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetAdminPerm.status).toBe(200);
            expect(resGetAdminPerm.data.data.permissions).toEqual([{name: 'create_library', allowed: true}]);
            expect(resGetAdminPerm.data.errors).toBeUndefined();
        });
    });
});
