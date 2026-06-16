import {type ConsumeMessage} from 'amqplib';
import {type IDbEvent, EventAction} from '@leav/utils';
import {type ISDOExportDomain} from '../../domain/sdo/export/sdoExportDomain';
import {type IRabbitMQ} from '../../infra/sdo/rabbitMQ/rabbitMQ';
import {type ISDODomain} from '../../domain/sdo/sdoDomain';
import {systemUserId} from '../../_constants/users';
import LeavError from '../../errors/LeavError';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';
import {logger} from '@leav/logger';
import {type IExtensionPoints} from '../../_types/extensionPoints';
import {type ISDOMappingFunctions} from '../../_types/sdo';

export interface IExportAppDeps {
    'core.domain.sdo.export': ISDOExportDomain;
    'core.infra.sdo.rabbitMQ': IRabbitMQ;
    'core.domain.sdo': ISDODomain;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
}

export interface IExportApp {
    onDataEvent: (msg: ConsumeMessage) => Promise<void>;
    extensionPoints?: IExtensionPoints;
}

export default function ({
    'core.domain.sdo.export': sdoExportDomain,
    'core.infra.sdo.rabbitMQ': rabbitMQService,
    'core.domain.sdo': sdoDomain,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
}: IExportAppDeps): IExportApp {
    const onDataEvent = async (msg: ConsumeMessage) => {
        const _systemQueryContext = getSystemQueryContext('sdo::exportApp:onDataEvent');

        try {
            const data: IDbEvent = JSON.parse(msg.content.toString());

            // Ignore all messages coming from userId === systemUserId
            // cause: import create/update will trigger an event here
            if (data.userId === systemUserId) {
                // TODO: log event
                logger.debug('Export skipped, event triggered by systemUserId');
                (await rabbitMQService.getLeavDataEventChannel()).ack(msg);
                return;
            }

            // If feature flag is specified in global settings, we override the SDO default config
            const sdoGlobalSettings = await sdoDomain.getSDOGlobalSettings(_systemQueryContext);
            if (sdoGlobalSettings.exportEnable === false) {
                (await rabbitMQService.getLeavDataEventChannel()).ack(msg);
                return;
            }

            logger.debug('Export: data event selected', {data});

            if (await sdoExportDomain.isSDODataEvent(data, sdoGlobalSettings.mapping)) {
                await sdoExportDomain.process(data, sdoGlobalSettings.timer, async (leavLibrary, recordId) => {
                    const sdo = await sdoDomain.getRecordSDO(
                        leavLibrary,
                        recordId,
                        sdoGlobalSettings.mapping,
                        _systemQueryContext,
                    );

                    // Sdo may be undefined from getRecordSDO, for instance when record not found, or hash not change
                    if (!sdo) {
                        return;
                    }

                    await sdoExportDomain.sendSDO(leavLibrary, recordId, sdo);
                    await sdoDomain.sendLog({
                        action: EventAction.SDO_LOG_EXPORT_RECORD,
                        record: {id: recordId, libraryId: leavLibrary},
                        sdo,
                        ctx: _systemQueryContext,
                    });
                });
            }

            (await rabbitMQService.getLeavDataEventChannel()).ack(msg);
        } catch (error) {
            logger.error('Error while processing a data event', {
                errorId: error.errorId,
                stack: error.stack,
            });

            (await rabbitMQService.getLeavDataEventChannel()).nack(msg, false, false);
            await sdoDomain.sendLog({
                action: EventAction.SDO_LOG_ERROR,
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
                ctx: _systemQueryContext,
            });
        }
    };

    return {
        onDataEvent,
        extensionPoints: {
            registerSDOExportMappingFunctions: (mappingFunctions: ISDOMappingFunctions) => {
                sdoDomain.registerSDOExportMappingFunctions(mappingFunctions);
            },
        },
    };
}
