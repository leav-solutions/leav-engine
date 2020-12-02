// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
                linked_tree: "${permTreeName}",
                label: {fr: "Test"}
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
                permissions_conf: {permissionTreeAttributes: ["${testLibAttrId}"], relation: and}
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
                            {name: access_record, allowed: true},
                            {name: edit_record, allowed: true},
                            {name: delete_record, allowed: false}
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
                    actions: [access_record]
                ){
                    name
                    allowed
                }
            }`);

            expect(resGetPerm.status).toBe(200);
            expect(resGetPerm.data.data.permissions).toEqual([{name: 'access_record', allowed: true}]);
            expect(resGetPerm.data.errors).toBeUndefined();

            // Save library's permissions config
            const resSaveLib = await makeGraphQlCall(`mutation {
                saveLibrary(library: {
                    id: "${testLibId}",
                    permissions_conf: {permissionTreeAttributes: ["${testLibAttrId}"], relation: and}
                }) {
                    permissions_conf {
                        permissionTreeAttributes {
                            id
                        }
                        relation
                    }
                }
            }`);

            expect(resSaveLib.status).toBe(200);
            expect(resSaveLib.data.data.saveLibrary.permissions_conf).toBeDefined();
            expect(resSaveLib.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`query {
                isAllowed(
                    type: record,
                    actions: [delete_record],
                    applyTo: "${testLibId}",
                    target: {recordId: "${testLibRecordId}"}
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toBeDefined();
            expect(resIsAllowed.data.data.isAllowed[0].name).toBe('delete_record');
            expect(resIsAllowed.data.data.isAllowed[0].allowed).toBe(false);
            expect(resIsAllowed.data.errors).toBeUndefined();

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
                    format: text,
                    label: {fr: "Permissions Test Attribute"},
                    permissions_conf: {permissionTreeAttributes: ["${testLibAttrId}"], relation: and}
                }) {
                    permissions_conf {
                        permissionTreeAttributes {
                            id
                        }
                        relation
                    }
                }
            }`);

            expect(resSaveAttr.status).toBe(200);
            expect(resSaveAttr.data.data.saveAttribute.permissions_conf).toBeDefined();
            expect(resSaveAttr.data.data.saveAttribute.permissions_conf.permissionTreeAttributes[0].id).toBeDefined();
            expect(resSaveAttr.data.errors).toBeUndefined();

            // Save permission on attribute
            const resSavePerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: record_attribute,
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

            const resIsAllowed = await makeGraphQlCall(`query {
                isAllowed(
                    type: record_attribute,
                    actions: [edit_value],
                    applyTo: "${testLibId}",
                    target: {recordId: "${testLibRecordId}", attributeId: "${testPermAttrId}"}
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toBeDefined();
            expect(resIsAllowed.data.data.isAllowed[0].name).toBe('edit_value');
            expect(resIsAllowed.data.data.isAllowed[0].allowed).toBe(false);
            expect(resIsAllowed.data.errors).toBeUndefined();

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
                        type: app,
                        usersGroup: "${allUsersTreeElemId}",
                        actions: [
                            {name: app_create_library, allowed: true},
                            {name: app_edit_library, allowed: true},
                            {name: app_delete_library, allowed: true},
                            {name: app_create_attribute, allowed: true},
                            {name: app_edit_attribute, allowed: true},
                            {name: app_delete_attribute, allowed: true},
                            {name: app_create_tree, allowed: true},
                            {name: app_edit_tree, allowed: true},
                            {name: app_delete_tree, allowed: true},
                            {name: app_edit_permission allowed: true}
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
                    type: app,
                    usersGroup: "${allUsersTreeElemId}",
                    actions: [app_create_library]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetAdminPerm.status).toBe(200);
            expect(resGetAdminPerm.data.data.permissions).toEqual([{name: 'app_create_library', allowed: true}]);
            expect(resGetAdminPerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`query {
                isAllowed(
                    type: app,
                    actions: [app_create_library]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toBeDefined();
            expect(resIsAllowed.data.data.isAllowed[0].name).toBe('app_create_library');
            expect(resIsAllowed.data.data.isAllowed[0].allowed).toBe(true);
            expect(resIsAllowed.data.errors).toBeUndefined();
        });
    });

    describe('LibraryPermissions', () => {
        test('Save and get library permissions', async () => {
            // Save admin permissions
            const resSaveLibPerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: library,
                        applyTo: "${testLibId}",
                        usersGroup: "${allUsersTreeElemId}",
                        actions: [
                            {name: access_record, allowed: true},
                            {name: edit_record, allowed: true},
                            {name: create_record, allowed: true},
                            {name: delete_record, allowed: true},
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

            expect(resSaveLibPerm.status).toBe(200);
            expect(resSaveLibPerm.data.data.savePermission.type).toBeDefined();
            expect(resSaveLibPerm.data.errors).toBeUndefined();

            // Get admin permissions
            const resGetLibPerm = await makeGraphQlCall(`{
                permissions(
                    type: library,
                    applyTo: "${testLibId}",
                    usersGroup: "${allUsersTreeElemId}",
                    actions: [access_record]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetLibPerm.status).toBe(200);
            expect(resGetLibPerm.data.data.permissions).toEqual([{name: 'access_record', allowed: true}]);
            expect(resGetLibPerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`query {
                isAllowed(
                    type: library,
                    actions: [access_record],
                    applyTo: "${testLibId}"
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toBeDefined();
            expect(resIsAllowed.data.data.isAllowed[0].name).toBe('access_record');
            expect(resIsAllowed.data.data.isAllowed[0].allowed).toBe(true);
            expect(resIsAllowed.data.errors).toBeUndefined();
        });
    });

    describe('Herited Permissions', () => {
        const heritTestLibName = 'test_lib_herit_perm';
        const heritTestTreeName = 'test_tree_herit_perm';
        const heritTestTreeElemLibName = 'test_lib_herit_perm_tree_element';
        let userGroupId1;
        let userGroupId2;
        let userGroupId3;
        let userGroupId4;
        let userGroupId5;
        let userGroupId6;
        let treeElemId1;

        let treeElemId2;
        beforeAll(async () => {
            // Create new test libs
            await makeGraphQlCall(`mutation {
                l1: saveLibrary(library: {id: "${heritTestLibName}", label: {fr: "Test lib"}}) { id },
                l2: saveLibrary(library: {id: "${heritTestTreeElemLibName}", label: {fr: "Test lib"}}) { id }
            }`);

            // Create test tree
            await makeGraphQlCall(`mutation {
                saveTree(
                    tree: {
                        id: "${heritTestTreeName}",
                        label: {fr: "Permissions Test tree"},
                        libraries: ["${heritTestTreeElemLibName}"]
                    }
                ) {
                    id
                }
            }`);

            // Create 2 users groups
            const resCreateGroups = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "users_groups") {id},
                r2: createRecord(library: "users_groups") {id},
                r3: createRecord(library: "users_groups") {id},
                r4: createRecord(library: "users_groups") {id},
                r5: createRecord(library: "users_groups") {id},
                r6: createRecord(library: "users_groups") {id}
            }`);
            userGroupId1 = resCreateGroups.data.data.r1.id;
            userGroupId2 = resCreateGroups.data.data.r2.id;
            userGroupId3 = resCreateGroups.data.data.r3.id;
            userGroupId4 = resCreateGroups.data.data.r4.id;
            userGroupId5 = resCreateGroups.data.data.r5.id;
            userGroupId6 = resCreateGroups.data.data.r6.id;

            // Add users groups to tree
            await makeGraphQlCall(`mutation {
                el1: treeAddElement(treeId: "users_groups", element: {id: "${userGroupId1}", library: "users_groups"}) {
                    id
                },
                el2: treeAddElement(treeId: "users_groups", element: {id: "${userGroupId3}", library: "users_groups"}) {
                    id
                },
                el3: treeAddElement(treeId: "users_groups", element: {id: "${userGroupId5}", library: "users_groups"}) {
                    id
                }
            }`);

            await makeGraphQlCall(`mutation {
                el1: treeAddElement(
                    treeId: "users_groups",
                    element: {id: "${userGroupId2}", library: "users_groups"},
                    parent: {id: "${userGroupId1}", library: "users_groups"}
                ) { id },
                el2: treeAddElement(
                    treeId: "users_groups",
                    element: {id: "${userGroupId4}", library: "users_groups"},
                    parent: {id: "${userGroupId3}", library: "users_groups"}
                ) { id },
                el3: treeAddElement(
                    treeId: "users_groups",
                    element: {id: "${userGroupId6}", library: "users_groups"},
                    parent: {id: "${userGroupId5}", library: "users_groups"}
                ) { id }
            }`);

            // Create records for tree
            const resCreateTreeRecords = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "${heritTestTreeElemLibName}") {id},
                r2: createRecord(library: "${heritTestTreeElemLibName}") {id}
            }`);
            treeElemId1 = resCreateTreeRecords.data.data.r1.id;
            treeElemId2 = resCreateTreeRecords.data.data.r2.id;

            // Add records to tree
            const r = await makeGraphQlCall(`mutation {
                treeAddElement(
                    treeId: "${heritTestTreeName}",
                    element: {id: "${treeElemId1}", library: "${heritTestTreeElemLibName}"}
                ) { id }
            }`);

            const r2 = await makeGraphQlCall(`mutation {
                treeAddElement(
                    treeId: "${heritTestTreeName}",
                    element: {id: "${treeElemId2}", library: "${heritTestTreeElemLibName}"},
                    parent: {id: "${treeElemId1}", library: "${heritTestTreeElemLibName}"}
                ) { id }
            }`);
        });

        describe('Record permissions', () => {
            test('Retrieve herited permissions for record permissions: herit from user group', async () => {
                // Save perm
                await makeGraphQlCall(`mutation {
                    savePermission(
                        permission: {
                            type: record,
                            applyTo: "${heritTestLibName}",
                            usersGroup: "${userGroupId1}",
                            permissionTreeTarget: {
                                tree: "${heritTestTreeName}",
                                library: "${heritTestTreeElemLibName}",
                                id: "${treeElemId2}"
                            },
                            actions: [
                                {name: access_record, allowed: false},
                            ]
                        }
                    ) { type }
                }`);

                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: heritedPermissions(
                        type: record,
                        applyTo: "${heritTestLibName}",
                        actions: [access_record],
                        userGroupId: "${userGroupId2}",
                        permissionTreeTarget: {
                            tree: "${heritTestTreeName}",
                            library: "${heritTestTreeElemLibName}",
                            id: "${treeElemId2}"
                        }
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('access_record');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
            });

            test('Retrieve herited permissions for record permissions: herit from perm tree', async () => {
                // Save perm
                await makeGraphQlCall(`mutation {
                    savePermission(
                        permission: {
                            type: record,
                            applyTo: "${heritTestLibName}",
                            usersGroup: "${userGroupId4}",
                            permissionTreeTarget: {
                                tree: "${heritTestTreeName}",
                                library: "${heritTestTreeElemLibName}",
                                id: "${treeElemId1}"
                            },
                            actions: [
                                {name: access_record, allowed: false},
                            ]
                        }
                    ) { type }
                }`);

                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: heritedPermissions(
                        type: record,
                        applyTo: "${heritTestLibName}",
                        actions: [access_record],
                        userGroupId: "${userGroupId4}",
                        permissionTreeTarget: {
                            tree: "${heritTestTreeName}",
                            library: "${heritTestTreeElemLibName}",
                            id: "${treeElemId2}"
                        }
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('access_record');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
            });

            test('Retrieve herited permissions for record permissions: herit from default permissions', async () => {
                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: heritedPermissions(
                        type: record,
                        applyTo: "${heritTestLibName}",
                        actions: [access_record],
                        userGroupId: "${userGroupId6}",
                        permissionTreeTarget: {
                            tree: "${heritTestTreeName}",
                            library: "${heritTestTreeElemLibName}",
                            id: "${treeElemId2}"
                        }
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('access_record');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(true);
            });
        });

        describe('Library permissions', () => {
            test('Retrieve herited permissions from group', async () => {
                // Save perm
                await makeGraphQlCall(`mutation {
                    savePermission(
                        permission: {
                            type: library,
                            applyTo: "${heritTestLibName}",
                            usersGroup: "${userGroupId1}",
                            actions: [
                                {name: access_record, allowed: false},
                            ]
                        }
                    ) { type }
                }`);

                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: heritedPermissions(
                        type: library,
                        applyTo: "${heritTestLibName}",
                        actions: [access_record],
                        userGroupId: "${userGroupId2}",
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('access_record');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
            });

            test('Retrieve herited permissions from default permission', async () => {
                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: heritedPermissions(
                        type: library,
                        applyTo: "${heritTestLibName}",
                        actions: [access_record],
                        userGroupId: "${userGroupId4}",
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('access_record');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(true);
            });
        });

        describe('Admin permissions', () => {
            test('Retrieve herited permissions from group', async () => {
                // Save perm
                await makeGraphQlCall(`mutation {
                    savePermission(
                        permission: {
                            type: app,
                            usersGroup: "${userGroupId1}",
                            actions: [
                                {name: app_create_attribute, allowed: false},
                            ]
                        }
                    ) { type }
                }`);

                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: heritedPermissions(
                        type: app,
                        actions: [app_create_attribute],
                        userGroupId: "${userGroupId2}",
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('app_create_attribute');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
            });

            test('Retrieve herited permissions from default permission', async () => {
                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: heritedPermissions(
                        type: app,
                        actions: [app_create_attribute],
                        userGroupId: "${userGroupId4}",
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('app_create_attribute');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(true);
            });
        });
    });

    describe('Root level permissions', () => {
        let userGroupId;

        beforeAll(async () => {
            // Create 2 users groups
            const resCreateGroups = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "users_groups") {id}
            }`);
            userGroupId = resCreateGroups.data.data.r1.id;

            // Add users groups to tree
            await makeGraphQlCall(`mutation {
                el1: treeAddElement(
                    treeId: "users_groups",
                    element: {
                        id: "${userGroupId}",
                        library: "users_groups"
                    }
                ) {
                    id
                }
            }`);
        });

        test('Save/get permission on users groups root level', async () => {
            // Save perm
            const resSavePerm = await makeGraphQlCall(`mutation {
                perm: savePermission(
                    permission: {
                        type: library,
                        applyTo: "${testLibId}",
                        usersGroup: null,
                        actions: [
                            {name: access_record, allowed: false},
                        ]
                    }
                ) { type usersGroup }
            }`);

            expect(resSavePerm.status).toBe(200);
            expect(resSavePerm.data.errors).toBeUndefined();
            expect(resSavePerm.data.data.perm.usersGroup).toBe(null);

            // Retrieve permission
            const resGetPerm = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: library,
                    applyTo: "${testLibId}",
                    actions: [access_record],
                    userGroupId: "${userGroupId}",
                ) { name allowed }
              }
            `);
            expect(resGetPerm.status).toBe(200);
            expect(resGetPerm.data.errors).toBeUndefined();
            expect(resGetPerm.data.data.p[0].name).toBe('access_record');
            expect(resGetPerm.data.data.p[0].allowed).toBe(false);
        });

        test('Save/get permission on any tree root level', async () => {
            // Save perm
            const resSavePerm = await makeGraphQlCall(`mutation {
                perm: savePermission(
                    permission: {
                        type: record,
                        applyTo: "${testLibId}",
                        usersGroup: "${userGroupId}",
                        actions: [
                            {name: access_record, allowed: false},
                        ],
                        permissionTreeTarget: {
                            tree: "${permTreeName}",
                            id: null,
                            library: null
                        }
                    }
                ) { type usersGroup permissionTreeTarget {tree id library}}
            }`);

            expect(resSavePerm.status).toBe(200);
            expect(resSavePerm.data.errors).toBeUndefined();
            expect(resSavePerm.data.data.perm.permissionTreeTarget.tree).toBe(permTreeName);
            expect(resSavePerm.data.data.perm.permissionTreeTarget.id).toBe(null);

            // Retrieve permission
            const resGetPerm = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: record,
                    applyTo: "${testLibId}",
                    actions: [access_record],
                    userGroupId: "${userGroupId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        id: "${permTreeElemId}",
                        library: "${permTreeLibName}"
                    }
                ) { name allowed }
              }
            `);
            expect(resGetPerm.status).toBe(200);
            expect(resGetPerm.data.errors).toBeUndefined();
            expect(resGetPerm.data.data.p[0].name).toBe('access_record');
            expect(resGetPerm.data.data.p[0].allowed).toBe(false);
        });
    });
});
