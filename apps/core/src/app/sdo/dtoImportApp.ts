import {type AmqpMessageHandler} from '@leav/message-broker';
import {logger} from '@leav/logger';
import {type IDTO} from '../../_types/dto';
import {type IConfig} from '../../_types/config';
import {type ISDODomain} from '../../domain/sdo/sdoDomain';
import ValidationError from '../../errors/ValidationError';

export interface IDTOImportAppDeps {
    'core.domain.sdo': ISDODomain;
    config: IConfig;
}

export interface IDTOImportApp {
    onDTOEvent: AmqpMessageHandler;
}

const REQUIRED_ENVELOPE_FIELDS = [
    'requestId',
    'operationId',
    'correlationId',
    'payloadType',
    'method',
    'payloadDocument',
] as const satisfies ReadonlyArray<keyof IDTO>;

const SUPPORTED_METHODS: ReadonlyArray<IDTO['method']> = ['CREATE', 'UPDATE'];

export default function ({'core.domain.sdo': sdoDomain, config}: IDTOImportAppDeps): IDTOImportApp {
    const debug = config.sdo.debug ?? false;

    const _validateEnvelope = (dto: IDTO): void => {
        const missingFields = REQUIRED_ENVELOPE_FIELDS.filter(field => dto[field] === undefined || dto[field] === null);

        if (missingFields.length) {
            throw new ValidationError(
                Object.fromEntries(missingFields.map(field => [field, 'Missing required field'])),
                `[dtoImportApp]: invalid DTO envelope, missing ${missingFields.join(', ')}`,
                true,
            );
        }

        if (!SUPPORTED_METHODS.includes(dto.method)) {
            throw new ValidationError({method: dto.method}, `[dtoImportApp]: unsupported method ${dto.method}`, true);
        }
    };

    const onDTOEvent: AmqpMessageHandler = async msg => {
        try {
            const dto: IDTO = JSON.parse(msg.content.toString());

            _validateEnvelope(dto);

            debug && logger.debug('DTO import: operation received', {dto});

            // `payloadDocument` has the same shape as an SDO `content`, so the generic SDO JSON
            // schema applies to both flows.
            await sdoDomain.schemaValidation(dto.payloadDocument);

            // Applying the operation on the records (LEAVC-982) and publishing the resulting
            // statement (LEAVC-983) are not implemented yet: for now this app only listens on the
            // dedicated DTO import exchange and validates the incoming operations.
            logger.info('DTO import: operation validated but not applied yet', {
                requestId: dto.requestId,
                operationId: dto.operationId,
                correlationId: dto.correlationId,
                payloadType: dto.payloadType,
                method: dto.method,
            });
        } catch (error) {
            logger.error(`Error in dtoImportApp::onDTOEvent(): ${error.message}`, {
                errorId: error.errorId,
                stack: error.stack,
            });

            // Rethrow: createAmqpConnection's default contract nacks the message (no requeue) on throw.
            throw error;
        }
    };

    return {
        onDTOEvent,
    };
}
