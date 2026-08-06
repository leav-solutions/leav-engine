import {DTOErrorCode, DTOStatementStatus, type IDTO, type IDTOStatement} from '../../../_types/dto';
import {type IConfig} from '../../../_types/config';
import {type IRecord} from '../../../_types/record';
import {type ISDOMappingLibrary} from '../../../_types/sdo';
import {type ToAny} from '../../../utils/utils';
import {mockConfig} from '../../../__tests__/mocks/sdo/config';
import {mockDTO} from '../../../__tests__/mocks/sdo/data';
import {mockSdoDomain} from '../../../__tests__/mocks/sdo/domains';
import {mockSystemQueryContext} from '../../../__tests__/mocks/sdo/core';
import mockRabbitMQService, {
    dtoStatementChannel,
    setupMockRabbitMQService,
} from '../../../__tests__/mocks/sdo/rabbitMQ';
import dtoStatementDomain, {type IDTOStatementDomainDeps, type ISendStatementParams} from './dtoStatementDomain';

const depsBase: ToAny<IDTOStatementDomainDeps> = {
    'core.domain.sdo': mockSdoDomain,
    'core.infra.sdo.rabbitMQ': mockRabbitMQService,
    config: mockConfig,
};

const mockRecord: IRecord = {
    id: '1337',
    library: 'leavLibraryId',
    uuid: 'e6b1a5d0-0c1e-4f2a-9b3c-5d6e7f809192',
    created_at: 1728294761,
    modified_at: 1728456120,
};

const mockMappingLibrary: ISDOMappingLibrary = {
    leavLibraryId: 'leavLibraryId',
    sdoAttributes: {
        'identifier.pacId': {leavAttributeId: 'pac_id', valueRequired: false, format: 'string'},
    },
};

const _sendStatement = (
    params: Omit<ISendStatementParams, 'ctx'>,
    deps: ToAny<IDTOStatementDomainDeps> = depsBase,
): Promise<void> => dtoStatementDomain(deps).sendStatement({...params, ctx: mockSystemQueryContext});

const _publishedStatement = (): IDTOStatement => JSON.parse(dtoStatementChannel.publish.mock.calls[0][2].toString());

