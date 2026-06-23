import {type ISDO} from '../../../../_types/sdo';
import {getConfig} from '../../../../config';
import {RabbitMqClient} from './rabbitMQUtils';
import {type IConfig} from '../../../../_types/config';
import {adminUserSdk} from '../e2eUtils';
import {SDO_LIBRARY_ID, sdoGlobalSettings} from './sdoConfig';
import {AttributeFormat, AttributeType} from '../../_gqlTypes';

export const formatDate = (date: string) => (new Date(date).getTime() / 1000).toString();

describe('SDO Map Imports', () => {
    let conf: IConfig;
    let rabbitmqClient: RabbitMqClient;

    beforeAll(async () => {
        conf = await getConfig();
        rabbitmqClient = new RabbitMqClient();

        // hash_sdo attribute is written back by the SDO domain after each export to track changes.
        // It must exist on the library before any record is created.
        await adminUserSdk.SaveAttribute({
            attribute: {
                id: 'hash_sdo',
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'Hash SDO', en: 'SDO Hash'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_LIBRARY_ID,
                label: {fr: 'Test SDO', en: 'Test SDO'},
                attributes: ['hash_sdo'],
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

    test('receive an create map message should create an active map record', async () => {
        const creationDateSec = Math.round(Date.now() / 1000); // in seconds

        const uuid = crypto.randomUUID();

        const sdoToEmit: ISDO = {
            name: SDO_LIBRARY_ID, // SDO_LIBRARIES.MAP,
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
                    libraryId: SDO_LIBRARY_ID,
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

    test('receive an create map message should create an inactive map record', async () => {
        const creationDateSec = Math.round(Date.now() / 1000); // in seconds

        const uuid = crypto.randomUUID();

        const sdoToEmit: ISDO = {
            name: SDO_LIBRARY_ID,
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
                    libraryId: SDO_LIBRARY_ID,
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
