import {DTOErrorCode, DTOStatementStatus, type IDTO, type IDTOStatement} from '../../../_types/dto';
import {type IConfig} from '../../../_types/config';
import {type IRecord} from '../../../_types/record';
import {type ToAny} from '../../../utils/utils';
import {mockConfig} from '../../../__tests__/mocks/sdo/config';
import {mockDTO} from '../../../__tests__/mocks/sdo/data';
import mockRabbitMQService, {
    dtoStatementChannel,
    setupMockRabbitMQService,
} from '../../../__tests__/mocks/sdo/rabbitMQ';
import dtoStatementDomain, {type IDTOStatementDomainDeps} from './dtoStatementDomain';

const depsBase: ToAny<IDTOStatementDomainDeps> = {
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

const _publishedStatement = (): IDTOStatement => JSON.parse(dtoStatementChannel.publish.mock.calls[0][2].toString());

describe('dtoStatementDomain', () => {
    beforeEach(() => {
        vi.resetAllMocks();
        setupMockRabbitMQService();
    });

    describe('sendStatement()', () => {
        it('[+] should publish a SUCCESS statement echoing the DTO traceability ids', async () => {
            await dtoStatementDomain(depsBase).sendStatement({
                dto: mockDTO,
                status: DTOStatementStatus.SUCCESS,
                record: mockRecord,
            });

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

            await dtoStatementDomain(depsBase).sendStatement({
                dto: mockDTO,
                status: DTOStatementStatus.SUCCESS,
                record: mockRecord,
            });

            expect(_publishedStatement().date).toBeCloseTo(nowInSeconds, -1);
        });

        it('[+] should echo the payload document identifier block', async () => {
            const identifier = {pacId: 'a-pac-uuid', customerInternalCode: null};

            await dtoStatementDomain(depsBase).sendStatement({
                dto: {...mockDTO, payloadDocument: {...mockDTO.payloadDocument, identifier}} as IDTO,
                status: DTOStatementStatus.SUCCESS,
                record: mockRecord,
            });

            expect(_publishedStatement().sdo_identifier.identifier).toEqual(identifier);
        });

        it('[+] should publish a NO_CHANGE statement carrying the identity of the untouched record', async () => {
            await dtoStatementDomain(depsBase).sendStatement({
                dto: mockDTO,
                status: DTOStatementStatus.NO_CHANGE,
                record: mockRecord,
            });

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

            await dtoStatementDomain(depsBase).sendStatement({
                dto: mockDTO,
                status: DTOStatementStatus.ERROR,
                details,
            });

            expect(_publishedStatement()).toMatchObject({
                status: DTOStatementStatus.ERROR,
                details,
                sdo_identifier: null,
            });
        });

        it('[+] should not carry an identifier when no record is known', async () => {
            await dtoStatementDomain(depsBase).sendStatement({dto: mockDTO, status: DTOStatementStatus.SUCCESS});

            expect(_publishedStatement().sdo_identifier).toBeNull();
        });

        it('[-] should publish nothing when statements are disabled', async () => {
            const config = {
                ...mockConfig,
                sdo: {...mockConfig.sdo, dto: {...mockConfig.sdo.dto, statement: {enable: false}}},
            } as unknown as IConfig;

            await dtoStatementDomain({...depsBase, config}).sendStatement({
                dto: mockDTO,
                status: DTOStatementStatus.SUCCESS,
                record: mockRecord,
            });

            expect(dtoStatementChannel.publish).not.toHaveBeenCalled();
        });

        // Any of the three is enough to make the statement unmatchable by the emitter
        it.each(['requestId', 'operationId', 'correlationId'] as const)(
            '[-] should publish nothing for an operation without %s, which cannot be correlated',
            async missingField => {
                const {[missingField]: _missing, ...dtoWithoutCorrelationId} = mockDTO;

                await dtoStatementDomain(depsBase).sendStatement({
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
