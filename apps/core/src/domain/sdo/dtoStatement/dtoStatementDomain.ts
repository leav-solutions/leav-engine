import {logger} from '@leav/logger';
import {
    type IDTO,
    type IDTOErrorDetail,
    type IDTOStatement,
    type IDTOStatementIdentifier,
    DTOStatementStatus,
} from '../../../_types/dto';
import {type IConfig} from '../../../_types/config';
import {type IRecord} from '../../../_types/record';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type ISDOMappingLibrary} from '../../../_types/sdo';
import {type IRabbitMQ} from '../../../infra/sdo/sdoRabbitMQ';
import {type ISDODomain} from '../sdoDomain';

/** Traceability ids the emitter matches the statement on, echoed as-is from the DTO */
const CORRELATION_ID_FIELDS = ['requestId', 'operationId', 'correlationId'] as const satisfies ReadonlyArray<
    keyof IDTO
>;

export interface IDTOStatementDomainDeps {
    'core.domain.sdo': ISDODomain;
    'core.infra.sdo.rabbitMQ': IRabbitMQ;
    config: IConfig;
}

export interface ISendStatementParams {
    dto: IDTO;
    status: DTOStatementStatus;
    ctx: IQueryInfos;
    /** Contractual error details, only on an `ERROR` statement */
    details?: IDTOErrorDetail[];
    /** The leav record the operation landed on, source of `sdo_identifier` */
    record?: IRecord | null;
    /** Mapping of the targeted SDO type, needed to read the stored `identifier` block back */
    mappingLibrary?: ISDOMappingLibrary;
    /**
     * `true` when the record already existed before the operation (an `UPDATE`, or a `CREATE` skipped
     * because the record was there). The incoming document is then not the source of truth for the
     * business identifiers: they are read back from leav.
     */
    recordPreexisted?: boolean;
}

export interface IDTOStatementDomain {
    sendStatement: (params: ISendStatementParams) => Promise<IDTOStatement | void>;
}

export default function ({
    'core.domain.sdo': sdoDomain,
    'core.infra.sdo.rabbitMQ': rabbitMQService,
    config,
}: IDTOStatementDomainDeps): IDTOStatementDomain {
    const debug = config.sdo.debug ?? false;

    const _receivedIdentifier = (dto: IDTO): Record<string, unknown> =>
        (dto.payloadDocument?.identifier as Record<string, unknown>) ?? {};

    /**
     * On a pre-existing record the incoming document is not the source of truth for the business
     * identifiers: an `UPDATE` patch may not carry the block at all, and a skipped `CREATE` was never
     * applied. They are therefore read back from leav — falling back to what was received rather than
     * losing the whole statement should that read fail.
     */
    const _getIdentifier = async ({
        dto,
        record,
        mappingLibrary,
        recordPreexisted,
        ctx,
    }: ISendStatementParams): Promise<Record<string, unknown>> => {
        if (!recordPreexisted || !mappingLibrary) {
            return _receivedIdentifier(dto);
        }

        try {
            return await sdoDomain.getRecordSDOIdentifier(mappingLibrary, record, ctx);
        } catch (error) {
            logger.warn(
                `[DTO] Could not read the stored identifier block of ${record?.id}, falling back to the received one: ${error.message}`,
            );
            return _receivedIdentifier(dto);
        }
    };

    const _buildSDOIdentifier = async (params: ISendStatementParams): Promise<IDTOStatementIdentifier | null> => {
        const {record} = params;

        if (!record) {
            return null;
        }

        return {
            // Dates come from the leav record, not from the incoming document: the emitter gets the
            // state of the object as it now stands in leav.
            system: {
                systemId: record.uuid,
                systemCreationDate: record.created_at,
                systemLastModifiedDate: record.modified_at,
            },
            identifier: await _getIdentifier(params),
        };
    };

    const sendStatement = async (params: ISendStatementParams): Promise<IDTOStatement | void> => {
        const {dto, status, details} = params;

        if (!config.sdo.dto.statement.enable) {
            return;
        }

        // The contract states the statement is correlated by `requestId` / `operationId` /
        // `correlationId` echoed from the DTO (`correlationId` being the emitter's own key), but says
        // nothing about an operation missing one of them. leav's decision: all three are required to
        // publish, otherwise the statement could not be matched back to the operation.
        const missingCorrelationIds = CORRELATION_ID_FIELDS.filter(field => !dto?.[field]);

        if (missingCorrelationIds.length) {
            logger.warn(
                `[DTO] Statement skipped: the operation carries no ${missingCorrelationIds.join(' / ')} to correlate it with`,
            );
            return;
        }

        const isError = status === DTOStatementStatus.ERROR;

        const statement: IDTOStatement = {
            operationId: dto.operationId,
            requestId: dto.requestId,
            dataModelRelease: dto.dataModelRelease,
            correlationId: dto.correlationId,
            payloadType: dto.payloadType,
            method: dto.method,
            status,
            details: isError ? (details ?? []) : null,
            sdo_identifier: isError ? null : await _buildSDOIdentifier(params),
            date: Math.round(Date.now() / 1000), // epoch in seconds, per the contract
        };

        const {exchange} = config.sdo.dto.statement;
        const statementChannel = await rabbitMQService.getDTOStatementChannel();

        await statementChannel.publish(exchange, '', Buffer.from(JSON.stringify(statement)));

        logger.verbose(`DTO statement ${status} sent for operation ${dto.operationId}`, (debug && {statement}) || {});

        return statement;
    };

    return {
        sendStatement,
    };
}
