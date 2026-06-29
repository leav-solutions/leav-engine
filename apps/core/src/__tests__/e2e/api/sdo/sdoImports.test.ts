import {type ISDO} from '../../../../_types/sdo';
import {getConfig} from '../../../../config';
import {RabbitMqClient} from './rabbitMQUtils';
import {type IConfig} from '../../../../_types/config';
import {adminUserSdk} from '../e2eUtils';
import {SDO_IMPORTS_LIBRARY_ID, sdoGlobalSettings} from './sdoConfig';

export const formatDate = (date: string) => (new Date(date).getTime() / 1000).toString();

describe('SDO Imports', () => {
    let conf: IConfig;
    let rabbitmqClient: RabbitMqClient;

    beforeAll(async () => {
        conf = await getConfig();
        rabbitmqClient = new RabbitMqClient();

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_IMPORTS_LIBRARY_ID,
                label: {fr: 'Test SDO', en: 'Test SDO'},
                attributes: ['hash_sdo', 'label'],
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

            const sdoToEmit: ISDO = {
                name: SDO_IMPORTS_LIBRARY_ID, // SDO_LIBRARIES.MAP,
                dataModelRelease: 'dataModelRelease',
                date: creationDateSec,
                action: 'CREATE',
                content: {
                    system: {
                        systemId: uuid,
                        systemActive: true,
                        systemCreationDate: creationDateSec,
                        systemLastModifiedDate: creationDateSec,
                        systemCreator: null,
                        systemLastModificator: null,
                        systemLabel: 'PAC 2027 Import V1',
                        systemSdoHash: 'hashPAC2027ImportV1',
                    },
                    identifier: {},
                    info: {},
                },
            };

            await rabbitmqClient.publishToExchange<ISDO>(conf.sdo.import.exchange, sdoToEmit);

            await vi.waitFor(
                async () => {
                    const record = await adminUserSdk.GetRecordByUUID({
                        libraryId: SDO_IMPORTS_LIBRARY_ID,
                        recordUUID: uuid,
                        retrieveInactive: false,
                    });

                    expect(record.records.list.length).toBeGreaterThan(0);
                    expect(record.records.list[0]).toMatchObject({
                        uuid,
                        active: true,
                    });
                },
                {timeout: 5000, interval: 1000},
            );
        });

        test('receive an create message should create an inactive record', async () => {
            const creationDateSec = Math.round(Date.now() / 1000); // in seconds

            const uuid = crypto.randomUUID();

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
                        systemCreator: null,
                        systemLastModificator: null,
                        systemLabel: 'PAC 2027 Import V1',
                        systemSdoHash: 'hashPAC2027ImportV1',
                    },
                    identifier: {},
                    info: {},
                },
            };

            await rabbitmqClient.publishToExchange<ISDO>(conf.sdo.import.exchange, sdoToEmit);

            await vi.waitFor(
                async () => {
                    const record = await adminUserSdk.GetRecordByUUID({
                        libraryId: SDO_IMPORTS_LIBRARY_ID,
                        recordUUID: uuid,
                        retrieveInactive: true,
                    });

                    expect(record.records.list.length).toBeGreaterThan(0);
                    expect(record.records.list[0]).toMatchObject({
                        uuid,
                        active: false,
                    });
                },
                {timeout: 25000, interval: 1000},
            );
        });
    });

    describe('update', () => {
        test('receive an update message should update a record', async () => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: SDO_IMPORTS_LIBRARY_ID,
                data: {values: [{attribute: 'label', payload: 'label_1'}]},
            });

            const recordUUID = createRecord.record!.uuid;
            const recordId = createRecord.record!.id;

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
                        systemCreator: null,
                        systemLastModificator: null,
                        systemLabel: 'new_label_1',
                        systemSdoHash: 'hashPAC2027ImportV1',
                    },
                    identifier: {},
                    info: {},
                },
            };

            await rabbitmqClient.publishToExchange<ISDO>(conf.sdo.import.exchange, sdoToEmit);

            await vi.waitFor(
                async () => {
                    const record = await adminUserSdk.GetRecordByIdStandardValuesProperty({
                        libraryId: SDO_IMPORTS_LIBRARY_ID,
                        recordId,
                        attributeId: 'label',
                    });

                    expect(record.records.list.length).toBeGreaterThan(0);
                    expect(record.records.list[0].property[0].payload).toBe('new_label_1');
                },
                {timeout: 5000, interval: 1000},
            );
        });
    });
});
