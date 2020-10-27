import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {gqlAddUserToGroup, gqlGetAllUsersGroupId, gqlSaveAttribute, makeGraphQlCall} from '../e2eUtils';

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

        allUsersTreeElemId = await gqlGetAllUsersGroupId();
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
                            {name: create_value, allowed: true},
                            {name: delete_value, allowed: false}
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
                        edit_value,
                        create_value,
                        delete_value,
                    ]
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetAttrPerm.status).toBe(200);
            expect(resGetAttrPerm.data.data.permissions).toEqual([
                {name: 'access_attribute', allowed: true},
                {name: 'edit_value', allowed: false},
                {name: 'create_value', allowed: true},
                {name: 'delete_value', allowed: false}
            ]);
            expect(resGetAttrPerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(`{
                isAllowed(
                    type: attribute,
                    actions: [
                        access_attribute,
                        edit_value,
                        create_value,
                        delete_value
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
                {name: 'edit_value', allowed: false},
                {name: 'create_value', allowed: true},
                {name: 'delete_value', allowed: false}
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
                        type: attribute,
                        applyTo: "${permAttrName}",
                        usersGroup: "${userGroupId1}",
                        actions: [
                            {name: access_attribute, allowed: false},
                        ]
                    }
                ) { type }
            }`);
        });

        test('Retrieve permission herited from user group', async () => {
            // Get perm
            const permHeritGroup = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: attribute,
                    applyTo: "${permAttrName}",
                    actions: [access_attribute],
                    userGroupId: "${userGroupId2}"
                ) { name allowed }
              }
            `);

            expect(permHeritGroup.status).toBe(200);
            expect(permHeritGroup.data.data.p[0].name).toBe('access_attribute');
            expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
        });
    });
});
