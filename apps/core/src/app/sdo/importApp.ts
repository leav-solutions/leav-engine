import {type ConsumeMessage} from 'amqplib';
import {type ILogger} from '@leav/logger';
import {type IRabbitMQ} from '../../infra/sdo/rabbitMQ/rabbitMQ';
import {type ISDOImportDomain} from '../../domain/sdo/import/sdoImportDomain';
import {type ISDO, EventActionSDO} from '../../_types/sdo';
import {type ISDODomain} from '../../domain/sdo/sdoDomain';
import LeavError from '../../errors/LeavError';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';

export interface IImportAppDeps {
    'core.infra.sdo.rabbitMQ': IRabbitMQ;
    'core.utils.logger': ILogger;
    'core.domain.sdo': ISDODomain;
    'core.domain.sdo.import': ISDOImportDomain;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
}

export interface ISDOImportApp {
    onSDOEvent: (msg: ConsumeMessage) => Promise<void>;
}

export default function ({
    'core.utils.logger': logger,
    'core.infra.sdo.rabbitMQ': rabbitMQService,
    'core.domain.sdo': sdoDomain,
    'core.domain.sdo.import': sdoImportDomain,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
}: IImportAppDeps): ISDOImportApp {
    const onSDOEvent = async (msg: ConsumeMessage): Promise<void> => {
        const _systemQueryContext = getSystemQueryContext('sdo::importApp:onSDOEvent');
        let sdo: ISDO;

        try {
            // Validate message format
            sdo = JSON.parse(msg.content.toString());

            if (sdo.name !== 'campaign' && sdo.name !== 'map') {
                (await rabbitMQService.getSDOImportChannel()).ack(msg);
                return;
            }

            logger.debug('Import: sdo event selected', {sdo});
            await sdoDomain.schemaValidation(sdo.content);

            // Dispatch message to corresponding action
            switch (sdo.action) {
                case 'CREATE':
                    await sdoImportDomain.create(sdo, _systemQueryContext);
                    break;
                case 'UPDATE':
                    await sdoImportDomain.update(sdo, _systemQueryContext);
                    break;
                default:
                    throw new Error('Unexpected action');
            }

            (await rabbitMQService.getSDOImportChannel()).ack(msg);
            await sdoDomain.sendLog({
                action: EventActionSDO.LOG_IMPORT_RECORD,
                sdo,
                ctx: _systemQueryContext,
            });
        } catch (error) {
            logger.error('Error in importApp::dispatch()', {
                errorId: error.errorId,
                stack: error.stack,
            });
            (await rabbitMQService.getSDOImportChannel()).nack(msg, false, false);
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
                sdo,
                ctx: _systemQueryContext,
            });
        }
    };

    return {
        onSDOEvent,
    };
}
