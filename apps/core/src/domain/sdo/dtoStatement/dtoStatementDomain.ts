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
import {type IRabbitMQ} from '../../../infra/sdo/sdoRabbitMQ';

/** Traceability ids the emitter matches the statement on, echoed as-is from the DTO */
const CORRELATION_ID_FIELDS = ['requestId', 'operationId', 'correlationId'] as const satisfies ReadonlyArray<
    keyof IDTO
>;

export interface IDTOStatementDomainDeps {
    'core.infra.sdo.rabbitMQ': IRabbitMQ;
    config: IConfig;
}

export interface ISendStatementParams {
    dto: IDTO;
    status: DTOStatementStatus;
    /** Contractual error details, only on an `ERROR` statement */
    details?: IDTOErrorDetail[];
    /** The leav record the operation landed on, source of `sdo_identifier` */
    record?: IRecord | null;
}

export interface IDTOStatementDomain {
    sendStatement: (params: ISendStatementParams) => Promise<void>;
}

export default function ({
    'core.infra.sdo.rabbitMQ': rabbitMQService,
    config,
}: IDTOStatementDomainDeps): IDTOStatementDomain {
    const debug = config.sdo.debug ?? false;

    const _buildSDOIdentifier = (dto: IDTO, record?: IRecord | null): IDTOStatementIdentifier | null => {
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
            // The `identifier` block holds business identifiers leav doesn't own, echoed as received.
            identifier: (dto.payloadDocument?.identifier as Record<string, unknown>) ?? {},
        };
    };

    const sendStatement = async ({dto, status, details, record}: ISendStatementParams): Promise<void> => {
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
            sdo_identifier: isError ? null : _buildSDOIdentifier(dto, record),
            date: Math.round(Date.now() / 1000), // epoch in seconds, per the contract
        };

        const {exchange} = config.sdo.dto.statement;
        const statementChannel = await rabbitMQService.getDTOStatementChannel();

        await statementChannel.publish(exchange, '', Buffer.from(JSON.stringify(statement)));

        logger.verbose(`DTO statement ${status} sent for operation ${dto.operationId}`, (debug && {statement}) || {});
    };

    return {
        sendStatement,
    };
}
