import {type AmqpMessageHandler} from '@leav/message-broker';
import {type ISDOImportDomain} from '../../domain/sdo/import/sdoImportDomain';
import {type ISDO} from '../../_types/sdo';
import {type ISDODomain} from '../../domain/sdo/sdoDomain';
import {EventAction} from '@leav/utils';
import LeavError from '../../errors/LeavError';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';
import {logger} from '@leav/logger';
import {type IConfig} from '../../_types/config';

export interface IImportAppDeps {
    'core.domain.sdo': ISDODomain;
    'core.domain.sdo.import': ISDOImportDomain;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
    config: IConfig;
}

export interface ISDOImportApp {
    onSDOEvent: AmqpMessageHandler;
}

export default function ({
    'core.domain.sdo': sdoDomain,
    'core.domain.sdo.import': sdoImportDomain,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    config,
}: IImportAppDeps): ISDOImportApp {
    const debug = config.sdo.debug ?? false;

    const onSDOEvent: AmqpMessageHandler = async msg => {
        const _systemQueryContext = getSystemQueryContext('sdo::importApp:onSDOEvent');
        let sdo: ISDO;

        try {
            // Validate message format
            sdo = JSON.parse(msg.content.toString());

            if (sdo.clientId && sdo.clientId === config.sdo.clientId) {
                debug && logger.debug('Import: ignoring own SDO message', {sdo});
                return;
            }

            const sdoGlobalSettings = await sdoDomain.getSDOGlobalSettings(_systemQueryContext);

            if (sdoGlobalSettings.importEnable === false) {
                return;
            }

            debug && logger.debug('Import: sdo event selected', {sdo});
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

            await sdoDomain.sendLog({
                action: EventAction.SDO_LOG_IMPORT_RECORD,
                sdo,
                ctx: _systemQueryContext,
            });
        } catch (error) {
            logger.error('Error in importApp::dispatch()', {
                errorId: error.errorId,
                stack: error.stack,
            });

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
                sdo,
                ctx: _systemQueryContext,
            });

            // Rethrow: createAmqpConnection's default contract nacks the message (no requeue) on
            // throw - ack/nack is no longer handled manually here.
            throw error;
        }
    };

    return {
        onSDOEvent,
    };
}
