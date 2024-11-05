// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {AttributeTypes} from '../../../../_types/attribute';
import {
    gqlAddElemToTree,
    gqlAddUserToGroup,
    gqlCreateRecord,
    gqlGetAdminsGroupNodeId,
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
    let allUsersTreeNodeId: string;

    let elementsTreeRecord1: string;
    let elementsTreeRecord2: string;
    let permissionsTreeRecord1: string;
    let permissionsTreeRecord2: string;
    let nodeElementsRecord1: string;
    let nodeElementsRecord2: string;
    let nodePermissionsRecord1: string;
    let nodePermissionsRecord2: string;

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
                    label: {en: "${elementsTreeId}"},
                    libraries: [{
                        library: "${elementsTreeLibId}",
                        settings: {allowMultiplePositions: false, allowedAtRoot: true,  allowedChildren: ["__all__"]}
                    }]
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

        allUsersTreeNodeId = await gqlGetAdminsGroupNodeId();
        await gqlAddUserToGroup(allUsersTreeNodeId);

        // Create records for elements tree
        elementsTreeRecord1 = await gqlCreateRecord(elementsTreeLibId);
        elementsTreeRecord2 = await gqlCreateRecord(elementsTreeLibId);

        // Create records for permissions tree
        permissionsTreeRecord1 = await gqlCreateRecord(permissionsTreeLibId);
        permissionsTreeRecord2 = await gqlCreateRecord(permissionsTreeLibId);

        // Add elements to tree
        nodeElementsRecord1 = await gqlAddElemToTree(elementsTreeId, {
            library: elementsTreeLibId,
            id: elementsTreeRecord1
        });
        nodeElementsRecord2 = await gqlAddElemToTree(
            elementsTreeId,
            {library: elementsTreeLibId, id: elementsTreeRecord2},
            nodeElementsRecord1
        );

        nodePermissionsRecord1 = await gqlAddElemToTree(permissionsTreeId, {
            library: permissionsTreeLibId,
            id: permissionsTreeRecord1
        });
        nodePermissionsRecord2 = await gqlAddElemToTree(
            permissionsTreeId,
            {library: permissionsTreeLibId, id: permissionsTreeRecord2},
            nodePermissionsRecord1
        );

        // Save value on record to be able to retrieve permissions
        await makeGraphQlCall(`mutation {
            saveValue(
                library: "${elementsTreeLibId}"
                recordId: "${elementsTreeRecord1}"
                attribute: "${treeAttrID}"
                value: {
                    payload: "${nodePermissionsRecord1}"
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
                    usersGroup: "${allUsersTreeNodeId}"
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
                        usersGroup: "${allUsersTreeNodeId}"
                        actions: [
                            {name: access_tree, allowed: false},
                            {name: detach, allowed: true},
                            {name: edit_children, allowed: null},
                        ]
                        permissionTreeTarget: {
                            tree: "${permissionsTreeId}",
                            nodeId: "${nodePermissionsRecord1}"
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
                        detach,
                        edit_children
                    ],
                    usersGroup: "${allUsersTreeNodeId}"
                    permissionTreeTarget: {
                        tree: "${permissionsTreeId}",
                        nodeId: "${nodePermissionsRecord1}"
                    }
                ) {
                    name
                    allowed
                }
            }`);

            expect(resGetPerm.status).toBe(200);
            expect(resGetPerm.data.data.permissions).toEqual([
                {name: 'access_tree', allowed: false},
                {name: 'detach', allowed: true},
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
                        detach
                        edit_children
                    ],
                    applyTo: "${elementsTreeId}"
                    target: {
                        nodeId: "${nodeElementsRecord1}"
                    }
                ) {
                    name
                    allowed
                },
                onChild: isAllowed(
                    type: tree_node,
                    actions: [
                        access_tree
                        detach
                        edit_children
                    ],
                    applyTo: "${elementsTreeId}"
                    target: {
                        nodeId: "${nodeElementsRecord2}"
                    }
                ) {
                    name
                    allowed
                }
            }`);

            expect(resIsAllowedOnElement.status).toBe(200);
            expect(resIsAllowedOnElement.data.errors).toBeUndefined();
            expect(resIsAllowedOnElement.data.data.onElement).toEqual([
                {name: 'access_tree', allowed: false},
                {name: 'detach', allowed: true},
                {name: 'edit_children', allowed: false} // Inherited from library
            ]);
            expect(resIsAllowedOnElement.data.data.onChild).toEqual([
                {name: 'access_tree', allowed: false},
                {name: 'detach', allowed: true},
                {name: 'edit_children', allowed: false} // Inherited from library
            ]);

            /**
             * Herited permissions
             */
            const resGetInheritedPermission = await makeGraphQlCall(`{
                inheritedPermissions(
                    type: tree_node
                    applyTo: "${elementsTreeId}/${elementsTreeLibId}"
                    actions: [
                        access_tree,
                        detach,
                        edit_children
                    ],
                    userGroupNodeId: "${allUsersTreeNodeId}"
                    permissionTreeTarget: {
                        tree: "${permissionsTreeId}",
                        nodeId: "${nodePermissionsRecord2}"
                    }
                  ) {
                    name
                    allowed
                  }
            }`);

            expect(resIsAllowedOnElement.status).toBe(200);
            expect(resGetInheritedPermission.data.data.inheritedPermissions).toEqual([
                {name: 'access_tree', allowed: false},
                {name: 'detach', allowed: true},
                {name: 'edit_children', allowed: false} // Inherited from library
            ]);
            expect(resIsAllowedOnElement.data.errors).toBeUndefined();
        });
    });
});
