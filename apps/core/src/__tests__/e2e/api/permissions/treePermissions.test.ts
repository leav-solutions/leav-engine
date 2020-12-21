// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {gqlAddUserToGroup, gqlGetAllUsersGroupId, gqlSaveTree, makeGraphQlCall} from '../e2eUtils';

describe('TreePermissions', () => {
    const permTreeName = 'tree_permissions_test_tree';
    let allUsersTreeElemId;

    beforeAll(async () => {
        // Create tree
        await gqlSaveTree(permTreeName, 'Test tree', []);

        allUsersTreeElemId = await gqlGetAllUsersGroupId();
        await gqlAddUserToGroup(allUsersTreeElemId);
    });

    describe('Defined permission', () => {
        test('Save and get tree permissions', async () => {
            const resSaveTreePerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree,
                        applyTo: "${permTreeName}",
                        usersGroup: "${allUsersTreeElemId}",
                        actions: [
                            {name: access_tree, allowed: true},
                            {name: edit_tree, allowed: false},
                            {name: edit_children, allowed: true}
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

            expect(resSaveTreePerm.status).toBe(200);
            expect(resSaveTreePerm.data.data.savePermission.type).toBe('tree');
            expect(resSaveTreePerm.data.errors).toBeUndefined();

            const resGetTreePerm = await makeGraphQlCall(`{
                permissions(
                    type: tree,
                    applyTo: "${permTreeName}",
                    usersGroup: "${allUsersTreeElemId}",
                    actions: [
                        access_tree,
                        edit_tree,
                        edit_children
                    ]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetTreePerm.status).toBe(200);
            expect(resGetTreePerm.data.data.permissions).toEqual([
                {name: 'access_tree', allowed: true},
                {name: 'edit_tree', allowed: false},
                {name: 'edit_children', allowed: true}
            ]);
            expect(resGetTreePerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`{
                isAllowed(
                    type: tree,
                    actions: [
                        access_tree,
                        edit_tree,
                        edit_children,
                    ],
                    applyTo: "${permTreeName}"
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toEqual([
                {name: 'access_tree', allowed: true},
                {name: 'edit_tree', allowed: false},
                {name: 'edit_children', allowed: true}
            ]);
            expect(resIsAllowed.data.errors).toBeUndefined();
        });
    });

    describe('Herited permissions', () => {
        let userGroupId1;
        let userGroupId2;

        beforeAll(async () => {
            // Create 2 users groups
            const resCreateGroups = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "users_groups") {id},
                r2: createRecord(library: "users_groups") {id}
            }`);
            userGroupId1 = resCreateGroups.data.data.r1.id;
            userGroupId2 = resCreateGroups.data.data.r2.id;

            // Add users groups to tree
            await makeGraphQlCall(`mutation {
                el1: treeAddElement(treeId: "users_groups", element: {id: "${userGroupId1}", library: "users_groups"}) {
                    id
                },
            }`);

            await makeGraphQlCall(`mutation {
                el1: treeAddElement(
                    treeId: "users_groups",
                    element: {id: "${userGroupId2}", library: "users_groups"},
                    parent: {id: "${userGroupId1}", library: "users_groups"}
                ) { id },
            }`);

            // User groups tree: [ROOT] -> group 1 -> group 2
            // We save a permission on group 1

            // Save perm
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree,
                        applyTo: "${permTreeName}",
                        usersGroup: "${userGroupId1}",
                        actions: [
                            {name: access_tree, allowed: false},
                        ]
                    }
                ) { type }
            }`);
        });

        test('Retrieve permission herited from user group', async () => {
            // Get perm
            const permHeritGroup = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: tree,
                    applyTo: "${permTreeName}",
                    actions: [access_tree],
                    userGroupId: "${userGroupId2}"
                ) { name allowed }
              }
            `);

            expect(permHeritGroup.status).toBe(200);
            expect(permHeritGroup.data.data.p[0].name).toBe('access_tree');
            expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
        });
    });
});
