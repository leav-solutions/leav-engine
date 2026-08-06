import {AttributeType, PermissionsActions, PermissionsRelation, PermissionTypes} from '../../_gqlTypes';
import {adminUserSdk, e2eNonAdminGroupId, nonAdminUserSdk} from '../e2eUtils';

// Highlights a gap: createRecord (apps/core/src/domain/record/helpers/createRecord.ts) only checks
// the flat, library-level CREATE_RECORD permission. It never consults recordPermissionDomain, which
// is the only entry point able to evaluate a library's tree-based permission extension
// (permissions_conf). So a record can be created and classified under a tree node whose extension
// explicitly forbids create_record, even though the library-level permission alone would allow it.
describe('CreateRecordExtendedPermission', () => {
    const permTreeNodeLibName = 'create_record_ext_perm_node_lib';
    const permTreeName = 'create_record_ext_perm_tree';
    const testLibId = 'create_record_ext_perm_lib';
    const testLibTreeAttrId = 'create_record_ext_perm_attr';

    let allowedNodeRecordId: string;
    let deniedNodeRecordId: string;
    let allowedNodeId: string;
    let deniedNodeId: string;

    beforeAll(async () => {
        await adminUserSdk.SaveLibrary({library: {id: permTreeNodeLibName, label: {en: 'Perm tree node lib'}}});

        await adminUserSdk.SaveTree({
            tree: {
                id: permTreeName,
                label: {en: 'Perm tree'},
                libraries: [
                    {
                        library: permTreeNodeLibName,
                        settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: ['__all__']},
                    },
                ],
            },
        });

        const [allowedNodeRecord, deniedNodeRecord] = await Promise.all([
            adminUserSdk.CreateRecord({library: permTreeNodeLibName}),
            adminUserSdk.CreateRecord({library: permTreeNodeLibName}),
        ]);
        allowedNodeRecordId = allowedNodeRecord.createRecord.record.id;
        deniedNodeRecordId = deniedNodeRecord.createRecord.record.id;

        const [allowedElem, deniedElem] = await Promise.all([
            adminUserSdk.TreeAddElement({
                treeId: permTreeName,
                element: {id: allowedNodeRecordId, library: permTreeNodeLibName},
            }),
            adminUserSdk.TreeAddElement({
                treeId: permTreeName,
                element: {id: deniedNodeRecordId, library: permTreeNodeLibName},
            }),
        ]);
        allowedNodeId = allowedElem.treeAddElement.id;
        deniedNodeId = deniedElem.treeAddElement.id;

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: testLibTreeAttrId,
                label: {en: 'Test attr'},
                type: AttributeType.tree,
                linked_tree: permTreeName,
                multiple_values: false,
            },
        });

        // Library grants create_record to everybody (default), but its permission extension will
        // explicitly deny create_record on deniedNodeId
        await adminUserSdk.SaveLibrary({
            library: {
                id: testLibId,
                label: {en: 'Test lib'},
                attributes: [testLibTreeAttrId],
                permissions_conf: {permissionTreeAttributes: [testLibTreeAttrId], relation: PermissionsRelation.and},
            },
        });

        await adminUserSdk.SavePermission({
            permission: {
                type: PermissionTypes.record,
                applyTo: testLibId,
                usersGroup: e2eNonAdminGroupId(),
                permissionTreeTarget: {tree: permTreeName, nodeId: deniedNodeId},
                actions: [{name: PermissionsActions.create_record, allowed: false}],
            },
        });
    });

    afterAll(async () => {
        await Promise.all([
            adminUserSdk.DeleteRecord({library: permTreeNodeLibName, id: allowedNodeRecordId}),
            adminUserSdk.DeleteRecord({library: permTreeNodeLibName, id: deniedNodeRecordId}),
        ]);
        await adminUserSdk.DeleteLibrary({id: testLibId});
        await adminUserSdk.DeleteAttribute({id: testLibTreeAttrId});
        await adminUserSdk.DeleteTree({id: permTreeName});
        await adminUserSdk.DeleteLibrary({id: permTreeNodeLibName});
    });

    test('non-admin with library-level create permission can create a record with extended permission allowed', async () => {
        const {createRecord: result} = await nonAdminUserSdk.CreateRecord({
            library: testLibId,
            data: {values: [{attribute: testLibTreeAttrId, payload: allowedNodeId}]},
        });

        expect(result.record?.id).toEqual(expect.any(String));
        expect(result.valuesErrors ?? []).toHaveLength(0);
    });

    test('non-admin is denied creation when the extended permission forbids create_record', async () => {
        const {createRecord: result} = await nonAdminUserSdk.CreateRecord({
            library: testLibId,
            data: {values: [{attribute: testLibTreeAttrId, payload: deniedNodeId}]},
        });

        expect(result.record).toBeNull();
        expect(result.valuesErrors).toEqual(
            expect.arrayContaining([expect.objectContaining({message: expect.stringContaining('Action forbidden')})]),
        );
    });
});
