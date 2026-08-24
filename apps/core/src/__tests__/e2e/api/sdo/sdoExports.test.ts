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
    SDO_EXPORTS_DATE_RANGE_ATTRIBUTE_ID,
    SDO_EXPORTS_EMBEDDED_ATTRIBUTE_ID,
    SDO_EXPORTS_EXTENDED_LIBRARY_ID,
    SDO_EXPORTS_EXTENDED_VALUE_ATTRIBUTE_ID,
    SDO_EXPORTS_EXTEND_TRIGGER_LIBRARY_ID,
    SDO_EXPORTS_EXTEND_TRIGGER_LINK_ATTRIBUTE_ID,
    SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID,
    SDO_EXPORTS_COMPUTED_FUNCTION_CONFIG,
    SDO_EXPORTS_LINKED_LABEL_ATTRIBUTE_ID,
    SDO_EXPORTS_UNLABELLED_LIBRARY_ID,
    SDO_EXPORTS_UNLABELLED_LINK_ATTRIBUTE_ID,
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

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_LINKED_LABEL_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'SDO export test libellé lié', en: 'SDO export test linked label'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_EXPORTS_LINKED_LIBRARY_ID,
                label: {fr: 'Test SDO liée', en: 'Test SDO linked'},
                attributes: [SDO_EXPORTS_LINKED_LABEL_ATTRIBUTE_ID],
                // A real text label, so `toIDLabel` exports a label distinguishable from the id
                recordIdentityConf: {label: SDO_EXPORTS_LINKED_LABEL_ATTRIBUTE_ID},
            },
        });

        // No recordIdentityConf at all: covers `toIDLabel`'s fallback of the label on the leav id
        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_EXPORTS_UNLABELLED_LIBRARY_ID,
                label: {fr: 'Test SDO liée sans libellé', en: 'Test SDO linked without label'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_UNLABELLED_LINK_ATTRIBUTE_ID,
                type: AttributeType.advanced_link,
                linked_library: SDO_EXPORTS_UNLABELLED_LIBRARY_ID,
                multiple_values: true,
                label: {fr: 'SDO export test lien sans libellé', en: 'SDO export test unlabelled link'},
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

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_DATE_RANGE_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.date_range,
                label: {fr: 'SDO export test période', en: 'SDO export test date range'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_EMBEDDED_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.extended,
                label: {fr: 'SDO export test étendu', en: 'SDO export test extended'},
                embedded_fields: [
                    {
                        id: 'city',
                        format: AttributeFormat.extended,
                        embedded_fields: [{id: 'zipcode', format: AttributeFormat.text}],
                    },
                ],
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
                    SDO_EXPORTS_DATE_RANGE_ATTRIBUTE_ID,
                    SDO_EXPORTS_EMBEDDED_ATTRIBUTE_ID,
                    SDO_EXPORTS_UNLABELLED_LINK_ATTRIBUTE_ID,
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
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'SDO export extend unmapped', en: 'SDO export extend unmapped'},
            },
        });
        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_EXPORTS_EXTENDED_LIBRARY_ID,
                label: {fr: 'Test SDO étendu', en: 'Test SDO extended'},
                attributes: [SDO_EXPORTS_EXTENDED_VALUE_ATTRIBUTE_ID, SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID],
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

    const waitForSdoOf = (libraryId: string, recordUUID: string, timeoutMs = SDO_EXPORT_TIMER * 20): Promise<ISDO> =>
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

    test('several values saved at once are debounced into a single export carrying them all', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID); // CREATE export

        /**
         * `saveValueBatch` emits one VALUE_SAVE data event *per value*, all within one round trip: this
         * is the burst the export buffer has to collapse. Going through a batch rather than three
         * successive `SaveValue` calls keeps the events well inside the debounce window, which is what
         * makes the assertion stable.
         */
        await adminUserSdk.SaveValueBatch({
            library: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            values: [
                {attribute: SDO_EXPORTS_TEST_ATTRIBUTE_ID, payload: 'debounced'},
                {attribute: SDO_EXPORTS_ADVANCED_MONO_ATTRIBUTE_ID, payload: 'debounced_advanced'},
                {attribute: SDO_EXPORTS_ADVANCED_MULTI_ATTRIBUTE_ID, payload: 'debounced_multi'},
            ],
        });

        // The very first message must already carry the three values: one per event would mean the
        // first one only holds the first value.
        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            action: 'UPDATE',
            content: {
                info: {
                    value: 'debounced',
                    advancedMono: 'debounced_advanced',
                    advancedMulti: ['debounced_multi'],
                },
            },
        });

        // ...and it must be the only one: three exports of the same object would defeat the buffer
        await expect(waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID, SDO_EXPORT_TIMER * 8)).rejects.toThrow(
            'No matching message',
        );
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

    test('exports the "from" / "to" sub-fields of a period (date_range) attribute', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        const from = 1735689600; // 2025-01-01
        const to = 1767225600; // 2026-01-01

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_DATE_RANGE_ATTRIBUTE_ID,
            value: {payload: JSON.stringify({from, to})},
        });

        // Saving the carrier attribute must trigger the export, even though the mapping only
        // references its sub-fields
        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            action: 'UPDATE',
            content: {
                system: {systemId: recordUUID},
                info: {startDate: from, endDate: to},
            },
        });
    });

    test('exports a nested embedded field of an extended attribute', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_EMBEDDED_ATTRIBUTE_ID,
            value: {payload: JSON.stringify({city: {zipcode: '38000'}})},
        });

        const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

        expect(msg).toMatchObject({
            action: 'UPDATE',
            content: {
                system: {systemId: recordUUID},
                info: {zipcode: '38000'},
            },
        });
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

    test('additionalAttributeTriggers makes an unmapped attribute trigger an export', async () => {
        // SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID is in no sdoAttributes path: without
        // additionalAttributeTriggers, hasSDOAttribute would skip the event and nothing would be
        // emitted. The fakeplugin extend function reads it off the record into info.unmappedValue.
        const {createRecord: target} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_EXTENDED_LIBRARY_ID});
        const {uuid: targetUUID} = target.record;

        const createMsg = await waitForSdoOf(SDO_EXPORTS_EXTENDED_LIBRARY_ID, targetUUID);
        expect(createMsg).toMatchObject({action: 'CREATE', content: {info: {unmappedValue: null}}});

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_EXTENDED_LIBRARY_ID,
            recordId: target.record.id,
            attributeId: SDO_EXPORTS_EXTEND_UNMAPPED_ATTRIBUTE_ID,
            value: {payload: 'triggered by an unmapped attribute'},
        });

        const updateMsg = await waitForSdoOf(SDO_EXPORTS_EXTENDED_LIBRARY_ID, targetUUID);
        expect(updateMsg).toMatchObject({
            action: 'UPDATE',
            content: {
                system: {systemId: targetUUID},
                info: {unmappedValue: 'triggered by an unmapped attribute'},
            },
        });
    });

    test('an export mapping function builds a computed SDO path from its own config', async () => {
        // The `info.computed` mapping entry declares no leavAttributeId: the plugin function is still
        // called, receives the entry's exportFunctionConfig, and gets neither values nor attributeProps.
        const {createRecord: target} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_EXTENDED_LIBRARY_ID});
        const {uuid: targetUUID} = target.record;

        const msg = await waitForSdoOf(SDO_EXPORTS_EXTENDED_LIBRARY_ID, targetUUID);

        expect(msg).toMatchObject({
            content: {
                system: {systemId: targetUUID},
                info: {
                    computed: {
                        computedFrom: target.record.id,
                        config: SDO_EXPORTS_COMPUTED_FUNCTION_CONFIG,
                        hasValues: false,
                        hasAttributeProps: false,
                    },
                },
            },
        });
    });

    describe('toIDLabel — the native {id, label} export function (LEAVC-1106)', () => {
        /** A linked record plus the label value its library's record identity points at. */
        const _createLabelledLinkedRecord = async (label: string) => {
            const {createRecord: linked} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LINKED_LIBRARY_ID});
            await adminUserSdk.SaveValue({
                libraryId: SDO_EXPORTS_LINKED_LIBRARY_ID,
                recordId: linked.record.id,
                attributeId: SDO_EXPORTS_LINKED_LABEL_ATTRIBUTE_ID,
                value: {payload: label},
            });
            return linked.record;
        };

        test('exports a multivalued advanced link as an ordered array of {id, label}', async () => {
            const linkedA = await _createLabelledLinkedRecord('Status A');
            const linkedB = await _createLabelledLinkedRecord('Status B');

            const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
            const {id: recordId, uuid: recordUUID} = createRecord.record;

            const createMsg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);
            // No value on the attribute → empty array, not a missing path
            expect((createMsg.content as any).info?.advancedLinkMultiPairs).toEqual([]);

            await adminUserSdk.SaveValue({
                libraryId: SDO_EXPORTS_LIBRARY_ID,
                recordId,
                attributeId: SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                value: {payload: linkedA.id},
            });
            await adminUserSdk.SaveValue({
                libraryId: SDO_EXPORTS_LIBRARY_ID,
                recordId,
                attributeId: SDO_EXPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                value: {payload: linkedB.id},
            });

            const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

            expect((msg.content as any).info?.advancedLinkMultiPairs).toEqual(
                expect.arrayContaining([
                    {id: linkedA.uuid, label: 'Status A'},
                    {id: linkedB.uuid, label: 'Status B'},
                ]),
            );

            // Non-regression: the same attribute stays exported as a plain uuid array on its own path
            expect((msg.content as any).info?.advancedLinkMulti).toEqual(
                expect.arrayContaining([linkedA.uuid, linkedB.uuid]),
            );
        });

        test('exports a multivalued tree attribute as {id, label} of the entity carried by each node', async () => {
            const linkedA = await _createLabelledLinkedRecord('Node A');
            const linkedB = await _createLabelledLinkedRecord('Node B');
            const {treeAddElement: nodeA} = await adminUserSdk.TreeAddElement({
                treeId: SDO_EXPORTS_TREE_ID,
                element: {id: linkedA.id, library: SDO_EXPORTS_LINKED_LIBRARY_ID},
            });
            const {treeAddElement: nodeB} = await adminUserSdk.TreeAddElement({
                treeId: SDO_EXPORTS_TREE_ID,
                element: {id: linkedB.id, library: SDO_EXPORTS_LINKED_LIBRARY_ID},
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

            // The uuids are those of the records, never of the tree nodes (nodeA.id / nodeB.id)
            expect((msg.content as any).info?.treeMultiPairs).toEqual(
                expect.arrayContaining([
                    {id: linkedA.uuid, label: 'Node A'},
                    {id: linkedB.uuid, label: 'Node B'},
                ]),
            );
        });

        test('exports a single-valued link as one {id, label} object', async () => {
            const linked = await _createLabelledLinkedRecord('The one status');

            const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
            const {id: recordId, uuid: recordUUID} = createRecord.record;

            const createMsg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);
            // No value on a single-valued attribute → no value exported
            expect((createMsg.content as any).info?.simpleLinkPair).toBeNull();

            await adminUserSdk.SaveValue({
                libraryId: SDO_EXPORTS_LIBRARY_ID,
                recordId,
                attributeId: SDO_EXPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
                value: {payload: linked.id},
            });

            const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

            expect((msg.content as any).info?.simpleLinkPair).toEqual({
                id: linked.uuid,
                label: 'The one status',
            });
            // Same attribute, still exported as a bare uuid on its own SDO path
            expect((msg.content as any).info?.simpleLink).toBe(linked.uuid);
        });

        test('falls back on the leav id when the target library configures no label', async () => {
            const {createRecord: unlabelled} = await adminUserSdk.CreateRecord({
                library: SDO_EXPORTS_UNLABELLED_LIBRARY_ID,
            });

            const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
            const {id: recordId, uuid: recordUUID} = createRecord.record;

            await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

            await adminUserSdk.SaveValue({
                libraryId: SDO_EXPORTS_LIBRARY_ID,
                recordId,
                attributeId: SDO_EXPORTS_UNLABELLED_LINK_ATTRIBUTE_ID,
                value: {payload: unlabelled.record.id},
            });

            const msg = await waitForSdoOf(SDO_EXPORTS_LIBRARY_ID, recordUUID);

            expect((msg.content as any).info?.unlabelledPairs).toEqual([
                {id: unlabelled.record.uuid, label: unlabelled.record.id},
            ]);
        });
    });

    // Unlink/relink of a trigger attribute is a known limitation: resolution reads the CURRENT DB
    // state, so the OLD target is no longer reachable and won't be re-exported (possible follow-up
    // ticket via dataEvent.payload.before).
});
