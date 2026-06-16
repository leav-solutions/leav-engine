import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {SystemTrees} from '../../../../_constants/systemTrees';
import {AttributeFormats, AttributeTypes} from '../../../../_types/attribute';
import {
    adminUserSdk,
    e2eNonAdminGroupId,
    gqlAddElemToTree,
    gqlCreateRecord,
    gqlSaveAttribute,
    gqlSaveTree,
    makeGraphQlCall,
} from '../e2eUtils';

describe('RecordAttributePermissions', () => {
    const permAttrName = 'record_attribute_permissions_test_attr';
    const permTreeLibName = 'record_attribute_permissions_tree_lib';
    const permTreeName = 'record_attribute_permissions_tree';

    let treeElemId1: string;
    let nodeElem1: string;
    let treeElemId2: string;
    let nodeElem2: string;

    beforeAll(async () => {
        await gqlSaveAttribute({
            id: permAttrName,
            type: AttributeTypes.SIMPLE,
            label: 'Test attr',
            format: AttributeFormats.TEXT,
        });
        await adminUserSdk.SaveLibrary({library: {id: permTreeLibName, label: {en: 'Test Lib'}}});
        await gqlSaveTree(permTreeName, 'Test tree', [permTreeLibName]);

        // Add elements to library
        treeElemId1 = await gqlCreateRecord(permTreeLibName);
        treeElemId2 = await gqlCreateRecord(permTreeLibName);

        nodeElem1 = await gqlAddElemToTree(permTreeName, {id: treeElemId1, library: permTreeLibName});
        nodeElem2 = await gqlAddElemToTree(permTreeName, {id: treeElemId2, library: permTreeLibName}, nodeElem1);

        // Save perm
        await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    usersGroup: "${e2eNonAdminGroupId()}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        nodeId: "${nodeElem1}"
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
                    usersGroup: "${e2eNonAdminGroupId()}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        nodeId: "${nodeElem1}"
                    },
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
                {name: 'edit_value', allowed: false},
            ]);
            expect(resGetAttrPerm.data.errors).toBeUndefined();
        });
    });

    describe('Inherited permissions', () => {
        let userGroupId1: string;
        let userGroupId2: string;
        let nodeGroup1: string;
        let nodeGroup2: string;

        beforeAll(async () => {
            // Create 2 users groups
            userGroupId1 = await gqlCreateRecord(SystemLibraries.USERS_GROUPS);
            userGroupId2 = await gqlCreateRecord(SystemLibraries.USERS_GROUPS);

            // Add users groups to tree
            nodeGroup1 = await gqlAddElemToTree(SystemTrees.USERS_GROUPS, {
                id: userGroupId1,
                library: SystemLibraries.USERS_GROUPS,
            });
            nodeGroup2 = await gqlAddElemToTree(
                SystemTrees.USERS_GROUPS,
                {id: userGroupId2, library: SystemLibraries.USERS_GROUPS},
                nodeGroup1,
            );

            // User groups tree: [ROOT] -> group 1 -> group 2
            // We save a permission on group 1

            // Save perm
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: record_attribute,
                        applyTo: "${permAttrName}",
                        usersGroup: "${nodeGroup1}",
                        permissionTreeTarget: {
                            tree: "${permTreeName}",
                            nodeId: "${nodeElem1}"
                        },
                        actions: [
                            {name: access_attribute, allowed: false},
                        ]
                    }
                ) { type }
            }`);
        });

        test('Inherit permission from user group', async () => {
            const permHeritGroup = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    actions: [access_attribute],
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        nodeId: "${nodeElem1}"
                    },
                    userGroupNodeId: "${nodeGroup2}"
                ) { name allowed }
              }
            `);

            expect(permHeritGroup.status).toBe(200);
            expect(permHeritGroup.data.data.p[0].name).toBe('access_attribute');
            expect(permHeritGroup.data.data.p[0].allowed).toBe(false);
        });

        test('Inherit permission from tree elem', async () => {
            const permHeritTree = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    actions: [access_attribute],
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        nodeId: "${nodeElem2}"
                    },
                    userGroupNodeId: "${nodeGroup1}"
                ) { name allowed }
              }
            `);

            expect(permHeritTree.status).toBe(200);
            expect(permHeritTree.data.data.p[0].name).toBe('access_attribute');
            expect(permHeritTree.data.data.p[0].allowed).toBe(false);
        });

        test('Inherit permission from global attribute permission', async () => {
            // Save perm
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: attribute,
                        applyTo: "${permAttrName}",
                        usersGroup: "${nodeGroup1}",
                        actions: [
                            {name: edit_value, allowed: false},
                        ]
                    }
                ) { type }
            }`);

            const permInheritAttr = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: record_attribute,
                    applyTo: "${permAttrName}",
                    actions: [edit_value]
                    userGroupNodeId: "${nodeGroup1}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}",
                        nodeId: "${nodeElem2}"
                    }
                ) { name allowed }
              }
            `);

            expect(permInheritAttr.status).toBe(200);
            expect(permInheritAttr.data.data.p[0].name).toBe('edit_value');
            expect(permInheritAttr.data.data.p[0].allowed).toBe(false);
        });
    });
});
