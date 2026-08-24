import {type ISDO} from '../../../../_types/sdo';
import {getConfig} from '../../../../config';
import {RabbitMqClient} from './rabbitMQUtils';
import {type IConfig} from '../../../../_types/config';
import {adminUserSdk} from '../e2eUtils';
import {
    SDO_EXPORT_TIMER,
    SDO_IMPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
    SDO_IMPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
    SDO_IMPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
    SDO_IMPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
    SDO_IMPORTS_DATE_RANGE_ATTRIBUTE_ID,
    SDO_IMPORTS_DISABLED_LIBRARY_ID,
    SDO_IMPORTS_LIBRARY_ID,
    SDO_IMPORTS_LINKED_LABEL_ATTRIBUTE_ID,
    SDO_IMPORTS_LINKED_LIBRARY_ID,
    SDO_IMPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
    SDO_IMPORTS_TREE_ID,
    SDO_IMPORTS_TREE_MONO_ATTRIBUTE_ID,
    SDO_IMPORTS_TREE_MULTI_ATTRIBUTE_ID,
    SDO_TEST_ATTRIBUTE_ID,
    SDO_TEST_SKIPPED_ATTRIBUTE_ID,
    sdoGlobalSettings,
} from './sdoConfig';
import {AttributeFormat, AttributeType} from '../../_gqlTypes';
import {SdoAttributes} from '../../../../_constants/systemAttributes';

/**
 * Bound on the SDO exchange to observe what leav *exports*, so an import can be checked not to echo
 * one back (see the "no export loop" suite). Own queue: the export suite's one must keep receiving
 * everything it expects.
 */
const SDO_IMPORTS_EXPORT_MSG_QUEUE = 'test_sdo_imports_export_queue';

/**
 * How long to wait before concluding that no export was emitted.
 *
 * When the wait starts the import has already completed, so only the debounce window
 * (`SDO_EXPORT_TIMER`, 500ms here) and the publish remain — a full export round-trip measures ~800ms
 * end to end on this suite. 8x the debounce leaves ~5x that margin: unlike the fixed waits below,
 * being too short here shows up as a flaky red under load, so the margin is worth its 4 seconds.
 */
const NO_EXPORT_TIMEOUT_MS = SDO_EXPORT_TIMER * 8;

