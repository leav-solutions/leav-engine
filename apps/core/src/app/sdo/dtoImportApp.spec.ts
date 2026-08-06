import {type IAmqpMessage} from '@leav/message-broker';
import {EventAction} from '@leav/utils';
import {type ToAny} from '../../utils/utils';
import {default as dtoImportApp, type IDTOImportAppDeps} from './dtoImportApp';
import {mockDTO, mockDTOImportMessage, mockSDOMapping, sdoGlobalSettings} from '../../__tests__/mocks/sdo/data';
import {mockDTOStatementDomain, mockImportDomain, mockSdoDomain} from '../../__tests__/mocks/sdo/domains';
import {mockConfig} from '../../__tests__/mocks/sdo/config';
import {mockSystemQueryContext} from '../../__tests__/mocks/sdo/core';
import {DTOErrorCode, DTOStatementStatus} from '../../_types/dto';
import {type ISDOMapping} from '../../_types/sdo';
import sdoUtils from '../../utils/sdo/sdo';
import ValidationError from '../../errors/ValidationError';

const depsBase: ToAny<IDTOImportAppDeps> = {
    'core.domain.sdo': mockSdoDomain,
    'core.domain.sdo.import': mockImportDomain,
    'core.domain.sdo.dtoStatement': mockDTOStatementDomain,
    // Pure mapping helpers, no I/O: using the real implementation keeps the rejection assertions honest
    'core.utils.sdo': sdoUtils(),
    'core.utils.getSystemQueryContext': () => mockSystemQueryContext,
    config: mockConfig,
};

const _messageFor = (dto: unknown): IAmqpMessage =>
    ({
        content: Buffer.from(JSON.stringify(dto)),
    }) as IAmqpMessage;

// `mockSDO.content.simple` holds the value of the "simple" mapped attribute; flagging it required lets
// us build documents which are valid apart from that one attribute.
const mappingWithRequiredSimple: ISDOMapping = {
    ...mockSDOMapping,
    test: {
        ...mockSDOMapping.test,
        sdoAttributes: {
            ...mockSDOMapping.test.sdoAttributes,
            simple: {...mockSDOMapping.test.sdoAttributes.simple, valueRequired: true},
        },
    },
};

const mockImportedRecord = {
    id: '1337',
    library: 'leavLibraryId',
    uuid: mockDTO.payloadDocument.system.systemId,
    created_at: 1728294761,
    modified_at: 1728456120,
};

