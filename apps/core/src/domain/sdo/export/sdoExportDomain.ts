import {type ILogger} from '@leav/logger';
import {type IDbEvent} from '@leav/utils';
import {type IBuffer, type IBufferList, type ISDO, type ISDOMapping} from '../../../_types/sdo';
import {type IConfig} from '../../../_types/config';
import {type IRabbitMQ} from '../../../infra/sdo/rabbitMQ/rabbitMQ';
import {type ISDOUtils} from '../../../utils/sdo/sdo';

const TWO_MIN = 120000;

const ACTIONS_MAPPING = {
    RECORD_SAVE: 'CREATE',
    VALUE_SAVE: 'UPDATE',
    VALUE_DELETE: 'UPDATE',
    RECORD_DELETE: 'UPDATE',
};

export interface ISDOExportDomainDeps {
    'core.infra.sdo.rabbitMQ': IRabbitMQ;
    'core.utils.logger': ILogger;
    config: IConfig;
    'core.utils.sdo': ISDOUtils;
}

type ProcessCallback = (library: string, recordId: string) => Promise<void>;

export interface ISDOExportDomain {
    process: (data: IDbEvent, sdoGlobalSettingsTimer: number, callback: ProcessCallback) => Promise<void>;
    sendSDO(libraryId: string, recordId: string, sdo: ISDO): Promise<void>;
    isSDODataEvent: (data: IDbEvent, sdoGlobalSettingsMapping: ISDOMapping) => Promise<boolean>;
}

export default function ({
    'core.utils.logger': logger,
    'core.infra.sdo.rabbitMQ': rabbitMQService,
    'core.utils.sdo': sdoUtils,
    config,
}: ISDOExportDomainDeps): ISDOExportDomain {
    const buffers: IBufferList = {};

    const process = async (
        dataEvent: IDbEvent,
        sdoGlobalSettingsTimer: number,
        callback: ProcessCallback,
    ): Promise<void> => {
        logger.debug('[SDO] Processing data...');

        const record = dataEvent.payload.topic.record;
        // use record.libraryId because RECORD_SAVE events does not have dataEvent.payload.topic.library
        const leavLibraryId = record.libraryId;

        // 1. If library is not set yet
        buffers[leavLibraryId] ??= new Map<string, IBuffer>();

        // get library buffer
        const buffer = buffers[leavLibraryId].get(record.id);

        return new Promise<void>((resolve, reject) => {
            if (buffer) {
                buffer.timer.refresh();

                // resolve previous promise and register current one.
                // That allow to ack previous amqp message
                buffer.promise.resolve();
                buffer.promise = {
                    resolve,
                    reject,
                };
            } else {
                // 3. Create buffer
                buffers[leavLibraryId].set(record.id, {
                    library: leavLibraryId,
                    recordId: record.id,
                    timer: _startBufferTimeout(leavLibraryId, record.id, sdoGlobalSettingsTimer, callback),
                    promise: {
                        resolve,
                        reject,
                    },
                });
            }
        });
    };

    const _startBufferTimeout = (
        leavLibraryId: string,
        recordId: string,
        timer: number,
        callback: ProcessCallback,
    ): NodeJS.Timeout => {
        logger.debug(`[SDO] Start timer for buffer with library: ${leavLibraryId}`);

        return setTimeout(() => {
            // Shortly store the buffer in a variable
            if (!buffers[leavLibraryId].has(recordId)) {
                logger.warn(`Unexpected behavior: Buffer not found for recordId: ${recordId}`);
                return;
            }

            const buffer = buffers[leavLibraryId].get(recordId);

            // clear map
            buffers[leavLibraryId].delete(recordId);

            callback(leavLibraryId, recordId)
                .then(() => {
                    buffer.promise.resolve();
                })
                .catch(error => {
                    buffer.promise.reject(error);
                });
        }, timer ?? TWO_MIN);
    };

    const sendSDO = async (libraryId: string, recordId: string, sdo: ISDO): Promise<void> => {
        // Send sdo to rabbitmq
        const exportChannel = await rabbitMQService.getSDOExportChannel();
        exportChannel.publish(config.sdo.export.exchange, '', Buffer.from(JSON.stringify(sdo)));
        await exportChannel.waitForConfirms();

        // Send log to ELK about sdo sent
        logger.info(`SDO sent to rabbitmq library: ${libraryId}, record id: ${recordId}`);
    };

    const isSDODataEvent = async (dataEvent: IDbEvent, sdoGlobalSettingsMapping: ISDOMapping): Promise<boolean> => {
        const action = dataEvent.payload?.action;
        const libraryId = dataEvent?.payload?.topic?.record?.libraryId;
        const leavAttribute = dataEvent?.payload?.topic?.attribute;

        if (!(action in ACTIONS_MAPPING)) {
            logger.debug(`[SDO] Action ${action} skipped`);
            return false;
        } else if (!libraryId) {
            throw new Error('[SDO] Library name not defined');
        }

        const libraryMapping = sdoUtils.getLibraryMapping(sdoGlobalSettingsMapping, libraryId);

        if (!libraryMapping) {
            logger.debug(`[SDO] Element from library ${libraryId} skipped`);
            return false;
        }

        if (ACTIONS_MAPPING[action] === 'UPDATE') {
            // Check leavAttribute only in case of UPDATE, for CREATE we always export SDO
            if (!leavAttribute) {
                throw new Error('[SDO] Leav Attribute not defined in amqp db event');
            }
            if (!sdoUtils.hasSDOAttribute(libraryMapping, leavAttribute)) {
                logger.debug(`[SDO] Attribute ${leavAttribute} skipped`);
                return false;
            }
        }

        return true;
    };

    return {
        process,
        isSDODataEvent,
        sendSDO,
    };
}
