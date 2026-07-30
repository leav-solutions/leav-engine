import {type ISDO} from '../../../../_types/sdo';
import {adminUserSdk, e2eNonAdminUser, nonAdminUserSdk} from '../e2eUtils';
import {RabbitMqClient} from './rabbitMQUtils';
import {
    SDO_EXPORT_TIMER,
    sdoGlobalSettings,
    SDO_EXPORTS_LIBRARY_ID,
    SDO_EXPORTS_TEST_ATTRIBUTE_ID,
    SDO_EXPORTS_LINKED_LIBRARY_ID,
    SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
    SDO_EXPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
    SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
    SDO_EXPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
    SDO_EXPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
    SDO_EXPORTS_TREE_ID,
    SDO_EXPORTS_TREE_MONO_ATTRIBUTE_ID,
    SDO_EXPORTS_TREE_MULTI_ATTRIBUTE_ID,
    SDO_EXPORTS_EXTENDED_LIBRARY_ID,
    SDO_EXPORTS_EXTENDED_VALUE_ATTRIBUTE_ID,
    SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID,
    SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID,
} from './sdoConfig';
import {getConfig} from '../../../../config';
import {type IConfig} from '../../../../_types/config';
import {AttributeFormat, AttributeType} from '../../_gqlTypes';
import {SystemLibraries} from '../../../../_constants/systemLibraries';
import {UsersAttributes} from '../../../../_constants/systemAttributes';

const rabbitmqClient = new RabbitMqClient();

const TEST_GET_EXPORT_MSG_QUEUE = 'test_get_export_queue';

