// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeTypes} from '../../../../_types/attribute';
import {
    gqlAddElemToTree,
    gqlAddUserToGroup,
    gqlCreateRecord,
    gqlGetAllUsersGroupNodeId,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    makeGraphQlCall
} from '../e2eUtils';

describe('Permissions', () => {
    const permTreeName = 'perm_tree';
    const permTreeLibName = 'perm_tree_lib';
    const testLibId = 'test_lib_permission';
    const testLibAttrId = 'test_attr_permission';
    const testPermAttrId = 'attr_perm_test';

    let permTreeElemId: string;
    let nodePermTreeElem: string;
    let allUsersTreeElemNodeId: string;
    let testLibRecordId: string;

    beforeAll(async () => {
        // Create library to use in permissions tree
        await gqlSaveLibrary(permTreeLibName, 'Test lib on permissions tree');

        // Create permissions tree
        await gqlSaveTree(permTreeName, 'Test', [permTreeLibName]);

        // Create an element to insert in permissions tree
        permTreeElemId = await gqlCreateRecord(permTreeLibName);
        nodePermTreeElem = await gqlAddElemToTree(permTreeName, {id: permTreeElemId, library: permTreeLibName});

        allUsersTreeElemNodeId = await gqlGetAllUsersGroupNodeId();
        await gqlAddUserToGroup(allUsersTreeElemNodeId);

        // Create a library using this perm tree
        await gqlSaveAttribute({
            id: testLibAttrId,
            label: 'Test Attr tree record permissions',
            type: AttributeTypes.TREE,
            linkedTree: permTreeName
        });

        await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibId}",
                attributes: [
                    "${testLibAttrId}"
                ],
                permissions_conf: {permissionTreeAttributes: ["${testLibAttrId}"], relation: and}
            }) {
                id
            }
        }`);
        await makeGraphQlCall('mutation { refreshSchema }');

        // Create a record on this library
        testLibRecordId = await gqlCreateRecord(testLibId);

        // Link this record to perm tree
        await makeGraphQlCall(`mutation {
            saveValue(
                library: "${testLibId}",
                recordId: "${testLibRecordId}",
                attribute: "${testLibAttrId}",
                value: {value: "${nodePermTreeElem}"}
            ) {
                id_value
            }
        }`);
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
                        usersGroup: "${allUsersTreeElemNodeId}",
                        permissionTreeTarget: {
                            tree: "${permTreeName}", nodeId: "${nodePermTreeElem}"
                        },
                        actions: [
                            {name: access_attribute, allowed: true},
                            {name: edit_value, allowed: false},
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
                }
            }`);

            expect(resSavePerm.status).toBe(200);
            expect(resSavePerm.data.data.savePermission.type).toBeDefined();
            expect(resSavePerm.data.errors).toBeUndefined();

            // Link attribute to library
            await gqlSaveLibrary(permTreeLibName, 'Test Lib', [testLibAttrId, testPermAttrId]);

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

            // Call isAllowed a second time to check result from cache.
            const resIsAllowedCached = await makeGraphQlCall(`query {
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

            expect(resIsAllowedCached.status).toBe(200);
            expect(resIsAllowedCached.data.data.isAllowed).toBeDefined();
            expect(resIsAllowedCached.data.data.isAllowed[0].name).toBe('edit_value');
            expect(resIsAllowedCached.data.data.isAllowed[0].allowed).toBe(false);
            expect(resIsAllowedCached.data.errors).toBeUndefined();

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
                        usersGroup: "${allUsersTreeElemNodeId}",
                        actions: [
                            {name: admin_create_library, allowed: true},
                            {name: admin_edit_library, allowed: true},
                            {name: admin_delete_library, allowed: true},
                            {name: admin_create_attribute, allowed: true},
                            {name: admin_edit_attribute, allowed: true},
                            {name: admin_delete_attribute, allowed: true},
                            {name: admin_create_tree, allowed: true},
                            {name: admin_edit_tree, allowed: true},
                            {name: admin_delete_tree, allowed: true},
                            {name: admin_edit_permission allowed: true}
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
                    usersGroup: "${allUsersTreeElemNodeId}",
                    actions: [admin_create_library]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetAdminPerm.status).toBe(200);
            expect(resGetAdminPerm.data.data.permissions).toEqual([{name: 'admin_create_library', allowed: true}]);
            expect(resGetAdminPerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`query {
                isAllowed(
                    type: admin,
                    actions: [admin_create_library]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toBeDefined();
            expect(resIsAllowed.data.data.isAllowed[0].name).toBe('admin_create_library');
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
                        usersGroup: "${allUsersTreeElemNodeId}",
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
                    usersGroup: "${allUsersTreeElemNodeId}",
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

    describe('Inherited Permissions', () => {
        const inheritTestLibName = 'test_lib_inherit_perm';
        const inheritTestTreeName = 'test_tree_inherit_perm';
        const inheritTestTreeElemLibName = 'test_lib_inherit_perm_tree_element';
        let userGroupId1: string;
        let nodeUserGroupId1: string;
        let userGroupId2: string;
        let nodeUserGroupId2: string;
        let userGroupId3: string;
        let nodeUserGroupId3: string;
        let userGroupId4: string;
        let nodeUserGroupId4: string;
        let userGroupId5: string;
        let nodeUserGroupId5: string;
        let userGroupId6: string;
        let nodeUserGroupId6: string;
        let treeElemId1: string;
        let nodeTreeElem1: string;
        let treeElemId2: string;
        let nodeTreeElem2: string;

        beforeAll(async () => {
            // Create new test libs
            await makeGraphQlCall(`mutation {
                l1: saveLibrary(library: {id: "${inheritTestLibName}", label: {fr: "Test lib"}}) { id },
                l2: saveLibrary(library: {id: "${inheritTestTreeElemLibName}", label: {fr: "Test lib"}}) { id }
            }`);

            // Create test tree
            await gqlSaveTree(inheritTestTreeName, 'Permissions Test tree', [inheritTestTreeElemLibName]);

            // Create 2 users groups
            const resCreateGroups = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "users_groups") {record { id }},
                r2: createRecord(library: "users_groups") {record { id }},
                r3: createRecord(library: "users_groups") {record { id }},
                r4: createRecord(library: "users_groups") {record { id }},
                r5: createRecord(library: "users_groups") {record { id }},
                r6: createRecord(library: "users_groups") {record { id }}
            }`);
            userGroupId1 = resCreateGroups.data.data.r1.record.id;
            userGroupId2 = resCreateGroups.data.data.r2.record.id;
            userGroupId3 = resCreateGroups.data.data.r3.record.id;
            userGroupId4 = resCreateGroups.data.data.r4.record.id;
            userGroupId5 = resCreateGroups.data.data.r5.record.id;
            userGroupId6 = resCreateGroups.data.data.r6.record.id;

            // Add users groups to tree
            nodeUserGroupId1 = await gqlAddElemToTree('users_groups', {library: 'users_groups', id: userGroupId1});
            nodeUserGroupId2 = await gqlAddElemToTree(
                'users_groups',
                {library: 'users_groups', id: userGroupId2},
                nodeUserGroupId1
            );
            nodeUserGroupId3 = await gqlAddElemToTree('users_groups', {library: 'users_groups', id: userGroupId3});
            nodeUserGroupId4 = await gqlAddElemToTree(
                'users_groups',
                {library: 'users_groups', id: userGroupId4},
                nodeUserGroupId3
            );
            nodeUserGroupId5 = await gqlAddElemToTree('users_groups', {library: 'users_groups', id: userGroupId5});
            nodeUserGroupId6 = await gqlAddElemToTree(
                'users_groups',
                {library: 'users_groups', id: userGroupId6},
                nodeUserGroupId5
            );

            // Create records for tree
            const resCreateTreeRecords = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "${inheritTestTreeElemLibName}") { record {id} },
                r2: createRecord(library: "${inheritTestTreeElemLibName}") { record {id} }
            }`);
            treeElemId1 = resCreateTreeRecords.data.data.r1.record.id;
            treeElemId2 = resCreateTreeRecords.data.data.r2.record.id;

            // Add records to tree
            nodeTreeElem1 = await gqlAddElemToTree(inheritTestTreeName, {
                id: treeElemId1,
                library: inheritTestTreeElemLibName
            });
            nodeTreeElem2 = await gqlAddElemToTree(
                inheritTestTreeName,
                {id: treeElemId2, library: inheritTestTreeElemLibName},
                nodeTreeElem1
            );
        });

        describe('Record permissions', () => {
            test('Retrieve herited permissions for record permissions: herit from user group', async () => {
                // Save perm
                await makeGraphQlCall(`mutation {
                    savePermission(
                        permission: {
                            type: record,
                            applyTo: "${inheritTestLibName}",
                            usersGroup: "${nodeUserGroupId1}",
                            permissionTreeTarget: {
                                tree: "${inheritTestTreeName}",
                                nodeId: "${nodeTreeElem2}"
                            },
                            actions: [
                                {name: access_record, allowed: false},
                            ]
                        }
                    ) { type }
                }`);

                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: inheritedPermissions(
                        type: record,
                        applyTo: "${inheritTestLibName}",
                        actions: [access_record],
                        userGroupNodeId: "${nodeUserGroupId2}",
                        permissionTreeTarget: {
                            tree: "${inheritTestTreeName}",
                            nodeId: "${nodeTreeElem2}"
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
                            applyTo: "${inheritTestLibName}",
                            usersGroup: "${nodeUserGroupId4}",
                            permissionTreeTarget: {
                                tree: "${inheritTestTreeName}",
                                nodeId: "${nodeTreeElem1}"
                            },
                            actions: [
                                {name: access_record, allowed: false},
                            ]
                        }
                    ) { type }
                }`);

                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: inheritedPermissions(
                        type: record,
                        applyTo: "${inheritTestLibName}",
                        actions: [access_record],
                        userGroupNodeId: "${nodeUserGroupId4}",
                        permissionTreeTarget: {
                            tree: "${inheritTestTreeName}",
                            nodeId: "${nodeTreeElem2}"
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
                    p: inheritedPermissions(
                        type: record,
                        applyTo: "${inheritTestLibName}",
                        actions: [access_record],
                        userGroupNodeId: "${nodeUserGroupId6}",
                        permissionTreeTarget: {
                            tree: "${inheritTestTreeName}",
                            nodeId: "${nodeTreeElem2}"
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
                            applyTo: "${inheritTestLibName}",
                            usersGroup: "${nodeUserGroupId1}",
                            actions: [
                                {name: access_record, allowed: false},
                            ]
                        }
                    ) { type }
                }`);

                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: inheritedPermissions(
                        type: library,
                        applyTo: "${inheritTestLibName}",
                        actions: [access_record],
                        userGroupNodeId: "${nodeUserGroupId2}",
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('access_record');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
            });

            test('Retrieve herited permissions from default permission', async () => {
                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: inheritedPermissions(
                        type: library,
                        applyTo: "${inheritTestLibName}",
                        actions: [access_record],
                        userGroupNodeId: "${nodeUserGroupId4}",
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
                            type: admin,
                            usersGroup: "${nodeUserGroupId1}",
                            actions: [
                                {name: admin_create_attribute, allowed: false},
                            ]
                        }
                    ) { type }
                }`);

                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: inheritedPermissions(
                        type: admin,
                        actions: [admin_create_attribute],
                        userGroupNodeId: "${nodeUserGroupId2}",
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('admin_create_attribute');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
            });

            test('Retrieve herited permissions from default permission', async () => {
                // Get perm
                const permHeritGroup = await makeGraphQlCall(`{
                    p: inheritedPermissions(
                        type: admin,
                        actions: [admin_create_attribute],
                        userGroupNodeId: "${nodeUserGroupId4}",
                    ) { name allowed }
                  }
                `);

                expect(permHeritGroup.data.data.p[0].name).toBe('admin_create_attribute');
                expect(permHeritGroup.data.data.p[0].allowed).toBe(true);
            });
        });
    });

    describe('Root level permissions', () => {
        let userGroupId: string;
        let nodeUserGroup: string;

        beforeAll(async () => {
            userGroupId = await gqlCreateRecord('users_groups');

            // Add users groups to tree
            nodeUserGroup = await gqlAddElemToTree('users_groups', {
                id: userGroupId,
                library: 'users_groups'
            });
        });

        test('Save/get permission on users groups root level', async () => {
            // Save perm
            const resSavePerm = await makeGraphQlCall(`mutation {
                perm: savePermission(
                    permission: {
                        type: library,
                        applyTo: "${testLibId}",
                        usersGroup: null,
                        actions: [{name: access_record, allowed: false}]
                    }
                ) { type usersGroup }
            }`);

            expect(resSavePerm.status).toBe(200);
            expect(resSavePerm.data.errors).toBeUndefined();
            expect(resSavePerm.data.data.perm.usersGroup).toBe(null);

            // Retrieve permission
            const resGetPerm = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: library,
                    applyTo: "${testLibId}",
                    actions: [access_record],
                    userGroupNodeId: "${nodeUserGroup}",
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
                        usersGroup: "${nodeUserGroup}",
                        actions: [
                            {name: access_record, allowed: false},
                        ],
                        permissionTreeTarget: {
                            tree: "${permTreeName}",
                            nodeId: null
                        }
                    }
                ) { type usersGroup permissionTreeTarget {tree nodeId}}
            }`);

            expect(resSavePerm.status).toBe(200);
            expect(resSavePerm.data.errors).toBeUndefined();
            expect(resSavePerm.data.data.perm.permissionTreeTarget.tree).toBe(permTreeName);
            expect(resSavePerm.data.data.perm.permissionTreeTarget.nodeId).toBe(null);

            // Retrieve permission
            const resGetPerm = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: record,
                    applyTo: "${testLibId}",
                    actions: [access_record],
                    userGroupNodeId: "${nodeUserGroup}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        nodeId: "${nodePermTreeElem}"
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
