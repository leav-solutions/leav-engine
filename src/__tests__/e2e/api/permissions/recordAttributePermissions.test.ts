import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {
    gqlAddElemToTree,
    gqlAddUserToGroup,
    gqlCreateRecord,
    gqlGetAllUsersGroupId,
    gqlSaveAttribute,
    gqlSaveLibrary,
    gqlSaveTree,
    makeGraphQlCall
} from '../e2eUtils';

describe('RecordAttributePermissions', () => {
    const permAttrName = 'record_attribute_permissions_test_attr';
    const permTreeLibName = 'record_attribute_permissions_tree_lib';
    const permTreeName = 'record_attribute_permissions_tree';

    let allUsersTreeElemId;
    let treeElemId1;
    let treeElemId2;

    beforeAll(async () => {
        await gqlSaveAttribute(permAttrName, AttributeTypes.SIMPLE, 'Test attr', AttributeFormats.TEXT);
        await gqlSaveLibrary(permTreeLibName, 'Test Lib');
        await gqlSaveTree(permTreeName, 'Test tree', [permTreeLibName]);

        // Add elements to library
        treeElemId1 = await gqlCreateRecord(permTreeLibName);
        treeElemId2 = await gqlCreateRecord(permTreeLibName);

        allUsersTreeElemId = await gqlGetAllUsersGroupId();
        await gqlAddUserToGroup(allUsersTreeElemId);

        await gqlAddElemToTree(permTreeName, {id: treeElemId1, library: permTreeLibName});
        await gqlAddElemToTree(
            permTreeName,
            {id: treeElemId2, library: permTreeLibName},
            {id: treeElemId1, library: permTreeLibName}
        );

        // Save perm
        await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    usersGroup: "${allUsersTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        library: "${permTreeLibName}",
                        id: "${treeElemId1}"
                    },
                    actions: [
                        {name: access_attribute, allowed: true},
                        {name: edit_value, allowed: false}
                    ]
                }
            ) { type }
        }`);
    });

    describe('Defined permission', () => {
        test('Retrieve permission defined on perm tree', async () => {
            const resGetAttrPerm = await makeGraphQlCall(`{
                permissions(
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    usersGroup: "${allUsersTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        library: "${permTreeLibName}",
                        id: "${treeElemId1}"
                    },
                    actions: [
                        access_attribute,
                        edit_value,
                        create_value,
                        delete_value
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
                {name: 'create_value', allowed: null},
                {name: 'delete_value', allowed: null}
            ]);
            expect(resGetAttrPerm.data.errors).toBeUndefined();
        });
    });

    describe('Herited permissions', () => {
        let userGroupId1;
        let userGroupId2;

        beforeAll(async () => {
            // Create 2 users groups
            userGroupId1 = await gqlCreateRecord('users_groups');
            userGroupId2 = await gqlCreateRecord('users_groups');

            // Add users groups to tree
            await gqlAddElemToTree('users_groups', {id: userGroupId1, library: 'users_groups'});
            await gqlAddElemToTree(
                'users_groups',
                {id: userGroupId2, library: 'users_groups'},
                {id: userGroupId1, library: 'users_groups'}
            );

            // User groups tree: [ROOT] -> group 1 -> group 2
            // We save a permission on group 1

            // Save perm
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: record_attribute,
                        applyTo: "${permAttrName}",
                        usersGroup: "${userGroupId1}",
                        permissionTreeTarget: {
                            tree: "${permTreeName}",
                            library: "${permTreeLibName}",
                            id: "${treeElemId1}"
                        },
                        actions: [
                            {name: access_attribute, allowed: false},
                        ]
                    }
                ) { type }
            }`);
        });

        test('Herit permission from user group', async () => {
            const permHeritGroup = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    actions: [access_attribute],
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        library: "${permTreeLibName}",
                        id: "${treeElemId1}"
                    },
                    userGroupId: "${userGroupId2}"
                ) { name allowed }
              }
            `);

            expect(permHeritGroup.status).toBe(200);
            expect(permHeritGroup.data.data.p[0].name).toBe('access_attribute');
            expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
        });

        test('Herit permission from tree elem', async () => {
            const permHeritTree = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    actions: [access_attribute],
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        library: "${permTreeLibName}",
                        id: "${treeElemId2}"
                    },
                    userGroupId: "${userGroupId1}"
                ) { name allowed }
              }
            `);

            expect(permHeritTree.status).toBe(200);
            expect(permHeritTree.data.data.p[0].name).toBe('access_attribute');
            expect(permHeritTree.data.data.p[0].allowed).toBe(false);
        });

        test('Herit permission from global attribute permission', async () => {
            // Save perm
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: attribute,
                        applyTo: "${permAttrName}",
                        usersGroup: "${userGroupId1}",
                        actions: [
                            {name: create_value, allowed: false},
                        ]
                    }
                ) { type }
            }`);

            const permHeritAttr = await makeGraphQlCall(`{
                p: heritedPermissions(
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    actions: [create_value]
                    userGroupId: "${userGroupId1}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        library: "${permTreeLibName}",
                        id: "${treeElemId2}"
                    }
                ) { name allowed }
              }
            `);

            expect(permHeritAttr.status).toBe(200);
            expect(permHeritAttr.data.data.p[0].name).toBe('create_value');
            expect(permHeritAttr.data.data.p[0].allowed).toBe(false);
        });
    });
});