describe('SDO Exports', () => {
    let conf: IConfig;

    beforeAll(async () => {
        conf = await getConfig();

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_TEST_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'SDO export test value', en: 'SDO export test value'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_EXPORTS_LINKED_LIBRARY_ID,
                label: {fr: 'Test SDO liée', en: 'Test SDO linked'},
                recordIdentityConf: {label: 'id'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
                type: AttributeType.simple_link,
                linked_library: SDO_EXPORTS_LINKED_LIBRARY_ID,
                label: {fr: 'SDO export test simple link', en: 'SDO export test simple link'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
                type: AttributeType.advanced_link,
                linked_library: SDO_EXPORTS_LINKED_LIBRARY_ID,
                label: {fr: 'SDO export test advanced link mono', en: 'SDO export test advanced link mono'},
                multiple_values: false,
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                type: AttributeType.advanced_link,
                linked_library: SDO_EXPORTS_LINKED_LIBRARY_ID,
                multiple_values: true,
                label: {fr: 'SDO export test advanced link multi', en: 'SDO export test advanced link multi'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
                type: AttributeType.advanced,
                format: AttributeFormat.text,
                label: {fr: 'SDO export test advanced mono', en: 'SDO export test advanced mono'},
                multiple_values: false,
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
                type: AttributeType.advanced,
                format: AttributeFormat.text,
                multiple_values: true,
                label: {fr: 'SDO export test advanced multi', en: 'SDO export test advanced multi'},
            },
        });

        await adminUserSdk.SaveTree({
            tree: {
                id: SDO_EXPORTS_TREE_ID,
                label: {fr: 'SDO export test tree', en: 'SDO export test tree'},
                libraries: [
                    {
                        library: SDO_EXPORTS_LINKED_LIBRARY_ID,
                        settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: []},
                    },
                ],
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_TREE_MONO_ATTRIBUTE_ID,
                type: AttributeType.tree,
                linked_tree: SDO_EXPORTS_TREE_ID,
                label: {fr: 'SDO export test tree mono', en: 'SDO export test tree mono'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_TREE_MULTI_ATTRIBUTE_ID,
                type: AttributeType.tree,
                linked_tree: SDO_EXPORTS_TREE_ID,
                multiple_values: true,
                label: {fr: 'SDO export test tree multi', en: 'SDO export test tree multi'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_EXPORTS_LIBRARY_ID,
                label: {fr: 'Test SDO', en: 'Test SDO'},
                attributes: [
                    SDO_EXPORTS_TEST_ATTRIBUTE_ID,
                    SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
                    SDO_EXPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
                    SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                    SDO_EXPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
                    SDO_EXPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
                    SDO_EXPORTS_TREE_MONO_ATTRIBUTE_ID,
                    SDO_EXPORTS_TREE_MULTI_ATTRIBUTE_ID,
                ],
                recordIdentityConf: {label: 'id'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_EXTENDED_VALUE_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'SDO export extended value', en: 'SDO export extended value'},
            },
        });
        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_EXPORTS_EXTENDED_LIBRARY_ID,
                label: {fr: 'Test SDO étendu', en: 'Test SDO extended'},
                attributes: [SDO_EXPORTS_EXTENDED_VALUE_ATTRIBUTE_ID],
                recordIdentityConf: {label: 'id'},
            },
        });
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID,
                type: AttributeType.simple_link,
                linked_library: SDO_EXPORTS_EXTENDED_LIBRARY_ID,
                label: {fr: 'SDO export extend trigger link', en: 'SDO export extend trigger link'},
            },
        });
        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID,
                label: {fr: 'Test SDO extend trigger', en: 'Test SDO extend trigger'},
                attributes: [SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID],
                recordIdentityConf: {label: 'id'},
            },
        });

        await adminUserSdk.SaveGlobalSettings({
            settings: {
                settings: {
                    sdo: sdoGlobalSettings,
                },
            },
        });

        await rabbitmqClient.connect();
        await rabbitmqClient.assertExchangeAndBindQueue(
            TEST_GET_EXPORT_MSG_QUEUE,
            conf.sdo.exchange,
            conf.sdo.exchangeType,
        );
    });

    afterAll(async () => {
        await rabbitmqClient.close();
    });

    beforeEach(async () => {
        await rabbitmqClient.purgeQueue(TEST_GET_EXPORT_MSG_QUEUE);
    });

    const waitForSdoOf = (libraryId: string, recordUUID: string, timeoutMs = SDO_EXPORT_TIMER * 10): Promise<ISDO> =>
        rabbitmqClient.waitForMessage<ISDO>(
            TEST_GET_EXPORT_MSG_QUEUE,
            m => m.name === libraryId && String((m.content as any).system?.systemId) === recordUUID,
            timeoutMs,
        );

    test('create a record triggers a CREATE export message', async () => {
        const {createRecord} = await nonAdminUserSdk.CreateRecord({
            library: SDO_EXPORTS_LIBRARY_ID,
        });

        const {id: recordId, uuid: recordUUID} = createRecord.record;
        const nonAdminUserUUID = e2eNonAdminUser().userUUID;

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            name: SDO_EXPORTS_LIBRARY_ID,
            dataModelRelease: 'dataModelRelease',
            date: expect.any(Number),
            action: 'CREATE',
            clientId: conf.sdo.clientId,
            content: {
                system: {
                    systemId: recordUUID,
                    systemActive: true,
                    systemCreationDate: expect.any(Number),
                    systemLastModifiedDate: expect.any(Number),
                    systemLabel: recordId,
                    systemCreator: nonAdminUserUUID,
                    systemLastModificator: nonAdminUserUUID,
                    // Application traceability (LEAVC-871): clientId from config, applicationIds carries leav's own entry
                    applicationIds: {[conf.sdo.applicationName]: recordId},
                    // No stored creator clientId on a freshly created record → falls back to config.sdo.clientId
                    systemCreatorClientId: conf.sdo.clientId,
                    systemLastModificatorClientId: conf.sdo.clientId,
                },
            },
        });
    });

    test('does not export a record while it is in creation, and exports it once activated', async () => {
        const {createRecord} = await nonAdminUserSdk.CreateRecord({
            library: SDO_EXPORTS_LIBRARY_ID,
            skipActivate: true,
        });

        const {id: recordId, uuid: recordUUID} = createRecord.record;
        const nonAdminUserUUID = e2eNonAdminUser().userUUID;

        await expect(waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID, SDO_EXPORT_TIMER * 4)).rejects.toThrow();

        await nonAdminUserSdk.ActivateNewRecord({library: SDO_EXPORTS_LIBRARY_ID, recordId});

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            name: SDO_EXPORTS_LIBRARY_ID,
            dataModelRelease: 'dataModelRelease',
            date: expect.any(Number),
            action: 'UPDATE', // dont care because of delta sdo will come soon
            clientId: conf.sdo.clientId,
            content: {
                system: {
                    systemId: recordUUID,
                    systemActive: true,
                    systemCreator: nonAdminUserUUID,
                    systemLastModificator: nonAdminUserUUID,
                },
            },
        });
    });

    test('exports a nested attribute path (modified_by.email) in the SDO content', async () => {
        // CREATE always triggers an export, regardless of hasSDOAttribute's exact-match limitation on
        // path-based leavAttributeId (see UPDATE trigger caveat noted in the plan/CLAUDE.md).
        const {createRecord} = await adminUserSdk.CreateRecord({
            library: SDO_EXPORTS_LIBRARY_ID,
        });
        const {uuid: recordUUID} = createRecord.record;

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        const {records} = await adminUserSdk.GetRecordByUUID({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordUUID,
            retrieveInactive: false,
        });
        const editorId = records.list[0].modified_by[0].payload.id;

        const {records: userRecords} = await adminUserSdk.GetRecordByIdStandardValuesProperty({
            libraryId: SystemLibraries.USERS,
            recordId: editorId,
            attributeId: UsersAttributes.EMAIL,
        });
        const editorEmail = userRecords.list[0].property[0].payload;

        expect(editorEmail).toEqual(expect.any(String));
        expect((msg.content as any).info?.editorEmail).toBe(editorEmail);
    });

    test('updating the mapped attribute triggers an UPDATE export message with the new content', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID); // wait for the CREATE export before triggering an update

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TEST_ATTRIBUTE_ID,
            value: {payload: 'v1'},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            name: SDO_EXPORTS_LIBRARY_ID,
            action: 'UPDATE',
            content: {
                system: {systemId: recordUUID},
                info: {value: 'v1'},
            },
        });
    });

    test('saving the same attribute value again does not trigger a new export (content unchanged)', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID); // CREATE export

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TEST_ATTRIBUTE_ID,
            value: {payload: 'v1'},
        });
        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID); // first UPDATE export, content now has info.value === 'v1'

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TEST_ATTRIBUTE_ID,
            value: {payload: 'v1'},
        });

        await expect(waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID, SDO_EXPORT_TIMER * 4)).rejects.toThrow();
    });

    test('deactivating a record triggers an UPDATE export message with systemActive: false', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID); // wait for the CREATE export before deactivating

        await adminUserSdk.DeactivateRecords({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordsIds: [recordId],
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            name: SDO_EXPORTS_LIBRARY_ID,
            action: 'UPDATE',
            content: {
                system: {systemId: recordUUID, systemActive: false},
            },
        });
    });

    test('exports a simple link attribute value as the linked record UUID', async () => {
        const {createRecord: linked} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LINKED_LIBRARY_ID});
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
            value: {payload: linked.record.id},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            action: 'UPDATE',
            content: {
                system: {systemId: recordUUID},
                info: {simpleLink: linked.record.uuid},
            },
        });
    });

    test('exports an advanced link mono attribute value as the linked record UUID', async () => {
        const {createRecord: linked} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LINKED_LIBRARY_ID});
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
            value: {payload: linked.record.id},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            action: 'UPDATE',
            content: {
                system: {systemId: recordUUID},
                info: {advancedLinkMono: linked.record.uuid},
            },
        });
    });

    test('exports an advanced link multiple attribute as an array of linked records UUIDs', async () => {
        const {createRecord: linkedA} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LINKED_LIBRARY_ID});
        const {createRecord: linkedB} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LINKED_LIBRARY_ID});
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
            value: {payload: linkedA.record.id},
        });
        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
            value: {payload: linkedB.record.id},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect((msg.content as any).info?.advancedLinkMulti).toEqual(
            expect.arrayContaining([linkedA.record.uuid, linkedB.record.uuid]),
        );
    });

    test('exports a standard advanced mono attribute value', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
            value: {payload: 'advanced-v1'},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            action: 'UPDATE',
            content: {
                system: {systemId: recordUUID},
                info: {advancedMono: 'advanced-v1'},
            },
        });
    });

    test('exports a standard advanced multiple attribute as an array of values', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
            value: {payload: 'advanced-a'},
        });
        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
            value: {payload: 'advanced-b'},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect((msg.content as any).info?.advancedMulti).toEqual(expect.arrayContaining(['advanced-a', 'advanced-b']));
    });

    test('exports a tree mono attribute value as the linked record UUID', async () => {
        const {createRecord: linked} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LINKED_LIBRARY_ID});
        const {treeAddElement: treeElement} = await adminUserSdk.TreeAddElement({
            treeId: SDO_EXPORTS_TREE_ID,
            element: {id: linked.record.id, library: SDO_EXPORTS_LINKED_LIBRARY_ID},
        });

        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TREE_MONO_ATTRIBUTE_ID,
            value: {payload: treeElement.id},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            action: 'UPDATE',
            content: {
                system: {systemId: recordUUID},
                info: {treeMono: linked.record.uuid},
            },
        });
    });

    test('exports a tree multiple attribute as an array of linked records UUIDs', async () => {
        const {createRecord: linkedA} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LINKED_LIBRARY_ID});
        const {createRecord: linkedB} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LINKED_LIBRARY_ID});
        const {treeAddElement: nodeA} = await adminUserSdk.TreeAddElement({
            treeId: SDO_EXPORTS_TREE_ID,
            element: {id: linkedA.record.id, library: SDO_EXPORTS_LINKED_LIBRARY_ID},
        });
        const {treeAddElement: nodeB} = await adminUserSdk.TreeAddElement({
            treeId: SDO_EXPORTS_TREE_ID,
            element: {id: linkedB.record.id, library: SDO_EXPORTS_LINKED_LIBRARY_ID},
        });

        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TREE_MULTI_ATTRIBUTE_ID,
            value: {payload: nodeA.id},
        });
        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TREE_MULTI_ATTRIBUTE_ID,
            value: {payload: nodeB.id},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect((msg.content as any).info?.treeMulti).toEqual(
            expect.arrayContaining([linkedA.record.uuid, linkedB.record.uuid]),
        );
    });

    test('a plugin extend SDO function extends the content, making an additionalLibraryTrigger observable', async () => {
        // Bare resolution of additionalLibraryTriggers is covered by integration
        // (getSDOExportTargets.test.ts). Here we exercise the plugin extend SDO function: the
        // fakeplugin aggregates trigger records into info.triggeredBy, so linking a trigger record
        // genuinely changes the target's content and the re-export survives sendSDO's dedup.
        const {createRecord: target} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_EXTENDED_LIBRARY_ID});
        const {uuid: targetUUID} = target.record;

        const createMsg = await waitForSdoOf(SDO_EXPORTS_EXTENDED_LIBRARY_ID, targetUUID);
        // No trigger yet: the plugin function aggregates an empty list.
        expect(createMsg).toMatchObject({
            action: 'CREATE',
            content: {system: {systemId: targetUUID}, info: {triggeredBy: []}},
        });

        const {createRecord: trigger} = await adminUserSdk.CreateRecord({
            library: SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID,
        });
        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID,
            recordId: trigger.record.id,
            attributeId: SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID,
            value: {payload: target.record.id},
        });

        // additionalLibraryTriggers re-exports the target; the plugin function now aggregates the
        // linked trigger record → content changes → export is emitted (not deduped).
        const updateMsg = await waitForSdoOf(SDO_EXPORTS_EXTENDED_LIBRARY_ID, targetUUID);
        expect(updateMsg).toMatchObject({
            action: 'UPDATE',
            content: {system: {systemId: targetUUID}, info: {triggeredBy: [trigger.record.uuid]}},
        });
    });

    // Unlink/relink of a trigger attribute is a known limitation: resolution reads the CURRENT DB
    // state, so the OLD target is no longer reachable and won't be re-exported (possible follow-up
    // ticket via dataEvent.payload.before).
});
