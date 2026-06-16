import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {SystemTrees} from '../../../../_constants/systemTrees';
import {adminUserSdk, e2eNonAdminGroupId, e2eNonAdminUser, gqlAddElemToTree, makeGraphQlCall} from '../e2eUtils';

describe('TreeLibraryPermissions', () => {
    const permTreeName = 'tree_library_permissions_test_tree';
    const treeLibId = 'tree_library_permissions_test_lib';

    beforeAll(async () => {
        // Create tree
        await adminUserSdk.SaveLibrary({library: {id: treeLibId, label: {en: 'Test lib'}}});

        await makeGraphQlCall(`mutation {
            saveTree(
                tree: {
                    id: "${permTreeName}",
                    label: {fr: "Test tree", en: "Test tree"},
                    libraries: [{
                        library: "${treeLibId}",
                        settings: {allowMultiplePositions: true, allowedAtRoot: true,  allowedChildren: ["__all__"]}
                    }]
                }
            ) {
                id
            }
        }`);
    });

    describe('Defined permission', () => {
        test('Save and get tree node library permissions', async () => {
            const resSaveTreePerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree_library,
                        applyTo: "${permTreeName}/${treeLibId}",
                        usersGroup: "${e2eNonAdminGroupId()}",
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
            expect(resSaveTreePerm.data.data.savePermission.type).toBe('tree_library');
            expect(resSaveTreePerm.data.errors).toBeUndefined();

            const resGetTreePerm = await makeGraphQlCall(`{
                permissions(
                    type: tree_library,
                    applyTo: "${permTreeName}/${treeLibId}",
                    usersGroup: "${e2eNonAdminGroupId()}",
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
                {name: 'edit_children', allowed: true},
            ]);
            expect(resGetTreePerm.data.errors).toBeUndefined();

            const resIsAllowed = await makeGraphQlCall(
                `{
                isAllowed(
                    type: tree_library,
                    actions: [
                        access_tree,
                        detach,
                        edit_children,
                    ],
                    applyTo: "${permTreeName}/${treeLibId}"
                ) {
                    name
                    allowed
                }
            }`,
                {
                    user: e2eNonAdminUser(),
                },
            );

            expect(resIsAllowed.status).toBe(200);
            expect(resIsAllowed.data.data.isAllowed).toEqual([
                {name: 'access_tree', allowed: true},
                {name: 'detach', allowed: false},
                {name: 'edit_children', allowed: true},
            ]);
            expect(resIsAllowed.data.errors).toBeUndefined();
        });
    });

    describe('Herited permissions', () => {
        let userGroupId1: string;
        let nodeUserGroup1: string;
        let userGroupId2: string;
        let nodeUserGroup2: string;
        let userGroupId3: string;
        let nodeUserGroup3: string;
        let userGroupId4: string;
        let nodeUserGroup4: string;

        beforeAll(async () => {
            // Create 2 users groups
            const resCreateGroups = await makeGraphQlCall(`mutation {
                r1: createRecord(library: "users_groups") { record {id} },
                r2: createRecord(library: "users_groups") { record {id} },
                r3: createRecord(library: "users_groups") { record {id} },
                r4: createRecord(library: "users_groups") { record {id} }
            }`);

            userGroupId1 = resCreateGroups.data.data.r1.record.id;
            userGroupId2 = resCreateGroups.data.data.r2.record.id;
            userGroupId3 = resCreateGroups.data.data.r3.record.id;
            userGroupId4 = resCreateGroups.data.data.r4.record.id;

            // Add users groups to tree
            nodeUserGroup1 = await gqlAddElemToTree(SystemTrees.USERS_GROUPS, {
                id: userGroupId1,
                library: SystemLibraries.USERS_GROUPS,
            });
            nodeUserGroup2 = await gqlAddElemToTree(
                SystemTrees.USERS_GROUPS,
                {id: userGroupId2, library: SystemLibraries.USERS_GROUPS},
                nodeUserGroup1,
            );
            nodeUserGroup3 = await gqlAddElemToTree(SystemTrees.USERS_GROUPS, {
                id: userGroupId3,
                library: SystemLibraries.USERS_GROUPS,
            });
            nodeUserGroup4 = await gqlAddElemToTree(
                SystemTrees.USERS_GROUPS,
                {id: userGroupId4, library: SystemLibraries.USERS_GROUPS},
                nodeUserGroup3,
            );

            // User groups tree: [ROOT] -> group 1 -> group 2
            // We save a permission on group 1

            // Save perms
            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree_library,
                        applyTo: "${permTreeName}/${treeLibId}",
                        usersGroup: "${nodeUserGroup1}",
                        actions: [
                            {name: access_tree, allowed: false},
                        ]
                    }
                ) { type }
            }`);

            await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree_library,
                        applyTo: "${permTreeName}/${treeLibId}",
                        usersGroup: "${nodeUserGroup3}",
                        actions: [
                            {name: access_tree, allowed: true},
                        ]
                    }
                ) { type }
            }`);
        });

        test('Retrieve permission inherited from user group', async () => {
            // Get perm
            const permHeritGroup = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: tree_library,
                    applyTo: "${permTreeName}/${treeLibId}"
                    actions: [access_tree],
                    userGroupNodeId: "${nodeUserGroup2}"
                ) { name allowed }
              }
            `);

            expect(permHeritGroup.status).toBe(200);
            expect(permHeritGroup.data.data.p[0].name).toBe('access_tree');
            expect(permHeritGroup.data.data.p[0].allowed).toBe(false);

            // Get perm an test with one path to false and another to true
            const pHG = await makeGraphQlCall(`{
                p: inheritedPermissions(
                    type: tree_library,
                    applyTo: "${permTreeName}/${treeLibId}"
                    actions: [access_tree],
                    userGroupNodeId: "${nodeUserGroup4}"
                ) { name allowed }
              }
            `);

            expect(pHG.status).toBe(200);
            expect(pHG.data.data.p[0].name).toBe('access_tree');
            expect(pHG.data.data.p[0].allowed).toBe(true);
        });
    });
});
