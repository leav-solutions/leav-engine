import {type AmqpMessageHandler} from '@leav/message-broker';
import {logger} from '@leav/logger';
import {EventAction} from '@leav/utils';
import {type IDTO} from '../../_types/dto';
import {type ISDOImportPayload} from '../../_types/sdo';
import {type IConfig} from '../../_types/config';
import {type ISDODomain} from '../../domain/sdo/sdoDomain';
import {type ISDOImportDomain} from '../../domain/sdo/import/sdoImportDomain';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';
import LeavError from '../../errors/LeavError';
import ValidationError from '../../errors/ValidationError';

export interface IDTOImportAppDeps {
    'core.domain.sdo': ISDODomain;
    'core.domain.sdo.import': ISDOImportDomain;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
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

export default function ({
    'core.domain.sdo': sdoDomain,
    'core.domain.sdo.import': sdoImportDomain,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    config,
}: IDTOImportAppDeps): IDTOImportApp {
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
        const _systemQueryContext = getSystemQueryContext('sdo::dtoImportApp:onDTOEvent');
        let dto: IDTO;

        try {
            dto = JSON.parse(msg.content.toString());

            const sdoGlobalSettings = await sdoDomain.getSDOGlobalSettings(_systemQueryContext);

            if (sdoGlobalSettings.importEnable === false) {
                return;
            }

            _validateEnvelope(dto);

            debug && logger.debug('DTO import: operation received', {dto});

            // `payloadDocument` has the same shape as an SDO `content`, so the generic SDO JSON
            // schema applies to both flows.
            await sdoDomain.schemaValidation(dto.payloadDocument);

            // A DTO carries the same information the SDO import needs: the SDO type (mapping key)
            // and the entity content. The import domain is therefore reused as-is.
            const importPayload: ISDOImportPayload = {name: dto.payloadType, content: dto.payloadDocument};

            switch (dto.method) {
                case 'CREATE':
                    await sdoImportDomain.create(importPayload, _systemQueryContext);
                    break;
                case 'UPDATE':
                    await sdoImportDomain.update(importPayload, _systemQueryContext);
                    break;
                default:
                    // Defensive: _validateEnvelope already rejected any other method.
                    throw new ValidationError(
                        {method: dto.method},
                        `[dtoImportApp]: unsupported method ${dto.method}`,
                        true,
                    );
            }

            await sdoDomain.sendLog({
                action: EventAction.DTO_LOG_IMPORT_RECORD,
                dto,
                ctx: _systemQueryContext,
            });
        } catch (error) {
            logger.error(`Error in dtoImportApp::onDTOEvent(): ${error.message}`, {
                errorId: error.errorId,
                stack: error.stack,
            });

            await sdoDomain.sendLog({
                action: EventAction.DTO_LOG_ERROR,
                error:
                    error instanceof LeavError
                        ? {
                              type: error.type,
                              message: error.message,
                              fields: error.fields,
                              record: error.record,
                              errorIdInStdout: error.errorId,
                              stack: error.stack,
                          }
                        : {
                              message: error.message,
                              stack: error.stack,
                          },
                dto,
                ctx: _systemQueryContext,
            });

            // Rethrow: createAmqpConnection's default contract nacks the message (no requeue) on throw.
            // Publishing the resulting statement is handled separately (LEAVC-983).
            throw error;
        }
    };

    return {
        onDTOEvent,
    };
}