describe('dtoStatementDomain', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupMockRabbitMQService();
    });

    describe('sendStatement()', () => {
        it('[+] should publish a SUCCESS statement echoing the DTO traceability ids', async () => {
            await _sendStatement({dto: mockDTO, status: DTOStatementStatus.SUCCESS, record: mockRecord});

            expect(dtoStatementChannel.publish).toHaveBeenCalledTimes(1);
            expect(dtoStatementChannel.publish.mock.calls[0][0]).toBe(mockConfig.sdo.dto.statement.exchange);
            // Empty routing key, like every other publication of the SDO/DTO flow
            expect(dtoStatementChannel.publish.mock.calls[0][1]).toBe('');

            expect(_publishedStatement()).toEqual({
                operationId: mockDTO.operationId,
                requestId: mockDTO.requestId,
                dataModelRelease: mockDTO.dataModelRelease,
                correlationId: mockDTO.correlationId,
                payloadType: mockDTO.payloadType,
                method: mockDTO.method,
                status: DTOStatementStatus.SUCCESS,
                details: null,
                sdo_identifier: {
                    system: {
                        systemId: mockRecord.uuid,
                        systemCreationDate: mockRecord.created_at,
                        systemLastModifiedDate: mockRecord.modified_at,
                    },
                    identifier: {},
                },
                date: expect.any(Number),
            });
        });

        it('[+] should date the statement in seconds, not milliseconds', async () => {
            const nowInSeconds = Math.round(Date.now() / 1000);

            await _sendStatement({dto: mockDTO, status: DTOStatementStatus.SUCCESS, record: mockRecord});

            expect(_publishedStatement().date).toBeCloseTo(nowInSeconds, -1);
        });

        it('[+] should publish a NO_CHANGE statement carrying the identity of the untouched record', async () => {
            await _sendStatement({dto: mockDTO, status: DTOStatementStatus.NO_CHANGE, record: mockRecord});

            expect(_publishedStatement()).toMatchObject({
                status: DTOStatementStatus.NO_CHANGE,
                details: null,
                sdo_identifier: {system: {systemId: mockRecord.uuid}},
            });
        });

        it('[+] should publish an ERROR statement carrying the details and no identifier', async () => {
            const details = [
                {
                    code: DTOErrorCode.MANDATORY_FIELD_MISSING,
                    attribute: 'info.label',
                    message: 'A mandatory attribute is missing',
                },
            ];

            await _sendStatement({dto: mockDTO, status: DTOStatementStatus.ERROR, details});

            expect(_publishedStatement()).toMatchObject({
                status: DTOStatementStatus.ERROR,
                details,
                sdo_identifier: null,
            });
        });

        it('[+] should not carry an identifier when no record is known', async () => {
            await _sendStatement({dto: mockDTO, status: DTOStatementStatus.SUCCESS});

            expect(_publishedStatement().sdo_identifier).toBeNull();
        });

        describe('identifier block', () => {
            const receivedIdentifier = {pacId: 'received-pac', customerInternalCode: 'received-code'};
            const dtoWithIdentifier = {
                ...mockDTO,
                payloadDocument: {...mockDTO.payloadDocument, identifier: receivedIdentifier},
            } as IDTO;

            it('[+] should echo the received one on a real creation', async () => {
                await _sendStatement({
                    dto: dtoWithIdentifier,
                    status: DTOStatementStatus.SUCCESS,
                    record: mockRecord,
                    mappingLibrary: mockMappingLibrary,
                    recordPreexisted: false,
                });

                expect(_publishedStatement().sdo_identifier.identifier).toEqual(receivedIdentifier);
                expect(mockSdoDomain.getRecordSDOIdentifier).not.toHaveBeenCalled();
            });

            it('[+] should read it back from leav when the record already existed', async () => {
                // Deliberately different from what the operation carried: leav's state must win
                mockSdoDomain.getRecordSDOIdentifier.mockResolvedValue({pacId: 'stored-pac'});

                await _sendStatement({
                    dto: dtoWithIdentifier,
                    status: DTOStatementStatus.SUCCESS,
                    record: mockRecord,
                    mappingLibrary: mockMappingLibrary,
                    recordPreexisted: true,
                });

                expect(mockSdoDomain.getRecordSDOIdentifier).toHaveBeenCalledWith(
                    mockMappingLibrary,
                    mockRecord,
                    mockSystemQueryContext,
                );
                expect(_publishedStatement().sdo_identifier.identifier).toEqual({pacId: 'stored-pac'});
            });

            it('[-] should fall back to the received one when reading it back fails', async () => {
                mockSdoDomain.getRecordSDOIdentifier.mockRejectedValue(new Error('attribute not found in LEAV'));

                await _sendStatement({
                    dto: dtoWithIdentifier,
                    status: DTOStatementStatus.SUCCESS,
                    record: mockRecord,
                    mappingLibrary: mockMappingLibrary,
                    recordPreexisted: true,
                });

                // The statement is still published: the identifier block must not cost us the answer
                expect(dtoStatementChannel.publish).toHaveBeenCalledTimes(1);
                expect(_publishedStatement().sdo_identifier.identifier).toEqual(receivedIdentifier);
            });

            it('[-] should echo the received one when the mapping of the type is unknown', async () => {
                await _sendStatement({
                    dto: dtoWithIdentifier,
                    status: DTOStatementStatus.SUCCESS,
                    record: mockRecord,
                    recordPreexisted: true,
                });

                expect(mockSdoDomain.getRecordSDOIdentifier).not.toHaveBeenCalled();
                expect(_publishedStatement().sdo_identifier.identifier).toEqual(receivedIdentifier);
            });
        });

        it('[-] should publish nothing when statements are disabled', async () => {
            const config = {
                ...mockConfig,
                sdo: {...mockConfig.sdo, dto: {...mockConfig.sdo.dto, statement: {enable: false}}},
            } as unknown as IConfig;

            await _sendStatement({dto: mockDTO, status: DTOStatementStatus.SUCCESS, record: mockRecord}, {
                ...depsBase,
                config,
            } as ToAny<IDTOStatementDomainDeps>);

            expect(dtoStatementChannel.publish).not.toHaveBeenCalled();
        });

        // Any of the three is enough to make the statement unmatchable by the emitter
        it.each(['requestId', 'operationId', 'correlationId'] as const)(
            '[-] should publish nothing for an operation without %s, which cannot be correlated',
            async missingField => {
                const {[missingField]: _missing, ...dtoWithoutCorrelationId} = mockDTO;

                await _sendStatement({
                    dto: dtoWithoutCorrelationId as IDTO,
                    status: DTOStatementStatus.ERROR,
                    details: [
                        {code: DTOErrorCode.MANDATORY_FIELD_MISSING, attribute: missingField, message: 'missing'},
                    ],
                });

                expect(dtoStatementChannel.publish).not.toHaveBeenCalled();
            },
        );
    });
});
