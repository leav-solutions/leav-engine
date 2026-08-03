import {type AmqpMessageHandler} from '@leav/message-broker';
import {logger} from '@leav/logger';
import {EventAction} from '@leav/utils';
import {DTOErrorCode, type IDTO} from '../../_types/dto';
import {type ISDOImportPayload, type ISDOMappingLibrary} from '../../_types/sdo';
import {type IConfig} from '../../_types/config';
import {type ISDODomain} from '../../domain/sdo/sdoDomain';
import {type ISDOImportDomain} from '../../domain/sdo/import/sdoImportDomain';
import {type ISDOUtils} from '../../utils/sdo/sdo';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';
import LeavError from '../../errors/LeavError';
import DTORejectionError from '../../errors/DTORejectionError';

export interface IDTOImportAppDeps {
    'core.domain.sdo': ISDODomain;
    'core.domain.sdo.import': ISDOImportDomain;
    'core.utils.sdo': ISDOUtils;
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
    'core.utils.sdo': sdoUtils,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    config,
}: IDTOImportAppDeps): IDTOImportApp {
    const debug = config.sdo.debug ?? false;

    const _validateEnvelope = (dto: IDTO): void => {
        const missingFields = REQUIRED_ENVELOPE_FIELDS.filter(field => dto[field] === undefined || dto[field] === null);

        if (missingFields.length) {
            // An operation missing `operationId` / `correlationId` cannot be correlated by the emitter:
            // its statement will be unusable as is. How to report it is up to the statement publication
            // (LEAVC-983); here we only reject with a contractual code.
            throw new DTORejectionError(
                missingFields.map(field => ({
                    code: DTOErrorCode.MANDATORY_FIELD_MISSING,
                    attribute: field,
                    message: 'A mandatory envelope field is missing',
                })),
                `[dtoImportApp]: invalid DTO envelope, missing ${missingFields.join(', ')}`,
            );
        }

        if (!SUPPORTED_METHODS.includes(dto.method)) {
            throw new DTORejectionError(
                [
                    {
                        code: DTOErrorCode.INVALID_METHOD,
                        attribute: null,
                        message: `Unsupported method ${dto.method}`,
                    },
                ],
                `[dtoImportApp]: unsupported method ${dto.method}`,
            );
        }
    };

    const _validatePayloadDocument = async (dto: IDTO): Promise<void> => {
        // `payloadDocument` has the same shape as an SDO `content`, so the generic SDO JSON
        // schema applies to both flows.
        try {
            await sdoDomain.schemaValidation(dto.payloadDocument);
        } catch (error) {
            throw new DTORejectionError(
                [{code: DTOErrorCode.INVALID_FIELD_FORMAT, attribute: null, message: error.message}],
                `[dtoImportApp]: invalid payload document, ${error.message}`,
            );
        }
    };

    /**
     * LEAVC-956: an attribute flagged `valueRequired` in the SDO mapping must carry a value, otherwise
     * the whole operation is rejected — nothing is imported.
     */
    const _validateRequiredValues = (dto: IDTO, mappingLibrary: ISDOMappingLibrary): void => {
        const missingAttributes = sdoUtils.getMissingRequiredSDOAttributes(
            mappingLibrary,
            dto.payloadDocument,
            dto.method,
        );

        if (missingAttributes.length) {
            throw new DTORejectionError(
                missingAttributes.map(attribute => ({
                    code: DTOErrorCode.MANDATORY_FIELD_MISSING,
                    attribute,
                    message: 'A mandatory attribute is missing',
                })),
            );
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

            await _validatePayloadDocument(dto);

            // The mapping is keyed by SDO type: no entry means the payload type is unknown to this
            // instance. Checked here to reject with a contractual code, before the import domain
            // fails on a generic "Library not found".
            const mappingLibrary = sdoGlobalSettings.mapping[dto.payloadType];

            if (!mappingLibrary) {
                throw new DTORejectionError([
                    {
                        code: DTOErrorCode.INVALID_TYPE,
                        attribute: null,
                        message: `Unknown payload type ${dto.payloadType}`,
                    },
                ]);
            }

            _validateRequiredValues(dto, mappingLibrary);

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
                    throw new DTORejectionError(
                        [
                            {
                                code: DTOErrorCode.INVALID_METHOD,
                                attribute: null,
                                message: `Unsupported method ${dto.method}`,
                            },
                        ],
                        `[dtoImportApp]: unsupported method ${dto.method}`,
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
                              ...(error instanceof DTORejectionError && {details: error.details}),
                          }
                        : {
                              message: error.message,
                              stack: error.stack,
                          },
                dto,
                ctx: _systemQueryContext,
            });

            if (error instanceof DTORejectionError) {
                // A functional rejection is a *processed* operation: the message is acked (returning
                // resolves createAmqpConnection's default contract) and the answer to the emitter is an
                // `ERROR` statement carrying `error.details` (published by LEAVC-983).
                return;
            }

            // Technical failure: rethrow so createAmqpConnection nacks the message (no requeue).
            throw error;
        }
    };

    return {
        onDTOEvent,
    };
}
