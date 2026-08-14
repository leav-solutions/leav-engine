import {DTOErrorCode, DTOStatementStatus, type IDTO, type IDTOStatement} from '../../../../_types/dto';
import {type ISDO} from '../../../../_types/sdo';
import {getConfig} from '../../../../config';
import {RabbitMqClient} from './rabbitMQUtils';
import {type IConfig} from '../../../../_types/config';
import {adminUserSdk} from '../e2eUtils';
import {
    DTO_IMPORTS_DISABLED_LIBRARY_ID,
    DTO_IMPORTS_LIBRARY_ID,
    DTO_TEST_ATTRIBUTE_ID,
    DTO_TEST_IDENTIFIER_ATTRIBUTE_ID,
    DTO_TEST_MANDATORY_ATTRIBUTE_ID,
    sdoGlobalSettings,
} from './sdoConfig';
import {AttributeFormat, AttributeType} from '../../_gqlTypes';

/**
 * The DTO import applies the operation through the very same domain as the SDO import (LEAVC-982),
 * so these tests focus on what is specific to the DTO flow: the dedicated exchange, the envelope
 * (`payloadType` / `method` / `payloadDocument`) and the method dispatch. The value mapping itself is
 * covered by `sdoImports.test.ts`.
 */
// Own queue on the statement exchange, prefixed like every other fixture of this file so a suite
// running in parallel can't consume our statements.
const DTO_STATEMENT_TEST_QUEUE = 'test_dto_imports_statement_queue';

// Value of the `identifier.testCode` mapped attribute carried by the nominal documents
const DTO_IDENTIFIER_CODE = 'dto_identifier_code';

