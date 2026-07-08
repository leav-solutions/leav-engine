import {type ISDO} from '../../../../_types/sdo';
import {adminUserSdk, e2eNonAdminUser, nonAdminUserSdk} from '../e2eUtils';
import {RabbitMqClient} from './rabbitMQUtils';
import {SDO_EXPORT_TIMER, sdoGlobalSettings, SDO_EXPORTS_LIBRARY_ID, SDO_EXPORTS_TEST_ATTRIBUTE_ID} from './sdoConfig';
import {getConfig} from '../../../../config';
import {type IConfig} from '../../../../_types/config';
import {AttributeFormat, AttributeType} from '../../_gqlTypes';

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
                id: SDO_EXPORTS_LIBRARY_ID,
                label: {fr: 'Test SDO', en: 'Test SDO'},
                attributes: [SDO_EXPORTS_TEST_ATTRIBUTE_ID],
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

    const waitForSdo = (recordUUID: string, timeoutMs = SDO_EXPORT_TIMER * 10): Promise<ISDO> =>
        rabbitmqClient.waitForMessage<ISDO>(
            TEST_GET_EXPORT_MSG_QUEUE,
            m => m.name === SDO_EXPORTS_LIBRARY_ID && String((m.content as any).system?.systemId) === recordUUID,
            timeoutMs,
        );

    test('create a record triggers a CREATE export message', async () => {
        const {createRecord} = await nonAdminUserSdk.CreateRecord({
            library: SDO_EXPORTS_LIBRARY_ID,
        });

        const {id: recordId, uuid: recordUUID} = createRecord.record;
        const nonAdminUserUUID = e2eNonAdminUser().userUUID;

        const msg = await waitForSdo(recordUUID);

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

    test('updating the mapped attribute triggers an UPDATE export message with the new content', async () => {
        const {createRecord} = await adminUserSdk.CreateRecord({library: SDO_EXPORTS_LIBRARY_ID});
        const {id: recordId, uuid: recordUUID} = createRecord.record;

        await waitForSdo(recordUUID); // wait for the CREATE export before triggering an update

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TEST_ATTRIBUTE_ID,
            value: {payload: 'v1'},
        });

        const msg = await waitForSdo(recordUUID);

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

        await waitForSdo(recordUUID); // CREATE export

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TEST_ATTRIBUTE_ID,
            value: {payload: 'v1'},
        });
        await waitForSdo(recordUUID); // first UPDATE export, content now has info.value === 'v1'

        await adminUserSdk.SaveValue({
            libraryId: SDO_EXPORTS_LIBRARY_ID,
            recordId,
            attributeId: SDO_EXPORTS_TEST_ATTRIBUTE_ID,
            value: {payload: 'v1'},
        });

        await expect(waitForSdo(recordUUID, SDO_EXPORT_TIMER * 4)).rejects.toThrow();
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