describe('dtoImportApp', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({...sdoGlobalSettings, importEnable: true});
        mockImportDomain.create.mockResolvedValue({record: mockImportedRecord, changed: true});
        mockImportDomain.update.mockResolvedValue({record: mockImportedRecord, changed: true});
    });

    describe('onDTOEvent()', () => {
        it('[+] should validate the payload document of a well-formed operation', async () => {
            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockSdoDomain.schemaValidation).toHaveBeenCalledTimes(1);
            expect(mockSdoDomain.schemaValidation).toHaveBeenCalledWith(mockDTO.payloadDocument);
        });

        it('[+] should apply an "UPDATE" operation through the SDO import domain', async () => {
            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockImportDomain.update).toHaveBeenCalledTimes(1);
            expect(mockImportDomain.update).toHaveBeenCalledWith(
                {name: mockDTO.payloadType, content: mockDTO.payloadDocument},
                mockSystemQueryContext,
            );
            expect(mockImportDomain.create).not.toHaveBeenCalled();
        });

        it('[+] should apply a "CREATE" operation through the SDO import domain', async () => {
            await dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, method: 'CREATE'}));

            expect(mockImportDomain.create).toHaveBeenCalledTimes(1);
            expect(mockImportDomain.create).toHaveBeenCalledWith(
                {name: mockDTO.payloadType, content: mockDTO.payloadDocument},
                mockSystemQueryContext,
            );
            expect(mockImportDomain.update).not.toHaveBeenCalled();
        });

        it('[+] should send an import log on success', async () => {
            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.DTO_LOG_IMPORT_RECORD,
                dto: mockDTO,
                ctx: mockSystemQueryContext,
            });
        });

        it('[+] should ignore the operation when imports are globally disabled', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({...sdoGlobalSettings, importEnable: false});

            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockSdoDomain.schemaValidation).not.toHaveBeenCalled();
            expect(mockImportDomain.create).not.toHaveBeenCalled();
            expect(mockImportDomain.update).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).not.toHaveBeenCalled();
        });

        it('[-] should reject an operation missing envelope fields', async () => {
            const {operationId: _operationId, payloadDocument: _payloadDocument, ...incompleteDTO} = mockDTO;

            // A functional rejection is acked: the handler resolves instead of throwing
            await dtoImportApp(depsBase).onDTOEvent(_messageFor(incompleteDTO));

            expect(mockSdoDomain.schemaValidation).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: EventAction.DTO_LOG_ERROR,
                    error: expect.objectContaining({
                        message: expect.stringContaining('missing operationId, payloadDocument'),
                        details: [
                            {
                                code: DTOErrorCode.MANDATORY_FIELD_MISSING,
                                attribute: 'operationId',
                                message: 'A mandatory envelope field is missing',
                            },
                            {
                                code: DTOErrorCode.MANDATORY_FIELD_MISSING,
                                attribute: 'payloadDocument',
                                message: 'A mandatory envelope field is missing',
                            },
                        ],
                    }),
                }),
            );
        });

        it('[-] should reject an unsupported method', async () => {
            await dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, method: 'DELETE'}));

            expect(mockSdoDomain.schemaValidation).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: EventAction.DTO_LOG_ERROR,
                    error: expect.objectContaining({
                        details: [
                            {
                                code: DTOErrorCode.INVALID_METHOD,
                                attribute: null,
                                message: 'Unsupported method DELETE',
                            },
                        ],
                    }),
                }),
            );
        });

        it('[-] should reject an operation targeting an unmapped payloadType', async () => {
            await dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, payloadType: 'unmapped'}));

            expect(mockImportDomain.create).not.toHaveBeenCalled();
            expect(mockImportDomain.update).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: EventAction.DTO_LOG_ERROR,
                    error: expect.objectContaining({
                        details: [
                            {
                                code: DTOErrorCode.INVALID_TYPE,
                                attribute: null,
                                message: 'Unknown payload type unmapped',
                            },
                        ],
                    }),
                }),
            );
        });

        it('[-] should reject a "CREATE" operation missing a required attribute', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({
                ...sdoGlobalSettings,
                importEnable: true,
                mapping: mappingWithRequiredSimple,
            });
            const {simple: _simple, ...payloadDocumentWithoutSimple} = mockDTO.payloadDocument;

            await dtoImportApp(depsBase).onDTOEvent(
                _messageFor({...mockDTO, method: 'CREATE', payloadDocument: payloadDocumentWithoutSimple}),
            );

            expect(mockImportDomain.create).not.toHaveBeenCalled();
            expect(mockImportDomain.update).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: EventAction.DTO_LOG_ERROR,
                    error: expect.objectContaining({
                        details: [
                            {
                                code: DTOErrorCode.MANDATORY_FIELD_MISSING,
                                attribute: 'simple',
                                message: 'A mandatory attribute is missing',
                            },
                        ],
                    }),
                }),
            );
        });

        it('[-] should reject an "UPDATE" operation explicitly emptying a required attribute', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({
                ...sdoGlobalSettings,
                importEnable: true,
                mapping: mappingWithRequiredSimple,
            });

            await dtoImportApp(depsBase).onDTOEvent(
                _messageFor({...mockDTO, payloadDocument: {...mockDTO.payloadDocument, simple: null}}),
            );

            expect(mockImportDomain.update).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: EventAction.DTO_LOG_ERROR,
                    error: expect.objectContaining({
                        details: [
                            {
                                code: DTOErrorCode.MANDATORY_FIELD_MISSING,
                                attribute: 'simple',
                                message: 'A mandatory attribute is missing',
                            },
                        ],
                    }),
                }),
            );
        });

        it('[+] should apply an "UPDATE" operation not carrying a required attribute, since it is a patch', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({
                ...sdoGlobalSettings,
                importEnable: true,
                mapping: mappingWithRequiredSimple,
            });
            const {simple: _simple, ...payloadDocumentWithoutSimple} = mockDTO.payloadDocument;

            await dtoImportApp(depsBase).onDTOEvent(
                _messageFor({...mockDTO, payloadDocument: payloadDocumentWithoutSimple}),
            );

            expect(mockImportDomain.update).toHaveBeenCalledTimes(1);
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith(
                expect.objectContaining({action: EventAction.DTO_LOG_IMPORT_RECORD}),
            );
        });

        it('[-] should reject if payload document schema validation throws', async () => {
            const validationError = new ValidationError({dontcare: 'error-field'}, 'Schema validation error');
            mockSdoDomain.schemaValidation.mockRejectedValueOnce(validationError);

            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockImportDomain.update).not.toHaveBeenCalled();
            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith(
                expect.objectContaining({
                    action: EventAction.DTO_LOG_ERROR,
                    error: expect.objectContaining({
                        details: [
                            {
                                code: DTOErrorCode.INVALID_FIELD_FORMAT,
                                attribute: null,
                                message: 'Schema validation error',
                            },
                        ],
                    }),
                }),
            );
        });

        it('[-] should reject if message is not a valid JSON', async () => {
            const invalidMsg = {
                content: Buffer.from('invalid-json'),
            } as IAmqpMessage;

            await expect(dtoImportApp(depsBase).onDTOEvent(invalidMsg)).rejects.toThrow();
        });

        it('[-] should send an error log then rethrow when the import domain fails', async () => {
            const importError = new Error('Record not found');
            mockImportDomain.update.mockRejectedValueOnce(importError);

            await expect(dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage)).rejects.toThrow(importError);

            expect(mockSdoDomain.sendLog).toHaveBeenCalledWith({
                action: EventAction.DTO_LOG_ERROR,
                error: {message: 'Record not found', stack: expect.any(String)},
                dto: mockDTO,
                ctx: mockSystemQueryContext,
            });
        });
    });

    describe('statement', () => {
        it('[+] should answer a SUCCESS statement carrying the imported record', async () => {
            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockDTOStatementDomain.sendStatement).toHaveBeenCalledTimes(1);
            expect(mockDTOStatementDomain.sendStatement).toHaveBeenCalledWith({
                dto: mockDTO,
                status: DTOStatementStatus.SUCCESS,
                record: mockImportedRecord,
                mappingLibrary: mockSDOMapping[mockDTO.payloadType],
                // An UPDATE patches an existing record: its stored identifiers win over the received ones
                recordPreexisted: true,
                ctx: mockSystemQueryContext,
            });
        });

        it('[+] should answer a SUCCESS statement on a "CREATE" operation', async () => {
            await dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, method: 'CREATE'}));

            expect(mockDTOStatementDomain.sendStatement).toHaveBeenCalledWith(
                expect.objectContaining({
                    status: DTOStatementStatus.SUCCESS,
                    // A real creation: the received document is the source of truth
                    recordPreexisted: false,
                }),
            );
        });

        it('[+] should answer a NO_CHANGE statement when the import wrote nothing', async () => {
            // A "CREATE" on an already existing record is skipped by the import domain
            mockImportDomain.create.mockResolvedValue({record: mockImportedRecord, changed: false});

            await dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, method: 'CREATE'}));

            expect(mockDTOStatementDomain.sendStatement).toHaveBeenCalledWith({
                dto: {...mockDTO, method: 'CREATE'},
                status: DTOStatementStatus.NO_CHANGE,
                record: mockImportedRecord,
                mappingLibrary: mockSDOMapping[mockDTO.payloadType],
                // Skipped because the record was already there: nothing of the document was applied
                recordPreexisted: true,
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should answer an ERROR statement carrying the rejection details', async () => {
            await dtoImportApp(depsBase).onDTOEvent(_messageFor({...mockDTO, payloadType: 'unmapped'}));

            expect(mockDTOStatementDomain.sendStatement).toHaveBeenCalledWith({
                dto: {...mockDTO, payloadType: 'unmapped'},
                status: DTOStatementStatus.ERROR,
                details: [{code: DTOErrorCode.INVALID_TYPE, attribute: null, message: 'Unknown payload type unmapped'}],
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should answer an INTERNAL_ERROR statement then rethrow when the import fails technically', async () => {
            mockImportDomain.update.mockRejectedValueOnce(new Error('Record not found'));

            await expect(dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage)).rejects.toThrow('Record not found');

            expect(mockDTOStatementDomain.sendStatement).toHaveBeenCalledWith({
                dto: mockDTO,
                status: DTOStatementStatus.ERROR,
                details: [{code: DTOErrorCode.INTERNAL_ERROR, attribute: null, message: 'Record not found'}],
                ctx: mockSystemQueryContext,
            });
        });

        it('[-] should answer no statement when imports are globally disabled', async () => {
            mockSdoDomain.getSDOGlobalSettings.mockResolvedValue({...sdoGlobalSettings, importEnable: false});

            await dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage);

            expect(mockDTOStatementDomain.sendStatement).not.toHaveBeenCalled();
        });

        it('[-] should not fail a successful import when the statement cannot be published', async () => {
            mockDTOStatementDomain.sendStatement.mockRejectedValue(new Error('Broker unreachable'));

            await expect(dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage)).resolves.toBeUndefined();

            expect(mockImportDomain.update).toHaveBeenCalledTimes(1);
        });

        it('[-] should keep rethrowing the original error when the statement cannot be published', async () => {
            mockImportDomain.update.mockRejectedValueOnce(new Error('Record not found'));
            mockDTOStatementDomain.sendStatement.mockRejectedValue(new Error('Broker unreachable'));

            await expect(dtoImportApp(depsBase).onDTOEvent(mockDTOImportMessage)).rejects.toThrow('Record not found');
        });
    });
});
