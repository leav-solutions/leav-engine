import {type ISDO} from '../../../../_types/sdo';
import {getConfig} from '../../../../config';
import {RabbitMqClient} from './rabbitMQUtils';
import {type IConfig} from '../../../../_types/config';
import {adminUserSdk} from '../e2eUtils';
import {SDO_IMPORTS_LIBRARY_ID, SDO_TEST_ATTRIBUTE_ID, sdoGlobalSettings} from './sdoConfig';
import {AttributeFormat, AttributeType} from '../../_gqlTypes';
import {SdoAttributes} from '../../../../_constants/systemAttributes';

export const formatDate = (date: string) => (new Date(date).getTime() / 1000).toString();

describe('SDO Imports', () => {
    let conf: IConfig;
    let rabbitmqClient: RabbitMqClient;

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

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_IMPORTS_LIBRARY_ID,
                label: {fr: 'Test SDO', en: 'Test SDO'},
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
    });

    afterAll(async () => {
        await rabbitmqClient.close();
    });

    describe('create', () => {
        test('receive a create message should create an active record', async () => {
            const creationDateSec = Math.round(Date.now() / 1000); // in seconds

            const uuid = crypto.randomUUID();
            const editorUUID = crypto.randomUUID();

            const sdoToEmit: ISDO = {
                name: SDO_IMPORTS_LIBRARY_ID,
                dataModelRelease: 'dataModelRelease',
                date: creationDateSec,
                action: 'CREATE',
                content: {
                    system: {
                        systemId: uuid,
                        systemActive: true,
                        systemCreationDate: creationDateSec,
                        systemLastModifiedDate: creationDateSec,
                        systemCreator: editorUUID,
                        systemLastModificator: editorUUID,
                        systemLabel: 'PAC 2027 Import V1',
                        systemSdoHash: 'hashPAC2027ImportV1',
                        applicationIds: {omnipublish: 2000},
                        systemCreatorClientId: 'omp-creator-client',
                    },
                    identifier: {},
                    info: {value: 'mock_value'},
                },
            };

            await rabbitmqClient.publishToExchange<ISDO>(conf.sdo.exchange, sdoToEmit);

            await vi.waitFor(
                async () => {
                    const record = (
                        await adminUserSdk.GetRecordByUUID({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordUUID: uuid,
                            retrieveInactive: false,
                        })
                    ).records.list[0];

                    expect(record.uuid).toBe(uuid);
                    expect(record.active).toBe(true);
                    expect(record.created_by[0].payload.id).not.toBe(editorUUID);
                    expect(record.modified_by[0].payload.id).not.toBe(editorUUID);
                    expect(record.whoAmI.label).toBe(null); // label should not be set on import

                    const infoValuePayload = (
                        await adminUserSdk.GetRecordByIdStandardValuesProperty({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordId: record.id,
                            attributeId: SDO_TEST_ATTRIBUTE_ID,
                        })
                    ).records.list[0].property[0].payload;

                    expect(infoValuePayload).toBe('mock_value');

                    // LEAVC-871: applicationIds & creator clientId are persisted from the SDO on import
                    const applicationIdsPayload = (
                        await adminUserSdk.GetRecordByIdStandardValuesProperty({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordId: record.id,
                            attributeId: SdoAttributes.APPLICATION_IDS,
                        })
                    ).records.list[0].property[0].payload;
                    expect(applicationIdsPayload).toBe(JSON.stringify({omnipublish: 2000}));

                    const creatorClientIdPayload = (
                        await adminUserSdk.GetRecordByIdStandardValuesProperty({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordId: record.id,
                            attributeId: SdoAttributes.CREATOR_CLIENT_ID,
                        })
                    ).records.list[0].property[0].payload;
                    expect(creatorClientIdPayload).toBe('omp-creator-client');
                },
                {timeout: 5000, interval: 1000},
            );
        });

        test('ignores a mapping entry whose leavAttributeId is a path (modified_by.email)', async () => {
            const creationDateSec = Math.round(Date.now() / 1000); // in seconds

            const uuid = crypto.randomUUID();
            const editorUUID = crypto.randomUUID();

            const sdoToEmit: ISDO = {
                name: SDO_IMPORTS_LIBRARY_ID,
                dataModelRelease: 'dataModelRelease',
                date: creationDateSec,
                action: 'CREATE',
                content: {
                    system: {
                        systemId: uuid,
                        systemActive: true,
                        systemCreationDate: creationDateSec,
                        systemLastModifiedDate: creationDateSec,
                        systemCreator: editorUUID,
                        systemLastModificator: editorUUID,
                        systemLabel: 'PAC 2027 Import V1',
                        systemSdoHash: 'hashPAC2027ImportV1',
                    },
                    identifier: {},
                    info: {value: 'mock_value', editorEmail: 'someone@example.com'},
                },
            };

            await rabbitmqClient.publishToExchange<ISDO>(conf.sdo.exchange, sdoToEmit);

            await vi.waitFor(
                async () => {
                    const record = (
                        await adminUserSdk.GetRecordByUUID({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordUUID: uuid,
                            retrieveInactive: false,
                        })
                    ).records.list[0];

                    // The record is created normally; the path-mapped "editorEmail" field is silently
                    // ignored (no writable attribute to resolve it to), it never fails the import.
                    expect(record.uuid).toBe(uuid);
                    expect(record.active).toBe(true);

                    const infoValuePayload = (
                        await adminUserSdk.GetRecordByIdStandardValuesProperty({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordId: record.id,
                            attributeId: SDO_TEST_ATTRIBUTE_ID,
                        })
                    ).records.list[0].property[0].payload;

                    expect(infoValuePayload).toBe('mock_value');
                },
                {timeout: 5000, interval: 1000},
            );
        });

        test('receive an create message should create an inactive record', async () => {
            const creationDateSec = Math.round(Date.now() / 1000); // in seconds

            const uuid = crypto.randomUUID();
            const editorUUID = crypto.randomUUID();

            const sdoToEmit: ISDO = {
                name: SDO_IMPORTS_LIBRARY_ID,
                dataModelRelease: 'dataModelRelease',
                date: creationDateSec,
                action: 'CREATE',
                content: {
                    system: {
                        systemId: uuid,
                        systemActive: false,
                        systemCreationDate: creationDateSec,
                        systemLastModifiedDate: creationDateSec,
                        systemCreator: editorUUID,
                        systemLastModificator: editorUUID,
                        systemLabel: '',
                        systemSdoHash: '',
                    },
                    identifier: {},
                    info: {value: ''},
                },
            };

            await rabbitmqClient.publishToExchange<ISDO>(conf.sdo.exchange, sdoToEmit);

            await vi.waitFor(
                async () => {
                    const record = (
                        await adminUserSdk.GetRecordByUUID({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordUUID: uuid,
                            retrieveInactive: true,
                        })
                    ).records.list[0];

                    expect(record.active).toBe(false);
                },
                {timeout: 25000, interval: 1000},
            );
        });

        test('receive a message with our own clientId should be ignored (no record created)', async () => {
            const creationDateSec = Math.round(Date.now() / 1000); // in seconds
            const uuid = crypto.randomUUID();
            const editorUUID = crypto.randomUUID();

            const sdoToEmit: ISDO = {
                name: SDO_IMPORTS_LIBRARY_ID,
                dataModelRelease: 'dataModelRelease',
                date: creationDateSec,
                action: 'CREATE',
                clientId: conf.sdo.clientId,
                content: {
                    system: {
                        systemId: uuid,
                        systemActive: true,
                        systemCreationDate: creationDateSec,
                        systemLastModifiedDate: creationDateSec,
                        systemCreator: editorUUID,
                        systemLastModificator: editorUUID,
                        systemLabel: 'Should not be imported',
                        systemSdoHash: 'hashSelfEcho',
                    },
                    identifier: {},
                    info: {value: 'mock_value'},
                },
            };

            await rabbitmqClient.publishToExchange<ISDO>(conf.sdo.exchange, sdoToEmit);

            // No positive event to wait for here (message must be silently ignored) -> wait a fixed
            // delay, longer than the normal processing time observed in the other import tests.
            await new Promise(resolve => setTimeout(resolve, 5000));

            const records = (
                await adminUserSdk.GetRecordByUUID({
                    libraryId: SDO_IMPORTS_LIBRARY_ID,
                    recordUUID: uuid,
                    retrieveInactive: true,
                })
            ).records.list;

            expect(records).toHaveLength(0);
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

            const creationDateSec = Math.round(Date.now() / 1000); // in seconds

            const sdoToEmit: ISDO = {
                name: SDO_IMPORTS_LIBRARY_ID, // SDO_LIBRARIES.MAP,
                dataModelRelease: 'dataModelRelease',
                date: creationDateSec,
                action: 'UPDATE',
                content: {
                    system: {
                        systemId: recordUUID,
                        systemActive: true,
                        systemCreationDate: creationDateSec,
                        systemLastModifiedDate: creationDateSec,
                        systemCreator: editorUUID,
                        systemLastModificator: editorUUID,
                        systemLabel: 'new_label_1',
                        systemSdoHash: 'hashPAC2027ImportV1',
                        applicationIds: {omnipublish: 3000},
                        systemCreatorClientId: 'omp-creator-client-update',
                    },
                    identifier: {},
                    info: {value: 'updated_value'},
                },
            };

            await rabbitmqClient.publishToExchange<ISDO>(conf.sdo.exchange, sdoToEmit);

            await vi.waitFor(
                async () => {
                    const infoValuePayload = (
                        await adminUserSdk.GetRecordByIdStandardValuesProperty({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordId,
                            attributeId: SDO_TEST_ATTRIBUTE_ID,
                        })
                    ).records.list[0].property[0].payload;

                    expect(infoValuePayload).toBe('updated_value');

                    // LEAVC-871: applicationIds & creator clientId are persisted from the SDO on import update
                    const applicationIdsPayload = (
                        await adminUserSdk.GetRecordByIdStandardValuesProperty({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordId,
                            attributeId: SdoAttributes.APPLICATION_IDS,
                        })
                    ).records.list[0].property[0].payload;
                    expect(applicationIdsPayload).toBe(JSON.stringify({omnipublish: 3000}));

                    const creatorClientIdPayload = (
                        await adminUserSdk.GetRecordByIdStandardValuesProperty({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordId,
                            attributeId: SdoAttributes.CREATOR_CLIENT_ID,
                        })
                    ).records.list[0].property[0].payload;
                    expect(creatorClientIdPayload).toBe('omp-creator-client-update');

                    const recordData = (
                        await adminUserSdk.GetRecordByUUID({
                            libraryId: SDO_IMPORTS_LIBRARY_ID,
                            recordUUID,
                            retrieveInactive: true,
                        })
                    ).records.list[0];

                    expect(recordData.created_by[0].payload.id).not.toBe(editorUUID);
                    expect(recordData.modified_by[0].payload.id).not.toBe(editorUUID);
                    expect(recordData.whoAmI.label).toBe(null); // label should not be set on import
                },
                {timeout: 5000, interval: 1000},
            );
        });
    });
});
