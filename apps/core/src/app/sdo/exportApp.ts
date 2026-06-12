import {type ConsumeMessage} from 'amqplib';
import {type ILogger} from '@leav/logger';
import {type IDbEvent} from '@leav/utils';
import {type ISDOExportDomain} from '../../domain/sdo/export/sdoExportDomain';
import {type IRabbitMQ} from '../../infra/sdo/rabbitMQ/rabbitMQ';
import {type ISDODomain} from '../../domain/sdo/sdoDomain';
import {systemUserId} from '../../_constants/users';
import {EventActionSDO} from '../../_types/sdo';
import LeavError from '../../errors/LeavError';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';

export interface IExportAppDeps {
    'core.utils.logger': ILogger;
    'core.domain.sdo.export': ISDOExportDomain;
    'core.infra.sdo.rabbitMQ': IRabbitMQ;
    'core.domain.sdo': ISDODomain;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
}

export interface IExportApp {
    onDataEvent: (msg: ConsumeMessage) => Promise<void>;
}

export default function ({
    'core.utils.logger': logger,
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

            logger.debug('Export: data event selected', {data});

            const sdoGlobalSettings = await sdoDomain.getSDOGlobalSettings(_systemQueryContext);

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
                        action: EventActionSDO.LOG_EXPORT_RECORD,
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
                action: EventActionSDO.LOG_ERROR,
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
    };
}
