// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* eslint-disable jsdoc/check-indentation */

import {AttributeTypes} from '../../../../_types/attribute';
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

describe('TreeNodePermissions', () => {
    const elementsTreeLibId = 'tree_node_permissions_test_liba';
    const permissionsTreeLibId = 'tree_node_permissions_test_libb';
    const treeAttrID = 'tree_node_permissions_tree_attr';
    const elementsTreeId = 'tree_node_permissions_elements_tree';
    const permissionsTreeId = 'tree_node_permissions_permissions_tree';
    let allUsersTreeElemId;

    let elementsTreeRecord1;
    let elementsTreeRecord2;
    let permissionsTreeRecord1;
    let permissionsTreeRecord2;

    beforeAll(async () => {
        /**
         * Setting up following environmene:
         * ELEMENTS TREE:
         * [record 1]
         *  └──[record 2]
         *
         * PERMISSIONS TREE:
         * [record1]
         *   └──[record 2]
         */

        await gqlSaveLibrary(elementsTreeLibId, 'Test');
        await gqlSaveLibrary(permissionsTreeLibId, 'Test');

        await gqlSaveTree(elementsTreeId, 'Elements tree', [elementsTreeLibId]);
        await makeGraphQlCall(`mutation {
            saveTree(
                tree: {
                    id: "${elementsTreeId}",
                    label: {fr: "${elementsTreeId}"},
                    libraries: ["${elementsTreeLibId}"]
                    permissions_conf: [
                        {
                            libraryId: "${elementsTreeLibId}",
                            permissionsConf: {
                                permissionTreeAttributes: ["${treeAttrID}"],
                                relation: and
                            }
                        }
                    ]
                }
            ) {
                id
            }
        }`);
        await gqlSaveTree(permissionsTreeId, 'Permissions Tree', [permissionsTreeLibId]);

        await gqlSaveAttribute({
            id: treeAttrID,
            label: 'Test Attr',
            type: AttributeTypes.TREE,
            linkedTree: permissionsTreeId
        });

        await gqlSaveLibrary(elementsTreeLibId, 'Test', [treeAttrID]);

        allUsersTreeElemId = await gqlGetAllUsersGroupId();
        await gqlAddUserToGroup(allUsersTreeElemId);

        // Create records for elements tree
        elementsTreeRecord1 = await gqlCreateRecord(elementsTreeLibId);
        elementsTreeRecord2 = await gqlCreateRecord(elementsTreeLibId);

        // Create records for permissions tree
        permissionsTreeRecord1 = await gqlCreateRecord(permissionsTreeLibId);
        permissionsTreeRecord2 = await gqlCreateRecord(permissionsTreeLibId);

        // Add elements to tree
        await gqlAddElemToTree(elementsTreeId, {library: elementsTreeLibId, id: elementsTreeRecord1});
        await gqlAddElemToTree(
            elementsTreeId,
            {library: elementsTreeLibId, id: elementsTreeRecord2},
            {library: elementsTreeLibId, id: elementsTreeRecord1}
        );

        await gqlAddElemToTree(permissionsTreeId, {library: permissionsTreeLibId, id: permissionsTreeRecord1});
        await gqlAddElemToTree(
            permissionsTreeId,
            {library: permissionsTreeLibId, id: permissionsTreeRecord2},
            {library: permissionsTreeLibId, id: permissionsTreeRecord1}
        );

        // Save value on record to be able to retrieve permissions
        await makeGraphQlCall(`mutation {
            saveValue(
                library: "${elementsTreeLibId}"
                recordId: "${elementsTreeRecord1}"
                attribute: "${treeAttrID}"
                value: {
                    value: "${permissionsTreeLibId}/${permissionsTreeRecord1}"
                }
            ) {
                id_value
            }
        }`);

        // Save permission on library
        await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                    type: tree_library
                    applyTo: "${elementsTreeId}/${elementsTreeLibId}"
                    usersGroup: "${allUsersTreeElemId}"
                    actions: [
                        {name: edit_children, allowed: false},
                    ]
                }
            ) {
                type
                actions {
                    name
                    allowed
                }
            }
        }`);
    });

    describe('Element permissions', () => {
        test('Save and get tree node permissions', async () => {
            /**
             * Save permissions
             */
            const resSavePerm = await makeGraphQlCall(`mutation {
                savePermission(
                    permission: {
                        type: tree_node
                        applyTo: "${elementsTreeId}/${elementsTreeLibId}"
                        usersGroup: "${allUsersTreeElemId}"
                        actions: [
                            {name: access_tree, allowed: false},
                            {name: edit_tree, allowed: true},
                            {name: edit_children, allowed: null},
                        ]
                        permissionTreeTarget: {
                            tree: "${permissionsTreeId}"
                            library: "${permissionsTreeLibId}"
                            id: "${permissionsTreeRecord1}"
                        }
                    }
                ) {
                    type
                    actions {
                        name
                        allowed
                    }
                }
            }`);

            expect(resSavePerm.status).toBe(200);
            expect(resSavePerm.data.data.savePermission.type).toBe('tree_node');
            expect(resSavePerm.data.errors).toBeUndefined();

            /**
             * Get permissions
             */
            const resGetPerm = await makeGraphQlCall(`{
                permissions(
                    type: tree_node,
                    applyTo: "${elementsTreeId}/${elementsTreeLibId}"
                    actions: [
                        access_tree,
                        edit_tree,
                        edit_children
                    ],
                    usersGroup: "${allUsersTreeElemId}"
                    permissionTreeTarget: {
                        tree: "${permissionsTreeId}"
                        library: "${permissionsTreeLibId}"
                        id: "${permissionsTreeRecord1}"
                    }
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetPerm.status).toBe(200);
            expect(resGetPerm.data.data.permissions).toEqual([
                {name: 'access_tree', allowed: false},
                {name: 'edit_tree', allowed: true},
                {name: 'edit_children', allowed: null}
            ]);
            expect(resGetPerm.data.errors).toBeUndefined();

            /**
             * Is Allowed
             */
            const resIsAllowedOnElement = await makeGraphQlCall(`{
                onElement: isAllowed(
                    type: tree_node,
                    actions: [
                        access_tree
                        edit_tree
                        edit_children
                    ],
                    applyTo: "${elementsTreeId}"
                    target: {
                        recordId: "${elementsTreeRecord1}"
                        libraryId: "${elementsTreeLibId}"
                    }
                ) {
                    name
                    allowed
                },
                onChild: isAllowed(
                    type: tree_node,
                    actions: [
                        access_tree
                        edit_tree
                        edit_children
                    ],
                    applyTo: "${elementsTreeId}"
                    target: {
                        recordId: "${elementsTreeRecord2}"
                        libraryId: "${elementsTreeLibId}"
                    }
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowedOnElement.status).toBe(200);
            expect(resIsAllowedOnElement.data.data.onElement).toEqual([
                {name: 'access_tree', allowed: false},
                {name: 'edit_tree', allowed: true},
                {name: 'edit_children', allowed: false} // Inherited from library
            ]);
            expect(resIsAllowedOnElement.data.data.onChild).toEqual([
                {name: 'access_tree', allowed: false},
                {name: 'edit_tree', allowed: true},
                {name: 'edit_children', allowed: false} // Inherited from library
            ]);
            expect(resIsAllowedOnElement.data.errors).toBeUndefined();

            /**
             * Herited permissions
             */
            const resGetHeritedPermission = await makeGraphQlCall(`{
                heritedPermissions(
                    type: tree_node
                    applyTo: "${elementsTreeId}/${elementsTreeLibId}"
                    actions: [
                        access_tree,
                        edit_tree,
                        edit_children
                    ],
                    userGroupId: "${allUsersTreeElemId}"
                    permissionTreeTarget: {
                        tree: "${permissionsTreeId}"
                        library: "${permissionsTreeLibId}"
                        id: "${permissionsTreeRecord2}"
                    }
                  ) {
                    name
                    allowed
                  }
            }`);

            expect(resIsAllowedOnElement.status).toBe(200);
            expect(resGetHeritedPermission.data.data.heritedPermissions).toEqual([
                {name: 'access_tree', allowed: false},
                {name: 'edit_tree', allowed: true},
                {name: 'edit_children', allowed: false} // Inherited from library
            ]);
            expect(resIsAllowedOnElement.data.errors).toBeUndefined();
        });
    });
});
