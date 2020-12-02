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
    const testLibAttrId = 'test_attr_permission';

    let permTreeElemId;
    let allUsersTreeElemId;
    let testLibRecordId;

    beforeAll(async () => {
        await gqlSaveLibrary(permTreeLibName, 'Test lib on permissions tree');

        await gqlSaveTree(permTreeName, 'Test', [permTreeLibName]);
        permTreeElemId = await gqlCreateRecord(permTreeLibName);

        await gqlAddElemToTree(permTreeName, {id: permTreeElemId, library: permTreeLibName});
        allUsersTreeElemId = await gqlGetAllUsersGroupId();
        await gqlAddUserToGroup(allUsersTreeElemId);

        // Create library using permission tree
        await gqlSaveAttribute({
            id: testLibAttrId,
            label: 'Test Attr tree record permissions',
            type: AttributeTypes.TREE,
            linkedTree: permTreeName
        });
        await gqlSaveLibrary(testLibId, 'Test lib using permissions', [testLibAttrId]);

        testLibRecordId = await gqlCreateRecord(testLibId);

        // Link this record to perm tree
        await makeGraphQlCall(`mutation {
            saveValue(library: "${testLibId}", recordId: "${testLibRecordId}", attribute: "${testLibAttrId}", value: {
                value: "${permTreeLibName}/${permTreeElemId}"
            }) {
                id_value
                value
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
});