describe('SDO Imports', () => {
    let conf: IConfig;
    let rabbitmqClient: RabbitMqClient;

    /**
     * The generic SDO schema requires the whole `system` bookkeeping block, so every document has to
     * carry it. `systemSdoHash` is deliberately absent: it was dropped by the V2 format (LEAVC-872).
     */
    const _content = (
        systemId: string,
        info: Record<string, unknown> = {},
        system: Record<string, unknown> = {},
    ): ISDO['content'] => {
        const nowSec = Math.round(Date.now() / 1000); // in seconds
        const editorUUID = crypto.randomUUID();

        return {
            system: {
                systemId,
                systemActive: true,
                systemCreationDate: nowSec,
                systemLastModifiedDate: nowSec,
                systemCreator: editorUUID,
                systemLastModificator: editorUUID,
                systemLabel: 'SDO import label',
                ...system,
            },
            identifier: {},
            info,
        };
    };

    const _sdo = (overrides: Partial<ISDO> = {}): ISDO => ({
        name: SDO_IMPORTS_LIBRARY_ID,
        dataModelRelease: 'dataModelRelease',
        date: Math.round(Date.now() / 1000), // in seconds
        action: 'CREATE',
        content: _content(crypto.randomUUID()),
        ...overrides,
    });

    const _publish = (sdo: unknown) => rabbitmqClient.publishToExchange(conf.sdo.exchange, sdo);

    /**
     * No positive event to wait for when a message must be rejected or ignored, so the assertion is
     * "nothing happened" after a fixed delay. The SDO_IMPORT_ERROR event is not an alternative:
     * reading it back needs Elasticsearch, absent from the e2e services.
     *
     * ⚠️ Too short a delay does not fail this kind of test, it makes it pass vacuously — so the value
     * is calibrated, not guessed: a nominal import completes in ~250-500ms here (see the positive
     * tests' own durations), and 2500ms is ~10x that, or ~5x a pessimistic CI.
     */
    const _waitForProcessing = () => new Promise(resolve => setTimeout(resolve, 2500));

    const _findRecords = async (recordUUID: string, libraryId = SDO_IMPORTS_LIBRARY_ID) =>
        (
            await adminUserSdk.GetRecordByUUID({
                libraryId,
                recordUUID,
                retrieveInactive: true,
            })
        ).records.list;

    /**
     * Waits for the import to have *completed*, and hands back the imported record.
     *
     * Waiting on activation rather than on the record's mere existence is what makes the assertions
     * that follow reliable: `recordDomain.createRecord` inserts the record inactive, writes its values,
     * and only then activates it. A record found before that last step has no value yet — and is not
     * even answered by a query that does not ask for inactive records.
     */
    const _waitForRecord = (recordUUID: string) =>
        vi.waitFor(
            async () => {
                const record = (await _findRecords(recordUUID))[0];

                expect(record?.uuid).toBe(recordUUID);
                expect(record.active).toBe(true);

                return record;
            },
            {timeout: 5000, interval: 250},
        );

    const _getStandardValues = async (recordId: string, attributeId: string) =>
        (
            await adminUserSdk.GetRecordByIdStandardValuesProperty({
                libraryId: SDO_IMPORTS_LIBRARY_ID,
                recordId,
                attributeId,
            })
        ).records.list[0].property;

    /**
     * A simple attribute with no stored value answers a single value with a null payload, hence the
     * optional chaining rather than a plain index access.
     */
    const _getStandardValue = async (recordId: string, attributeId: string) =>
        (await _getStandardValues(recordId, attributeId))[0]?.payload ?? null;

    const _getLinkValues = async (recordId: string, attributeId: string) =>
        (
            await adminUserSdk.GetRecordByIdLinkValuesProperty({
                libraryId: SDO_IMPORTS_LIBRARY_ID,
                recordId,
                attributeId,
            })
        ).records.list[0].property;

    const _getTreeValues = async (recordId: string, attributeId: string) =>
        (
            await adminUserSdk.GetRecordByIdTreeValuesProperty({
                libraryId: SDO_IMPORTS_LIBRARY_ID,
                recordId,
                attributeId,
            })
        ).records.list[0].property;

    /** A record of the linked library, identified by the uuid an incoming SDO would reference */
    const _createLinkedRecord = async (label: string) => {
        const {createRecord} = await adminUserSdk.CreateRecord({
            library: SDO_IMPORTS_LINKED_LIBRARY_ID,
            data: {values: [{attribute: SDO_IMPORTS_LINKED_LABEL_ATTRIBUTE_ID, payload: label}]},
        });

        return {id: createRecord.record!.id, uuid: createRecord.record!.uuid};
    };

    /** Same, plus its position in the test tree: an incoming SDO references the record, not the node */
    const _createTreeNode = async (label: string) => {
        const {id: recordId, uuid: recordUuid} = await _createLinkedRecord(label);
        const {treeAddElement} = await adminUserSdk.TreeAddElement({
            treeId: SDO_IMPORTS_TREE_ID,
            element: {id: recordId, library: SDO_IMPORTS_LINKED_LIBRARY_ID},
        });

        // Named after what they are: an SDO references the *record*, leav stores the *node*
        return {recordId, recordUuid, nodeId: treeAddElement.id};
    };

    beforeAll(async () => {
        conf = await getConfig();
        rabbitmqClient = new RabbitMqClient();

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_TEST_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'SDO test value', en: 'SDO test value'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_TEST_SKIPPED_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'SDO test skipped value', en: 'SDO test skipped value'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_LINKED_LABEL_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'SDO import test libellé lié', en: 'SDO import test linked label'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_IMPORTS_LINKED_LIBRARY_ID,
                label: {fr: 'Test SDO import liée', en: 'Test SDO import linked'},
                attributes: [SDO_IMPORTS_LINKED_LABEL_ATTRIBUTE_ID],
                recordIdentityConf: {label: SDO_IMPORTS_LINKED_LABEL_ATTRIBUTE_ID},
            },
        });

        // A single library in the tree: the import resolves the referenced record's uuid to the node
        // carrying it, which is only unambiguous on a single-library tree.
        await adminUserSdk.SaveTree({
            tree: {
                id: SDO_IMPORTS_TREE_ID,
                label: {fr: 'SDO import test tree', en: 'SDO import test tree'},
                libraries: [
                    {
                        library: SDO_IMPORTS_LINKED_LIBRARY_ID,
                        settings: {allowMultiplePositions: false, allowedAtRoot: true, allowedChildren: []},
                    },
                ],
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
                type: AttributeType.simple_link,
                linked_library: SDO_IMPORTS_LINKED_LIBRARY_ID,
                label: {fr: 'SDO import test simple link', en: 'SDO import test simple link'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
                type: AttributeType.advanced_link,
                linked_library: SDO_IMPORTS_LINKED_LIBRARY_ID,
                multiple_values: false,
                label: {fr: 'SDO import test advanced link mono', en: 'SDO import test advanced link mono'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                type: AttributeType.advanced_link,
                linked_library: SDO_IMPORTS_LINKED_LIBRARY_ID,
                multiple_values: true,
                label: {fr: 'SDO import test advanced link multi', en: 'SDO import test advanced link multi'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
                type: AttributeType.advanced,
                format: AttributeFormat.text,
                multiple_values: false,
                label: {fr: 'SDO import test advanced mono', en: 'SDO import test advanced mono'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
                type: AttributeType.advanced,
                format: AttributeFormat.text,
                multiple_values: true,
                label: {fr: 'SDO import test advanced multi', en: 'SDO import test advanced multi'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_TREE_MONO_ATTRIBUTE_ID,
                type: AttributeType.tree,
                linked_tree: SDO_IMPORTS_TREE_ID,
                multiple_values: false,
                label: {fr: 'SDO import test tree mono', en: 'SDO import test tree mono'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_TREE_MULTI_ATTRIBUTE_ID,
                type: AttributeType.tree,
                linked_tree: SDO_IMPORTS_TREE_ID,
                multiple_values: true,
                label: {fr: 'SDO import test tree multi', en: 'SDO import test tree multi'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: SDO_IMPORTS_DATE_RANGE_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.date_range,
                label: {fr: 'SDO import test période', en: 'SDO import test date range'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_IMPORTS_LIBRARY_ID,
                label: {fr: 'Test SDO', en: 'Test SDO'},
                attributes: [
                    'label',
                    SDO_TEST_ATTRIBUTE_ID,
                    SDO_TEST_SKIPPED_ATTRIBUTE_ID,
                    SDO_IMPORTS_SIMPLE_LINK_ATTRIBUTE_ID,
                    SDO_IMPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID,
                    SDO_IMPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID,
                    SDO_IMPORTS_ADVANCED_MONO_ATTRIBUTE_ID,
                    SDO_IMPORTS_ADVANCED_MULTI_ATTRIBUTE_ID,
                    SDO_IMPORTS_TREE_MONO_ATTRIBUTE_ID,
                    SDO_IMPORTS_TREE_MULTI_ATTRIBUTE_ID,
                    SDO_IMPORTS_DATE_RANGE_ATTRIBUTE_ID,
                ],
                recordIdentityConf: {label: 'label'},
            },
        });

        // Mapped without `importEnable`: nothing must ever land in it
        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_IMPORTS_DISABLED_LIBRARY_ID,
                label: {fr: 'Test SDO import disabled', en: 'Test SDO import disabled'},
                attributes: ['label', SDO_TEST_ATTRIBUTE_ID],
                recordIdentityConf: {label: 'label'},
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
            SDO_IMPORTS_EXPORT_MSG_QUEUE,
            conf.sdo.exchange,
            conf.sdo.exchangeType,
        );
        // The queue is durable and never reset between runs: without this, every message published by
        // the previous runs has to be drained before the one a test is actually waiting for.
        await rabbitmqClient.purgeQueue(SDO_IMPORTS_EXPORT_MSG_QUEUE);
    });

    afterAll(async () => {
        await rabbitmqClient.close();
    });

    describe('create', () => {
        test('receive a create message should create an active record', async () => {
            const uuid = crypto.randomUUID();
            const editorUUID = crypto.randomUUID();

            await _publish(
                _sdo({
                    content: _content(
                        uuid,
                        {value: 'mock_value'},
                        {
                            systemCreator: editorUUID,
                            systemLastModificator: editorUUID,
                            systemLabel: 'PAC 2027 Import V1',
                            applicationIds: {omnipublish: 2000},
                            systemCreatorClientId: 'omp-creator-client',
                        },
                    ),
                }),
            );

            await vi.waitFor(
                async () => {
                    const record = (await _findRecords(uuid))[0];

                    expect(record.uuid).toBe(uuid);
                    expect(record.active).toBe(true);
                    expect(record.created_by[0].payload.id).not.toBe(editorUUID);
                    expect(record.modified_by[0].payload.id).not.toBe(editorUUID);
                    expect(record.whoAmI.label).toBe(null); // label should not be set on import

                    expect(await _getStandardValue(record.id, SDO_TEST_ATTRIBUTE_ID)).toBe('mock_value');

                    // LEAVC-871: applicationIds & creator clientId are persisted from the SDO on import
                    expect(await _getStandardValue(record.id, SdoAttributes.APPLICATION_IDS)).toBe(
                        JSON.stringify({omnipublish: 2000}),
                    );
                    expect(await _getStandardValue(record.id, SdoAttributes.CREATOR_CLIENT_ID)).toBe(
                        'omp-creator-client',
                    );
                },
                {timeout: 5000, interval: 250},
            );
        });

        test('ignores a mapping entry whose leavAttributeId is a path (modified_by.email)', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {value: 'mock_value', editorEmail: 'someone@example.com'})}));

            const record = await _waitForRecord(uuid);

            // The record is created normally; the path-mapped "editorEmail" field is silently
            // ignored (no writable attribute to resolve it to), it never fails the import.
            expect(record.active).toBe(true);
            expect(await _getStandardValue(record.id, SDO_TEST_ATTRIBUTE_ID)).toBe('mock_value');
        });

        test('ignores a mapping entry flagged skipImport', async () => {
            const uuid = crypto.randomUUID();

            await _publish(
                _sdo({content: _content(uuid, {value: 'mock_value', skippedValue: 'should not be imported'})}),
            );

            const record = await _waitForRecord(uuid);

            // The record is created normally, the excluded attribute is simply not written
            expect(await _getStandardValue(record.id, SDO_TEST_ATTRIBUTE_ID)).toBe('mock_value');
            expect(await _getStandardValue(record.id, SDO_TEST_SKIPPED_ATTRIBUTE_ID)).toBe(null);
        });

        test('receive a message for an entity which is not importable should be ignored', async () => {
            const uuid = crypto.randomUUID();

            await _publish(
                _sdo({name: SDO_IMPORTS_DISABLED_LIBRARY_ID, content: _content(uuid, {value: 'mock_value'})}),
            );

            await _waitForProcessing();

            expect(await _findRecords(uuid, SDO_IMPORTS_DISABLED_LIBRARY_ID)).toHaveLength(0);
        }, 10000);

        test('receive an create message should create an inactive record', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {value: ''}, {systemActive: false, systemLabel: ''})}));

            await vi.waitFor(
                async () => {
                    expect((await _findRecords(uuid))[0]?.active).toBe(false);
                },
                {timeout: 25000, interval: 250},
            );
        });

        test('receive a message with our own clientId should be ignored (no record created)', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({clientId: conf.sdo.clientId, content: _content(uuid, {value: 'mock_value'})}));

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);
    });

    describe('update', () => {
        test('receive an update message should update a record', async () => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: SDO_IMPORTS_LIBRARY_ID,
                data: {values: [{attribute: SDO_TEST_ATTRIBUTE_ID, payload: 'value'}]},
            });

            const recordUUID = createRecord.record!.uuid;
            const recordId = createRecord.record!.id;
            const editorUUID = crypto.randomUUID();

            await _publish(
                _sdo({
                    action: 'UPDATE',
                    content: _content(
                        recordUUID,
                        {value: 'updated_value'},
                        {
                            systemCreator: editorUUID,
                            systemLastModificator: editorUUID,
                            systemLabel: 'new_label_1',
                            applicationIds: {omnipublish: 3000},
                            systemCreatorClientId: 'omp-creator-client-update',
                        },
                    ),
                }),
            );

            await vi.waitFor(
                async () => {
                    expect(await _getStandardValue(recordId, SDO_TEST_ATTRIBUTE_ID)).toBe('updated_value');

                    // LEAVC-871: applicationIds & creator clientId are persisted from the SDO on import update
                    expect(await _getStandardValue(recordId, SdoAttributes.APPLICATION_IDS)).toBe(
                        JSON.stringify({omnipublish: 3000}),
                    );
                    expect(await _getStandardValue(recordId, SdoAttributes.CREATOR_CLIENT_ID)).toBe(
                        'omp-creator-client-update',
                    );

                    const recordData = (await _findRecords(recordUUID))[0];

                    expect(recordData.created_by[0].payload.id).not.toBe(editorUUID);
                    expect(recordData.modified_by[0].payload.id).not.toBe(editorUUID);
                    expect(recordData.whoAmI.label).toBe(null); // label should not be set on import
                },
                {timeout: 5000, interval: 250},
            );
        });

        test('receive an update message with systemActive: false should deactivate the record', async () => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: SDO_IMPORTS_LIBRARY_ID,
                data: {values: [{attribute: SDO_TEST_ATTRIBUTE_ID, payload: 'value'}]},
            });

            const recordUUID = createRecord.record!.uuid;

            await _publish(
                _sdo({action: 'UPDATE', content: _content(recordUUID, {value: 'value'}, {systemActive: false})}),
            );

            await vi.waitFor(
                async () => {
                    expect((await _findRecords(recordUUID))[0].active).toBe(false);
                },
                {timeout: 5000, interval: 250},
            );
        });
    });

    /**
     * The import dispatches on the leav attribute type to turn an SDO payload into values to save
     * (`sdoImportDomain._getSaveValuesFor*`). References are UUIDs in an SDO and leav ids in the
     * database, so every link and tree case exercises that resolution against the real database —
     * which is the whole point of covering them here rather than on mocks only (LEAVC-855).
     */
    describe('attribute types', () => {
        test('imports a simple link as the linked record referenced by its UUID', async () => {
            const linked = await _createLinkedRecord('simple link target');
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {simpleLink: linked.uuid})}));

            const record = await _waitForRecord(uuid);

            expect(await _getLinkValues(record.id, SDO_IMPORTS_SIMPLE_LINK_ATTRIBUTE_ID)).toEqual([
                expect.objectContaining({payload: expect.objectContaining({id: linked.id})}),
            ]);
        });

        test('imports an advanced link mono as the linked record referenced by its UUID', async () => {
            const linked = await _createLinkedRecord('advanced link mono target');
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {advancedLinkMono: linked.uuid})}));

            const record = await _waitForRecord(uuid);

            expect(await _getLinkValues(record.id, SDO_IMPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID)).toEqual([
                expect.objectContaining({payload: expect.objectContaining({id: linked.id})}),
            ]);
        });

        test('imports an advanced link multiple as every referenced record', async () => {
            const linkedA = await _createLinkedRecord('advanced link multi A');
            const linkedB = await _createLinkedRecord('advanced link multi B');
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {advancedLinkMulti: [linkedA.uuid, linkedB.uuid]})}));

            const record = await _waitForRecord(uuid);

            const values = await _getLinkValues(record.id, SDO_IMPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID);

            expect(values.map(value => value.payload.id).sort()).toEqual([linkedA.id, linkedB.id].sort());
        });

        test('imports a standard advanced mono value', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {advancedMono: 'advanced_mono_value'})}));

            const record = await _waitForRecord(uuid);

            expect(await _getStandardValue(record.id, SDO_IMPORTS_ADVANCED_MONO_ATTRIBUTE_ID)).toBe(
                'advanced_mono_value',
            );
        });

        test('imports a standard advanced multiple as one value per array element', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {advancedMulti: ['first', 'second']})}));

            const record = await _waitForRecord(uuid);

            const values = await _getStandardValues(record.id, SDO_IMPORTS_ADVANCED_MULTI_ATTRIBUTE_ID);

            expect(values.map(value => value.payload).sort()).toEqual(['first', 'second']);
        });

        test('imports a tree mono, resolving the referenced record to the node carrying it', async () => {
            const node = await _createTreeNode('tree mono target');
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {treeMono: node.recordUuid})}));

            const record = await _waitForRecord(uuid);

            // The SDO references the *record* uuid; what leav stores is the tree *node*
            expect(await _getTreeValues(record.id, SDO_IMPORTS_TREE_MONO_ATTRIBUTE_ID)).toEqual([
                expect.objectContaining({
                    payload: expect.objectContaining({
                        id: node.nodeId,
                        record: expect.objectContaining({id: node.recordId}),
                    }),
                }),
            ]);
        });

        test('imports a tree multiple as the node of each referenced record', async () => {
            const nodeA = await _createTreeNode('tree multi A');
            const nodeB = await _createTreeNode('tree multi B');
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {treeMulti: [nodeA.recordUuid, nodeB.recordUuid]})}));

            const record = await _waitForRecord(uuid);

            const values = await _getTreeValues(record.id, SDO_IMPORTS_TREE_MULTI_ATTRIBUTE_ID);

            expect(values.map(value => value.payload.id).sort()).toEqual([nodeA.nodeId, nodeB.nodeId].sort());
        });
    });

    /**
     * A multivalued attribute is not appended to: the incoming array *is* the new state, so the
     * import diffs it against what is stored and deletes what the document left out.
     */
    describe('multivalued replacement', () => {
        test('an update of a multivalued link keeps the intersection, drops the rest and adds the new', async () => {
            const linkedA = await _createLinkedRecord('replacement link A');
            const linkedB = await _createLinkedRecord('replacement link B');
            const linkedC = await _createLinkedRecord('replacement link C');
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {advancedLinkMulti: [linkedA.uuid, linkedB.uuid]})}));

            const record = await _waitForRecord(uuid);

            await vi.waitFor(
                async () =>
                    expect(await _getLinkValues(record.id, SDO_IMPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID)).toHaveLength(
                        2,
                    ),
                {timeout: 5000, interval: 250},
            );

            // B is kept, A must go, C must be added
            await _publish(
                _sdo({
                    action: 'UPDATE',
                    content: _content(uuid, {advancedLinkMulti: [linkedB.uuid, linkedC.uuid]}),
                }),
            );

            await vi.waitFor(
                async () => {
                    const values = await _getLinkValues(record.id, SDO_IMPORTS_ADVANCED_LINK_MULTI_ATTRIBUTE_ID);

                    expect(values.map(value => value.payload.id).sort()).toEqual([linkedB.id, linkedC.id].sort());
                },
                {timeout: 5000, interval: 250},
            );
        }, 20000);

        test('an update of a multivalued tree attribute drops the nodes the document left out', async () => {
            const nodeA = await _createTreeNode('replacement tree A');
            const nodeB = await _createTreeNode('replacement tree B');
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {treeMulti: [nodeA.recordUuid, nodeB.recordUuid]})}));

            const record = await _waitForRecord(uuid);

            await vi.waitFor(
                async () =>
                    expect(await _getTreeValues(record.id, SDO_IMPORTS_TREE_MULTI_ATTRIBUTE_ID)).toHaveLength(2),
                {timeout: 5000, interval: 250},
            );

            await _publish(_sdo({action: 'UPDATE', content: _content(uuid, {treeMulti: [nodeB.recordUuid]})}));

            await vi.waitFor(
                async () => {
                    const values = await _getTreeValues(record.id, SDO_IMPORTS_TREE_MULTI_ATTRIBUTE_ID);

                    expect(values.map(value => value.payload.id)).toEqual([nodeB.nodeId]);
                },
                {timeout: 5000, interval: 250},
            );
        }, 20000);
    });

    describe('unsetting values', () => {
        test('a null payload deletes the stored value', async () => {
            const linked = await _createLinkedRecord('to be unset');
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {advancedLinkMono: linked.uuid})}));

            const record = await _waitForRecord(uuid);

            await vi.waitFor(
                async () =>
                    expect(await _getLinkValues(record.id, SDO_IMPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID)).toHaveLength(
                        1,
                    ),
                {timeout: 5000, interval: 250},
            );

            await _publish(_sdo({action: 'UPDATE', content: _content(uuid, {advancedLinkMono: null})}));

            await vi.waitFor(
                async () =>
                    expect(await _getLinkValues(record.id, SDO_IMPORTS_ADVANCED_LINK_MONO_ATTRIBUTE_ID)).toHaveLength(
                        0,
                    ),
                {timeout: 5000, interval: 250},
            );
        }, 20000);

        test('a null payload on a value which was never set is a no-op, not an error (LEAVC-987)', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {advancedMono: 'untouched'})}));

            const record = await _waitForRecord(uuid);

            // `value` was never set on this record. Deleting it must not fail the operation, so the
            // other attribute of the very same message has to be applied.
            await _publish(_sdo({action: 'UPDATE', content: _content(uuid, {value: null, advancedMono: 'applied'})}));

            await vi.waitFor(
                async () => {
                    expect(await _getStandardValue(record.id, SDO_IMPORTS_ADVANCED_MONO_ATTRIBUTE_ID)).toBe('applied');
                    expect(await _getStandardValue(record.id, SDO_TEST_ATTRIBUTE_ID)).toBe(null);
                },
                {timeout: 5000, interval: 250},
            );
        }, 20000);

        test('an empty string leaves the stored value untouched: the entry is skipped, not emptied', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {value: 'kept'})}));

            const record = await _waitForRecord(uuid);

            // `''` is filtered out of the mapping entries like an absent field — it does NOT mean
            // "empty this attribute". `advancedMono` proves the message was really processed.
            await _publish(_sdo({action: 'UPDATE', content: _content(uuid, {value: '', advancedMono: 'processed'})}));

            await vi.waitFor(
                async () => {
                    expect(await _getStandardValue(record.id, SDO_IMPORTS_ADVANCED_MONO_ATTRIBUTE_ID)).toBe(
                        'processed',
                    );
                    expect(await _getStandardValue(record.id, SDO_TEST_ATTRIBUTE_ID)).toBe('kept');
                },
                {timeout: 5000, interval: 250},
            );
        }, 20000);
    });

    describe('idempotence', () => {
        test('a create message on an existing systemId is skipped, not applied', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {value: 'first_value'})}));

            const record = await _waitForRecord(uuid);

            // Same systemId, different value: neither a duplicate record nor an overwrite
            await _publish(_sdo({content: _content(uuid, {value: 'second_value'})}));

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(1);
            expect(await _getStandardValue(record.id, SDO_TEST_ATTRIBUTE_ID)).toBe('first_value');
        }, 20000);
    });

    /**
     * Every rejection below nacks the message without requeue, so there is nothing positive to wait
     * for: what is asserted is that nothing was written.
     */
    describe('rejections', () => {
        test('a reference to an unknown UUID blocks the whole import (LEAVC-870)', async () => {
            const uuid = crypto.randomUUID();

            await _publish(
                _sdo({
                    content: _content(uuid, {value: 'must not land', advancedLinkMono: crypto.randomUUID()}),
                }),
            );

            await _waitForProcessing();

            // Not a partial import: the record itself is never created, so the valid attributes of the
            // same document are not written either.
            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('an array on a monovalued attribute is rejected', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {value: ['one', 'two']})}));

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('a single value on a multivalued attribute is rejected', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {advancedMulti: 'not_an_array'})}));

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('an update message on an unknown systemId creates nothing', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({action: 'UPDATE', content: _content(uuid, {value: 'mock_value'})}));

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('a message whose name is absent from the mapping imports nothing', async () => {
            const uuid = crypto.randomUUID();

            // Unlike an entity mapped without `importEnable` (acked and ignored), an unmapped type is a
            // configuration anomaly: it stays an error.
            await _publish(_sdo({name: 'test_sdo_imports_unmapped', content: _content(uuid, {value: 'mock_value'})}));

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('a message carrying an unsupported action imports nothing', async () => {
            const uuid = crypto.randomUUID();

            await _publish({
                ..._sdo({content: _content(uuid, {value: 'mock_value'})}),
                // The V2 contract announces UPSERT / DELETE on the producer side; leav dispatches
                // neither for now.
                action: 'DELETE',
            });

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);
    });

    describe('period sub-paths', () => {
        test('the sub-paths of a period attribute are exported but never imported', async () => {
            const uuid = crypto.randomUUID();

            // `info.startDate` / `info.endDate` are mapped to `<date_range>.from` / `.to`. A dotted
            // path cannot be resolved to a single writable attribute, so the import drops the entry
            // instead of failing — the period attribute stays empty.
            //
            // ⚠️ LEAVC-782 announces the reverse mapping as implemented; it is not. This test locks the
            // gap so it stays visible: it will fail — as intended — when LEAVC-1130 makes the sub-paths
            // of a period/extended attribute importable.
            await _publish(
                _sdo({
                    content: _content(uuid, {value: 'mock_value', startDate: 1746100800, endDate: 1760961600}),
                }),
            );

            const record = await _waitForRecord(uuid);

            expect(await _getStandardValue(record.id, SDO_TEST_ATTRIBUTE_ID)).toBe('mock_value');
            expect(await _getStandardValue(record.id, SDO_IMPORTS_DATE_RANGE_ATTRIBUTE_ID)).toBe(null);
        });
    });

    describe('application traceability round-trip (LEAVC-871)', () => {
        test('a re-exported record keeps its origin clientId and merges its legacy applicationIds', async () => {
            const uuid = crypto.randomUUID();

            await _publish(
                _sdo({
                    content: _content(
                        uuid,
                        {value: 'imported from another app'},
                        {applicationIds: {omnipublish: 2000}, systemCreatorClientId: 'omp-creator-client'},
                    ),
                }),
            );

            const record = await _waitForRecord(uuid);

            // Editing as a real user is what triggers an export — an import writes as the system user,
            // whose events the export consumer drops on purpose.
            await adminUserSdk.SaveValue({
                libraryId: SDO_IMPORTS_LIBRARY_ID,
                recordId: record.id,
                attributeId: SDO_TEST_ATTRIBUTE_ID,
                value: {payload: 're-exported'},
            });

            const exported = await rabbitmqClient.waitForMessage<ISDO>(
                SDO_IMPORTS_EXPORT_MSG_QUEUE,
                message =>
                    message.name === SDO_IMPORTS_LIBRARY_ID &&
                    message.clientId === conf.sdo.clientId &&
                    String((message.content as any).system?.systemId) === uuid,
                SDO_EXPORT_TIMER * 40,
            );

            expect(exported.content.system).toMatchObject({
                // The creating application is remembered, not overwritten by ours...
                systemCreatorClientId: 'omp-creator-client',
                // ...and the app doing the modification is computed at generation time
                systemLastModificatorClientId: conf.sdo.clientId,
                // The legacy ids of the other applications survive, ours is added alongside
                applicationIds: {omnipublish: 2000, [conf.sdo.applicationName]: record.id},
            });
        }, 30000);
    });

    describe('no export loop', () => {
        test('an imported record does not trigger an export of its own', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_sdo({content: _content(uuid, {value: 'imported, not re-exported'})}));

            await _waitForRecord(uuid);

            /**
             * The SDO exchange carries both directions, so the observation queue also holds the
             * document published just above: only `clientId` tells an export emitted by leav from an
             * incoming SDO. Without the anti-loop filter (an import writes as the system user, whose
             * events the export consumer drops), two instances listening to each other would export
             * back and forth forever.
             */
            await expect(
                rabbitmqClient.waitForMessage<ISDO>(
                    SDO_IMPORTS_EXPORT_MSG_QUEUE,
                    message =>
                        message.name === SDO_IMPORTS_LIBRARY_ID &&
                        message.clientId === conf.sdo.clientId &&
                        String((message.content as any).system?.systemId) === uuid,
                    NO_EXPORT_TIMEOUT_MS,
                ),
            ).rejects.toThrow('No matching message');
        }, 20000);
    });
});
