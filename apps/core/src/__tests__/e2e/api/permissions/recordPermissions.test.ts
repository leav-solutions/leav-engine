// Copyright LEAV Solutions 2017
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

describe('Records permissions', () => {
    const permTreeName = 'perm_tree_record_permissions';
    const permTreeLibName = 'perm_tree_lib_record_permissions';
    const testLibId = 'test_lib_record_permission';
    const testLibAttrId = 'test_attr_record_permission';

    let permTreeElemId: string;
    let permTreeElemIdForMultiVal1: string;
    let permTreeElemIdForMultiVal2: string;
    let adminsTreeElemId: string;

    let usersGroupRecordId: string;
    let usersGroupElemId: string;

    let testLibRecordId: string;
    let testLibRecordIdForMultival: string;

    let nodePermTreeElem: string;
    let nodePermTreeElemForMultival1: string;
    let nodePermTreeElemForMultival2: string;

    beforeAll(async () => {
        await gqlSaveLibrary(permTreeLibName, 'Test lib on permissions tree');

        await gqlSaveTree(permTreeName, 'Test', [permTreeLibName]);
        permTreeElemId = await gqlCreateRecord(permTreeLibName);
        permTreeElemIdForMultiVal1 = await gqlCreateRecord(permTreeLibName);
        permTreeElemIdForMultiVal2 = await gqlCreateRecord(permTreeLibName);

        nodePermTreeElem = await gqlAddElemToTree(permTreeName, {id: permTreeElemId, library: permTreeLibName});
        nodePermTreeElemForMultival1 = await gqlAddElemToTree(permTreeName, {
            id: permTreeElemIdForMultiVal1,
            library: permTreeLibName
        });
        nodePermTreeElemForMultival2 = await gqlAddElemToTree(permTreeName, {
            id: permTreeElemIdForMultiVal2,
            library: permTreeLibName
        });

        adminsTreeElemId = await gqlGetAdminsGroupNodeId();
        await gqlAddUserToGroup(adminsTreeElemId);

        // Add a group under admins group
        usersGroupRecordId = await gqlCreateRecord('users_groups');
        usersGroupElemId = await gqlAddElemToTree(
            'users_groups',
            {id: usersGroupRecordId, library: 'users_groups'},
            adminsTreeElemId
        );

        // Create library using permission tree
        await gqlSaveAttribute({
            id: testLibAttrId,
            label: 'Test Attr tree record permissions',
            type: AttributeTypes.TREE,
            linkedTree: permTreeName,
            multipleValues: true
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

        testLibRecordId = await gqlCreateRecord(testLibId);
        testLibRecordIdForMultival = await gqlCreateRecord(testLibId);

        // Save some values to link record to permissions tree:
        // - one for single value tests
        // - two for multiple values tests
        await makeGraphQlCall(`mutation {
            v1: saveValue(
                    library: "${testLibId}",
                    recordId: "${testLibRecordId}",
                    attribute: "${testLibAttrId}",
                    value: {payload: "${nodePermTreeElem}"}
                ) {
                    id_value
                },
            v2: saveValue(
                    library: "${testLibId}",
                    recordId: "${testLibRecordIdForMultival}",
                    attribute: "${testLibAttrId}",
                    value: {payload: "${nodePermTreeElemForMultival1}"}
                ) {
                    id_value
                },
            v3: saveValue(
                    library: "${testLibId}",
                    recordId: "${testLibRecordIdForMultival}",
                    attribute: "${testLibAttrId}",
                    value: {payload: "${nodePermTreeElemForMultival2}"}
                ) {
                    id_value
                }
        }`);
    });

    test('Save and apply permissions', async () => {
        // Save Permission
        const resSavePerm = await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                    type: record,
                    applyTo: "${testLibId}",
                    usersGroup: "${adminsTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", nodeId: "${nodePermTreeElem}"
                    },
                    actions: [
                        {name: access_record, allowed: true},
                        {name: edit_record, allowed: true},
                        {name: delete_record, allowed: false}
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

        const resGetPerm = await makeGraphQlCall(`{
            permissions(
                type: record,
                applyTo: "${testLibId}",
                usersGroup: "${adminsTreeElemId}",
                permissionTreeTarget: {
                    tree: "${permTreeName}", nodeId: "${nodePermTreeElem}"
                },
                actions: [access_record]
            ){
                name
                allowed
            }
        }`);

        expect(resGetPerm.status).toBe(200);
        expect(resGetPerm.data.data.permissions).toEqual([{name: 'access_record', allowed: true}]);
        expect(resGetPerm.data.errors).toBeUndefined();

        // Save library's permissions config
        const resSaveLib = await makeGraphQlCall(`mutation {
            saveLibrary(library: {
                id: "${testLibId}",
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

        expect(resSaveLib.status).toBe(200);
        expect(resSaveLib.data.data.saveLibrary.permissions_conf).toBeDefined();
        expect(resSaveLib.data.errors).toBeUndefined();

        const resIsAllowed = await makeGraphQlCall(`query {
            isAllowed(
                type: record,
                actions: [delete_record],
                applyTo: "${testLibId}",
                target: {recordId: "${testLibRecordId}"}
            ) {
                name
                allowed
            }
        }`);

        expect(resIsAllowed.status).toBe(200);
        expect(resIsAllowed.data.data.isAllowed).toBeDefined();
        expect(resIsAllowed.data.data.isAllowed[0].name).toBe('delete_record');
        expect(resIsAllowed.data.data.isAllowed[0].allowed).toBe(false);
        expect(resIsAllowed.data.errors).toBeUndefined();

        const resDelRecord = await makeGraphQlCall(`mutation {
            deleteRecord(library: "${testLibId}", id: "${testLibRecordId}") {id}
        }`);

        expect(resDelRecord.status).toBe(200);
        expect(resDelRecord.data.data).toBe(null);
        expect(resDelRecord.data.errors).toBeDefined();
        expect(resDelRecord.data.errors.length).toBeGreaterThanOrEqual(1);
    });

    test('Handle inheritance on subgroups', async () => {
        // Save a permission on the root of "perm tree" and admins group
        await makeGraphQlCall(`mutation {
            savePermission(
                permission: {
                    type: record,
                    applyTo: "${testLibId}",
                    usersGroup: "${adminsTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", nodeId: null
                    },
                    actions: [
                        {name: create_record, allowed: false}
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

        // Check permissions on first element of "perm tree": it should be inherited on admins group and its subgroup
        const resIsAllowed = await makeGraphQlCall(`query {
            inheritedOnAdmins: inheritedPermissions(
                type: record,
                applyTo: "${testLibId}",
                actions: [create_record],
                userGroupNodeId: "${adminsTreeElemId}",
                permissionTreeTarget: {
                    tree: "${permTreeName}", nodeId: "${nodePermTreeElem}"
                }
            ) { name allowed }
            inheritedOnSubgroup: inheritedPermissions(
                type: record,
                applyTo: "${testLibId}",
                actions: [create_record],
                userGroupNodeId: "${usersGroupElemId}",
                permissionTreeTarget: {
                    tree: "${permTreeName}", nodeId: "${nodePermTreeElem}"
                }
            ) { name allowed }
        }`);

        expect(resIsAllowed.status).toBe(200);
        expect(resIsAllowed.data.data.inheritedOnAdmins).toEqual([{name: 'create_record', allowed: false}]);
        expect(resIsAllowed.data.data.inheritedOnSubgroup).toEqual([{name: 'create_record', allowed: false}]);
    });

    test('Handle multivalues tree attributes', async () => {
        // We save 2 contradictory permissions (false and true) for the 2 values of our attributes
        // We expect to be allowed
        // Save Permission
        await makeGraphQlCall(`mutation {
            p1: savePermission(
                permission: {
                    type: record,
                    applyTo: "${testLibId}",
                    usersGroup: "${adminsTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", nodeId: "${nodePermTreeElemForMultival1}"
                    },
                    actions: [
                        {name: delete_record, allowed: false}
                    ]
                }
            ) { type },
            p2: savePermission(
                permission: {
                    type: record,
                    applyTo: "${testLibId}",
                    usersGroup: "${adminsTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", nodeId: "${nodePermTreeElemForMultival2}"
                    },
                    actions: [
                        {name: delete_record, allowed: true}
                    ]
                }
            ) { type }
        }`);

        const resIsAllowed = await makeGraphQlCall(`query {
            isAllowed(
                type: record,
                actions: [delete_record],
                applyTo: "${testLibId}",
                target: {recordId: "${testLibRecordIdForMultival}"}
            ) {
                name
                allowed
            }
        }`);

        expect(resIsAllowed.status).toBe(200);
        expect(resIsAllowed.data.data.isAllowed[0].name).toBe('delete_record');
        expect(resIsAllowed.data.data.isAllowed[0].allowed).toBe(true);
        expect(resIsAllowed.data.errors).toBeUndefined();
    });
});
