// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    gqlAddElemToTree,
    gqlAddUserToGroup,
    gqlCreateRecord,
    gqlGetAdminsGroupNodeId,
    gqlSaveTree,
    makeGraphQlCall
} from '../e2eUtils';

describe('TreePermissions', () => {
    const permTreeName = 'tree_permissions_test_tree';
    let allUsersTreeElemId: string;

    beforeAll(async () => {
        // Create tree
        await gqlSaveTree(permTreeName, 'Test tree', ['users']);

        allUsersTreeElemId = await gqlGetAdminsGroupNodeId();
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
                            {name: detach, allowed: false},
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
                        detach,
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
                {name: 'detach', allowed: false},
                {name: 'edit_children', allowed: true}
            ]);
            expect(resGetTreePerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`{
                isAllowed(
                    type: tree,
                    actions: [
                        access_tree,
                        detach,
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
                {name: 'detach', allowed: false},
                {name: 'edit_children', allowed: true}
            ]);
            expect(resIsAllowed.data.errors).toBeUndefined();
        });
    });

    describe('Inherited permissions', () => {
        let userGroupId1: string;
        let nodeUserGroup1: string;
        let userGroupId2: string;
        let nodeUserGroup2: string;

        beforeAll(async () => {
            userGroupId1 = await gqlCreateRecord('users_groups');
            userGroupId2 = await gqlCreateRecord('users_groups');

            // Add users groups to tree
            nodeUserGroup1 = await gqlAddElemToTree('users_groups', {id: userGroupId1, library: 'users_groups'});
            nodeUserGroup2 = await gqlAddElemToTree(
                'users_groups',
                {id: userGroupId2, library: 'users_groups'},
                nodeUserGroup1
            );

            // User groups tree: [ROOT] -> group 1 -> group 2
            // We save a permission on group 1

            // Save perm
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree,
                        applyTo: "${permTreeName}",
                        usersGroup: "${nodeUserGroup1}",
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
                p: inheritedPermissions(
                    type: tree,
                    applyTo: "${permTreeName}",
                    actions: [access_tree],
                    userGroupNodeId: "${nodeUserGroup2}"
                ) { name allowed }
              }
            `);

            expect(permHeritGroup.status).toBe(200);
            expect(permHeritGroup.data.data.p[0].name).toBe('access_tree');
            expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
        });
    });
});