describe('DTO Imports', () => {
    let conf: IConfig;
    let rabbitmqClient: RabbitMqClient;

    /**
     * `payloadDocument` has the same shape as an SDO `content` and is validated against the generic
     * SDO JSON schema, which still requires the whole `system` bookkeeping block.
     */
    const _payloadDocument = (
        systemId: string,
        value: string,
        info: Record<string, unknown> = {},
        identifier: Record<string, unknown> = {testCode: DTO_IDENTIFIER_CODE},
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
                systemLabel: 'DTO import label',
            },
            // `identifier.testCode` is mapped to a leav attribute: on a pre-existing record, what the
            // statement reports back is read from the record, not from this block.
            identifier,
            // `info.mandatoryValue` is mapped with `valueRequired: true`: omitting it makes any CREATE
            // rejected, so the nominal documents must always carry it.
            info: {value, mandatoryValue: 'dto_mandatory_value', ...info},
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

    const _publish = (dto: unknown) =>
        rabbitmqClient.publishToExchange(
            conf.sdo.dto.import.exchange,
            dto,
            conf.sdo.dto.import.exchangeType, // `direct`, unlike the SDO fanout exchange
        );

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

    const _waitForStatementOf = (operationId: string) =>
        rabbitmqClient.waitForMessage<IDTOStatement>(
            DTO_STATEMENT_TEST_QUEUE,
            statement => statement.operationId === operationId,
            10000,
        );

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

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: DTO_TEST_MANDATORY_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'DTO test mandatory value', en: 'DTO test mandatory value'},
            },
        });

        await adminUserSdk.SaveAttribute({
            attribute: {
                id: DTO_TEST_IDENTIFIER_ATTRIBUTE_ID,
                type: AttributeType.simple,
                format: AttributeFormat.text,
                label: {fr: 'DTO test identifier code', en: 'DTO test identifier code'},
            },
        });

        await adminUserSdk.SaveLibrary({
            library: {
                id: DTO_IMPORTS_LIBRARY_ID,
                label: {fr: 'Test DTO', en: 'Test DTO'},
                attributes: [
                    'label',
                    DTO_TEST_ATTRIBUTE_ID,
                    DTO_TEST_MANDATORY_ATTRIBUTE_ID,
                    DTO_TEST_IDENTIFIER_ATTRIBUTE_ID,
                ],
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
        await rabbitmqClient.assertExchangeAndBindQueue(
            DTO_STATEMENT_TEST_QUEUE,
            conf.sdo.dto.statement.exchange,
            conf.sdo.dto.statement.exchangeType,
        );
        // The queue is durable and never reset between runs: without this, every statement published
        // by the previous runs has to be drained before the one a test is actually waiting for.
        await rabbitmqClient.purgeQueue(DTO_STATEMENT_TEST_QUEUE);
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

    describe('mandatory fields', () => {
        const _payloadDocumentWithoutMandatoryValue = (systemId: string, value: string): ISDO['content'] => {
            const payloadDocument = _payloadDocument(systemId, value);
            delete (payloadDocument.info as Record<string, unknown>).mandatoryValue;

            return payloadDocument;
        };

        test('a CREATE operation missing a mandatory attribute should be rejected', async () => {
            const uuid = crypto.randomUUID();

            await _publish(
                _dto({method: 'CREATE', payloadDocument: _payloadDocumentWithoutMandatoryValue(uuid, 'dto_value')}),
            );

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('a CREATE operation with an empty mandatory attribute should be rejected', async () => {
            const uuid = crypto.randomUUID();

            await _publish(
                _dto({
                    method: 'CREATE',
                    payloadDocument: _payloadDocument(uuid, 'dto_value', {mandatoryValue: ''}),
                }),
            );

            await _waitForProcessing();

            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 10000);

        test('an UPDATE operation not carrying the mandatory attribute should be applied', async () => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: DTO_IMPORTS_LIBRARY_ID,
                data: {
                    values: [
                        {attribute: DTO_TEST_ATTRIBUTE_ID, payload: 'value'},
                        {attribute: DTO_TEST_MANDATORY_ATTRIBUTE_ID, payload: 'mandatory value'},
                    ],
                },
            });

            const recordUUID = createRecord.record!.uuid;
            const recordId = createRecord.record!.id;

            // An UPDATE is a patch: an absent attribute means "unchanged", not "emptied"
            await _publish(
                _dto({
                    method: 'UPDATE',
                    payloadDocument: _payloadDocumentWithoutMandatoryValue(recordUUID, 'dto_patched_value'),
                }),
            );

            await vi.waitFor(
                async () => {
                    expect(await _getTestValue(recordId)).toBe('dto_patched_value');
                },
                {timeout: 5000, interval: 1000},
            );
        });

        test('an UPDATE operation emptying the mandatory attribute should be rejected', async () => {
            const {createRecord} = await adminUserSdk.CreateRecord({
                library: DTO_IMPORTS_LIBRARY_ID,
                data: {
                    values: [
                        {attribute: DTO_TEST_ATTRIBUTE_ID, payload: 'value'},
                        {attribute: DTO_TEST_MANDATORY_ATTRIBUTE_ID, payload: 'mandatory value'},
                    ],
                },
            });

            const recordUUID = createRecord.record!.uuid;
            const recordId = createRecord.record!.id;

            await _publish(
                _dto({
                    method: 'UPDATE',
                    payloadDocument: _payloadDocument(recordUUID, 'dto_rejected_value', {mandatoryValue: null}),
                }),
            );

            await _waitForProcessing();

            // Nothing of the operation is applied, not even the valid attributes
            expect(await _getTestValue(recordId)).toBe('value');
        }, 10000);
    });

    describe('statement', () => {
        test('an applied CREATE should be answered with a SUCCESS statement', async () => {
            const uuid = crypto.randomUUID();
            const dto = _dto({method: 'CREATE', payloadDocument: _payloadDocument(uuid, 'dto_statement_value')});

            await _publish(dto);

            const statement = await _waitForStatementOf(dto.operationId);

            expect(statement).toMatchObject({
                operationId: dto.operationId,
                requestId: dto.requestId,
                correlationId: dto.correlationId,
                dataModelRelease: dto.dataModelRelease,
                payloadType: DTO_IMPORTS_LIBRARY_ID,
                method: 'CREATE',
                status: DTOStatementStatus.SUCCESS,
                details: null,
                sdo_identifier: {
                    system: {
                        systemId: uuid,
                        systemCreationDate: expect.any(Number),
                        systemLastModifiedDate: expect.any(Number),
                    },
                    // A real creation echoes the received block
                    identifier: {testCode: DTO_IDENTIFIER_CODE},
                },
                date: expect.any(Number),
            });
        }, 15000);

        test('an UPDATE not carrying the identifier block should report the one stored in leav', async () => {
            const uuid = crypto.randomUUID();

            // Create the record first, so it carries the mapped identifier value
            const createDto = _dto({method: 'CREATE', payloadDocument: _payloadDocument(uuid, 'dto_value')});
            await _publish(createDto);
            await _waitForStatementOf(createDto.operationId);

            // The patch says nothing about `identifier`: the statement must still report the stored code
            const updateDto = _dto({
                method: 'UPDATE',
                payloadDocument: _payloadDocument(uuid, 'dto_patched_value', {}, {}),
            });
            await _publish(updateDto);

            expect(await _waitForStatementOf(updateDto.operationId)).toMatchObject({
                status: DTOStatementStatus.SUCCESS,
                sdo_identifier: {
                    system: {systemId: uuid},
                    identifier: {testCode: DTO_IDENTIFIER_CODE},
                },
            });
        }, 25000);

        test('a CREATE on an existing systemId should be answered with a NO_CHANGE statement', async () => {
            const uuid = crypto.randomUUID();

            const firstDto = _dto({method: 'CREATE', payloadDocument: _payloadDocument(uuid, 'first_value')});
            await _publish(firstDto);
            await _waitForStatementOf(firstDto.operationId);

            // Same systemId: the import skips it, so nothing was written
            const secondDto = _dto({method: 'CREATE', payloadDocument: _payloadDocument(uuid, 'second_value')});
            await _publish(secondDto);

            expect(await _waitForStatementOf(secondDto.operationId)).toMatchObject({
                status: DTOStatementStatus.NO_CHANGE,
                details: null,
                sdo_identifier: {system: {systemId: uuid}},
            });
        }, 25000);

        test('a rejected operation should be answered with an ERROR statement carrying the details', async () => {
            const uuid = crypto.randomUUID();
            const dto = _dto({
                method: 'CREATE',
                payloadDocument: _payloadDocument(uuid, 'dto_value', {mandatoryValue: ''}),
            });

            await _publish(dto);

            expect(await _waitForStatementOf(dto.operationId)).toMatchObject({
                status: DTOStatementStatus.ERROR,
                sdo_identifier: null,
                details: [
                    {
                        code: DTOErrorCode.MANDATORY_FIELD_MISSING,
                        attribute: 'info.mandatoryValue',
                        message: 'A mandatory attribute is missing',
                    },
                ],
            });
            expect(await _findRecords(uuid)).toHaveLength(0);
        }, 15000);
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

        test('an operation targeting a payloadType which is not importable should be rejected', async () => {
            const uuid = crypto.randomUUID();
            const dto = _dto({
                method: 'CREATE',
                payloadType: DTO_IMPORTS_DISABLED_LIBRARY_ID,
                payloadDocument: _payloadDocument(uuid, 'dto_value'),
            });

            await _publish(dto);

            // The type is known to the instance, it is just not importable: the emitter is answered
            // a contractual rejection rather than the message being ignored (LEAVC-1091).
            expect(await _waitForStatementOf(dto.operationId)).toMatchObject({
                status: DTOStatementStatus.ERROR,
                sdo_identifier: null,
                details: [
                    {
                        code: DTOErrorCode.NOT_AUTHORIZED,
                        attribute: null,
                        message: 'This instance does not accept imports for this payload type',
                    },
                ],
            });
        }, 15000);
    });
});
