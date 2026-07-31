import {type IDTO} from '../../../../_types/dto';
import {type ISDO} from '../../../../_types/sdo';
import {getConfig} from '../../../../config';
import {RabbitMqClient} from './rabbitMQUtils';
import {type IConfig} from '../../../../_types/config';
import {adminUserSdk} from '../e2eUtils';
import {DTO_IMPORTS_LIBRARY_ID, DTO_TEST_ATTRIBUTE_ID, sdoGlobalSettings} from './sdoConfig';
import {AttributeFormat, AttributeType} from '../../_gqlTypes';

/**
 * The DTO import applies the operation through the very same domain as the SDO import (LEAVC-982),
 * so these tests focus on what is specific to the DTO flow: the dedicated exchange, the envelope
 * (`payloadType` / `method` / `payloadDocument`) and the method dispatch. The value mapping itself is
 * covered by `sdoImports.test.ts`.
 */
describe('DTO Imports', () => {
    let conf: IConfig;
    let rabbitmqClient: RabbitMqClient;

    /**
     * `payloadDocument` has the same shape as an SDO `content` and is validated against the generic
     * SDO JSON schema, which still requires the whole `system` bookkeeping block.
     */
    const _payloadDocument = (systemId: string, value: string): ISDO['content'] => {
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
                systemLabel: 'DTO import label',
            },
            identifier: {},
            info: {value},
        };
    };

    const _dto = (overrides: Partial<IDTO> = {}): IDTO => ({
        dataModelRelease: 'dataModelRelease',
        requestId: crypto.randomUUID(),
        operationId: crypto.randomUUID(),
        correlationId: crypto.randomUUID(),
        payloadType: DTO_IMPORTS_LIBRARY_ID,
        method: 'CREATE',
        payloadDocument: _payloadDocument(crypto.randomUUID(), 'dto_value'),
        ...overrides,
    });

    const _publish = (dto: unknown) => rabbitmqClient.publishToExchange(conf.sdo.dto.import.exchange, dto);

    const _findRecords = async (recordUUID: string) =>
        (
            await adminUserSdk.GetRecordByUUID({
                libraryId: DTO_IMPORTS_LIBRARY_ID,
                recordUUID,
                retrieveInactive: true,
            })
        ).records.list;

    const _getTestValue = async (recordId: string) =>
        (
            await adminUserSdk.GetRecordByIdStandardValuesProperty({
                libraryId: DTO_IMPORTS_LIBRARY_ID,
                recordId,
                attributeId: DTO_TEST_ATTRIBUTE_ID,
            })
        ).records.list[0].property[0].payload;

    // No positive event to wait for when an operation must be rejected/ignored -> wait a fixed delay,
    // longer than the processing time observed on the nominal cases.
    const _waitForProcessing = () => new Promise(resolve => setTimeout(resolve, 5000));

    beforeAll(async () => {
        conf = await getConfig();
        rabbitmqClient = new RabbitMqClient();

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: DTO_TEST_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'DTO test value', en: 'DTO test value'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: DTO_IMPORTS_LIBRARY_ID,
                label: {fr: 'Test DTO', en: 'Test DTO'},
                attributes: ['label', DTO_TEST_ATTRIBUTE_ID],
                recordIdentityConf: {label: 'label'},
            },
        });

        // Same payload as sdoImports.test.ts (the mapping holds every test library), so both suites
        // can save it concurrently without overwriting each other's mapping.
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

    describe('CREATE', () => {
        test('receive a CREATE operation should create an active record', async () => {
            const uuid = crypto.randomUUID();
            const dto = _dto({method: 'CREATE', payloadDocument: _payloadDocument(uuid, 'dto_created_value')});

            await _publish(dto);

            await vi.waitFor(
                async () => {
                    const record = (await _findRecords(uuid))[0];

                    expect(record.uuid).toBe(uuid);
                    expect(record.active).toBe(true);

                    expect(await _getTestValue(record.id)).toBe('dto_created_value');
                },
                {timeout: 5000, interval: 1000},
            );
        });

        test('receive a CREATE operation on an existing systemId should be skipped', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_dto({method: 'CREATE', payloadDocument: _payloadDocument(uuid, 'first_value')}));

            const recordId = await vi.waitFor(
                async () => {
                    const record = (await _findRecords(uuid))[0];
                    expect(record.uuid).toBe(uuid);
                    return record.id;
                },
                {timeout: 5000, interval: 1000},
            );

            // Same systemId, different value: the import must skip it instead of creating a duplicate
            // or overwriting the existing record (idempotence inherited from the SDO import).
            await _publish(_dto({method: 'CREATE', payloadDocument: _payloadDocument(uuid, 'second_value')}));

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(1);
            expect(await _getTestValue(recordId)).toBe('first_value');
        }, 20000);
    });

    describe('UPDATE', () => {
        test('receive an UPDATE operation should update the record', async () => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: DTO_IMPORTS_LIBRARY_ID,
                data: {values: [{attribute: DTO_TEST_ATTRIBUTE_ID, payload: 'value'}]},
            });

            const recordUUID = createRecord.record!.uuid;
            const recordId = createRecord.record!.id;

            await _publish(
                _dto({method: 'UPDATE', payloadDocument: _payloadDocument(recordUUID, 'dto_updated_value')}),
            );

            await vi.waitFor(
                async () => {
                    expect(await _getTestValue(recordId)).toBe('dto_updated_value');
                },
                {timeout: 5000, interval: 1000},
            );
        });

        test('receive an UPDATE operation on an unknown systemId should not create a record', async () => {
            const uuid = crypto.randomUUID();

            await _publish(_dto({method: 'UPDATE', payloadDocument: _payloadDocument(uuid, 'dto_value')}));

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);
    });

    describe('envelope validation', () => {
        test('an operation missing envelope fields should be rejected', async () => {
            const uuid = crypto.randomUUID();
            const {operationId: _operationId, ...incompleteDTO} = _dto({
                payloadDocument: _payloadDocument(uuid, 'dto_value'),
            });

            await _publish(incompleteDTO);

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('an operation with an unsupported method should be rejected', async () => {
            const uuid = crypto.randomUUID();

            await _publish({..._dto({payloadDocument: _payloadDocument(uuid, 'dto_value')}), method: 'DELETE'});

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('an operation targeting an unmapped payloadType should be rejected', async () => {
            const uuid = crypto.randomUUID();

            await _publish(
                _dto({
                    method: 'CREATE',
                    payloadType: 'test_dto_imports_unmapped',
                    payloadDocument: _payloadDocument(uuid, 'dto_value'),
                }),
            );

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);
    });
});
