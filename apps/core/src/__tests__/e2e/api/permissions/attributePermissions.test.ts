// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {
    gqlAddElemToTree,
    gqlAddUserToGroup,
    gqlGetAllUsersGroupNodeId,
    gqlSaveAttribute,
    makeGraphQlCall
} from '../e2eUtils';

describe('AttributePermissions', () => {
    const permAttrName = 'attribute_permissions_test_attr';
    let allUsersTreeElemId;

    beforeAll(async () => {
        // Create attribute
        await gqlSaveAttribute({
            id: permAttrName,
            type: AttributeTypes.SIMPLE,
            label: 'Test attr',
            format: AttributeFormats.TEXT
        });

        allUsersTreeElemId = await gqlGetAllUsersGroupNodeId();
        await gqlAddUserToGroup(allUsersTreeElemId);
    });

    describe('Defined permission', () => {
        test('Save and get attribute permissions', async () => {
            const resSaveAttrPerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: attribute,
                        applyTo: "${permAttrName}",
                        usersGroup: "${allUsersTreeElemId}",
                        actions: [
                            {name: access_attribute, allowed: true},
                            {name: edit_value, allowed: false},
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

            expect(resSaveAttrPerm.status).toBe(200);
            expect(resSaveAttrPerm.data.data.savePermission.type).toBe('attribute');
            expect(resSaveAttrPerm.data.errors).toBeUndefined();

            const resGetAttrPerm = await makeGraphQlCall(`{
                permissions(
                    type: attribute,
                    applyTo: "${permAttrName}",
                    usersGroup: "${allUsersTreeElemId}",
                    actions: [
                        access_attribute,
                        edit_value
                    ]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetAttrPerm.status).toBe(200);
            expect(resGetAttrPerm.data.data.permissions).toEqual([
                {name: 'access_attribute', allowed: true},
                {name: 'edit_value', allowed: false}
            ]);
            expect(resGetAttrPerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`{
                isAllowed(
                    type: attribute,
                    actions: [
                        access_attribute,
                        edit_value
                    ],
                    applyTo: "${permAttrName}"
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toEqual([
                {name: 'access_attribute', allowed: true},
                {name: 'edit_value', allowed: false}
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
            // Create 2 users groups
            const resCreateGroups = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "users_groups") {id},
                r2: createRecord(library: "users_groups") {id}
            }`);
            userGroupId1 = resCreateGroups.data.data.r1.id;
            userGroupId2 = resCreateGroups.data.data.r2.id;

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
                        type: attribute,
                        applyTo: "${permAttrName}",
                        usersGroup: "${nodeUserGroup1}",
                        actions: [
                            {name: access_attribute, allowed: false},
                        ]
                    }
                ) { type }
            }`);
        });

        test('Retrieve permission herited from user group', async () => {
            // Get perm
            const permInheritGroup = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: attribute,
                    applyTo: "${permAttrName}",
                    actions: [access_attribute],
                    userGroupNodeId: "${nodeUserGroup2}"
                ) { name allowed }
              }
            `);

            expect(permInheritGroup.status).toBe(200);
            expect(permInheritGroup.data.data.p[0].name).toBe('access_attribute');
            expect(permInheritGroup.data.data.p[0].allowed).toBe(false);
        });
    });
});
