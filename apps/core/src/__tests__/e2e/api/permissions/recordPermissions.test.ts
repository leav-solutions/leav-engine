// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

describe('Records permissions', () => {
    const permTreeName = 'perm_tree_record_permissions';
    const permTreeLibName = 'perm_tree_lib_record_permissions';
    const testLibId = 'test_lib_record_permission';
    const testLibAttrId = 'test_attr_record_permission';

    let permTreeElemId;
    let permTreeElemIdForMultiVal1;
    let permTreeElemIdForMultiVal2;
    let allUsersTreeElemId;

    let testLibRecordId;
    let testLibRecordIdForMultival;

    beforeAll(async () => {
        await gqlSaveLibrary(permTreeLibName, 'Test lib on permissions tree');

        await gqlSaveTree(permTreeName, 'Test', [permTreeLibName]);
        permTreeElemId = await gqlCreateRecord(permTreeLibName);
        permTreeElemIdForMultiVal1 = await gqlCreateRecord(permTreeLibName);
        permTreeElemIdForMultiVal2 = await gqlCreateRecord(permTreeLibName);

        await gqlAddElemToTree(permTreeName, {id: permTreeElemId, library: permTreeLibName});
        await gqlAddElemToTree(permTreeName, {id: permTreeElemIdForMultiVal1, library: permTreeLibName});
        await gqlAddElemToTree(permTreeName, {id: permTreeElemIdForMultiVal2, library: permTreeLibName});

        allUsersTreeElemId = await gqlGetAllUsersGroupId();
        await gqlAddUserToGroup(allUsersTreeElemId);

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
        await makeGraphQlCall('mutation { refreshSchema }');

        testLibRecordId = await gqlCreateRecord(testLibId);
        testLibRecordIdForMultival = await gqlCreateRecord(testLibId);

        // Save some values to link record to permissions tree:
        // - one for single value tests
        // - two for multiple values tests
        await makeGraphQlCall(`mutation {
            v1: saveValue(library: "${testLibId}", recordId: "${testLibRecordId}", attribute: "${testLibAttrId}", value: {
                    value: "${permTreeLibName}/${permTreeElemId}"
                }) {
                    id_value
                },
            v2: saveValue(
                    library: "${testLibId}",
                    recordId: "${testLibRecordIdForMultival}",
                    attribute: "${testLibAttrId}",
                    value: {
                        value: "${permTreeLibName}/${permTreeElemIdForMultiVal1}"
                    }
                ) {
                    id_value
                },
            v3: saveValue(
                    library: "${testLibId}",
                    recordId: "${testLibRecordIdForMultival}",
                    attribute: "${testLibAttrId}",
                    value: {
                        value: "${permTreeLibName}/${permTreeElemIdForMultiVal2}"
                    }
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
                    usersGroup: "${allUsersTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"
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
                    library
                    id
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
                usersGroup: "${allUsersTreeElemId}",
                permissionTreeTarget: {
                    tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemId}"
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
            deleteRecord(library: "${testLibId}", id: "${testLibRecordId}") {
                id
            }
        }`);

        expect(resDelRecord.status).toBe(200);
        expect(resDelRecord.data.data).toBe(null);
        expect(resDelRecord.data.errors).toBeDefined();
        expect(resDelRecord.data.errors.length).toBeGreaterThanOrEqual(1);
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
                    usersGroup: "${allUsersTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemIdForMultiVal1}"
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
                    usersGroup: "${allUsersTreeElemId}",
                    permissionTreeTarget: {
                        tree: "${permTreeName}", library: "${permTreeLibName}", id: "${permTreeElemIdForMultiVal2}"
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
