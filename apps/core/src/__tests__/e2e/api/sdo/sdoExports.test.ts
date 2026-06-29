import {type ISDO} from '../../../../_types/sdo';
import {adminUserSdk} from '../e2eUtils';
import {RabbitMqClient} from './rabbitMQUtils';
import {SDO_EXPORT_TIMER, sdoGlobalSettings, SDO_EXPORTS_LIBRARY_ID} from './sdoConfig';
import {getConfig} from '../../../../config';
import {type IConfig} from '../../../../_types/config';

const rabbitmqClient = new RabbitMqClient();

const TEST_GET_EXPORT_MSG_QUEUE = 'test_get_export_queue';

describe('SDO Exports', () => {
    let conf: IConfig;

    beforeAll(async () => {
        conf = await getConfig();

        await adminUserSdk.SaveLibrary({
            library: {
                id: SDO_EXPORTS_LIBRARY_ID,
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
        await rabbitmqClient.assertExchangeAndBindQueue(
            TEST_GET_EXPORT_MSG_QUEUE,
            conf.sdo.export.exchange,
            conf.sdo.export.type,
        );
    });

    afterAll(async () => {
        await rabbitmqClient.close();
    });

    beforeEach(async () => {
        await rabbitmqClient.purgeQueue(TEST_GET_EXPORT_MSG_QUEUE);
    });

    const waitForSdo = (recordUUID: string, timeoutMs = SDO_EXPORT_TIMER * 10): Promise<ISDO> =>
        rabbitmqClient.waitForMessage<ISDO>(
            TEST_GET_EXPORT_MSG_QUEUE,
            m => m.name === SDO_EXPORTS_LIBRARY_ID && String((m.content as any).system?.systemId) === recordUUID,
            timeoutMs,
        );

    test('create a record triggers a CREATE export message', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const recordUUID = createRecord.record!.uuid;

        const msg = await waitForSdo(recordUUID);

        expect(msg).toMatchObject({
            name: SDO_EXPORTS_LIBRARY_ID,
            dataModelRelease: 'dataModelRelease',
            date: expect.any(Number),
            action: 'CREATE',
            content: {
                system: {
                    systemId: recordUUID,
                    systemActive: true,
                    systemCreationDate: expect.any(Number),
                    systemLastModifiedDate: expect.any(Number),
                    systemSdoHash: null,
                    systemLabel: null,
                },
            },
        });
    });

    // TODO: Voir quoi faire dans le cas d'un DELETE_RECORD (différent d'une desactivation)
    // test.skip('deleting a record triggers an UPDATE export message with systemActive: false', async () => {
    //     const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_LIBRARY_ID});
    //     const recordId = createRecord.record!.id;

    //     // Wait for the CREATE message before soft-deleting
    //     const msgCreate = await waitForSdo(recordId);
    //     expect(msgCreate.action).toBe('CREATE');
    //     expect((msgCreate.content as any).system?.systemActive).toBe(true);

    //     await adminUserSdk.DeleteRecord({id: recordId, library: SDO_LIBRARY_ID});
    //     const msgUpdate = await waitForSdo(recordId);

    //     expect(msgUpdate).toMatchObject({
    //         name: SDO_LIBRARY_ID,
    //         action: 'UPDATE',
    //         content: {
    //             system: {
    //                 systemId: Number.parseInt(recordId, 10),
    //                 systemActive: false,
    //             },
    //             identifier: {
    //                 uuid: (msgCreate.content as any).identifier?.uuid,
    //             },
    //         },
    //     });
    // });
});
