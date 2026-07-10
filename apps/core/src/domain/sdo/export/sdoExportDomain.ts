import _ from 'lodash';
import {logger} from '@leav/logger';
import {type IDbEvent, EventAction} from '@leav/utils';
import {type SDOAction, type IBuffer, type IBufferList, type ISDO, type ISDOMapping} from '../../../_types/sdo';
import {type IConfig} from '../../../_types/config';
import {type IRabbitMQ} from '../../../infra/sdo/rabbitMQ/rabbitMQ';
import {type ISDOUtils} from '../../../utils/sdo/sdo';
import {type IRecordSDORepo} from '../../../infra/sdo/recordsSDORepo/recordSDORepo';
import {type GetSystemQueryContext} from '../../../utils/helpers/getSystemQueryContext';
import {type ISDODomain} from '../sdoDomain';

const TWO_MIN = 120000;

export const ACTIONS_MAPPING = {
    RECORD_INIT: 'CREATE',
    VALUE_SAVE: 'UPDATE',
    VALUE_DELETE: 'UPDATE',
    RECORD_SAVE: 'UPDATE',
} satisfies Record<string, SDOAction>;

export interface ISDOExportDomainDeps {
    'core.infra.sdo.rabbitMQ': IRabbitMQ;
    config: IConfig;
    'core.utils.sdo': ISDOUtils;
    'core.infra.sdo.recordsSDORepo': IRecordSDORepo;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
    'core.domain.sdo': ISDODomain;
}

type ProcessCallback = (library: string, recordId: string) => Promise<void>;

export interface ISDOExportDomain {
    process: (data: IDbEvent, sdoGlobalSettingsTimer: number, callback: ProcessCallback) => Promise<void>;
    sendSDO(libraryId: string, recordId: string, sdo: ISDO): Promise<void>;
    getSDODataEvent: (data: IDbEvent, sdoGlobalSettingsMapping: ISDOMapping) => Promise<SDOAction | null>;
}

export default function ({
    'core.infra.sdo.rabbitMQ': rabbitMQService,
    'core.utils.sdo': sdoUtils,
    'core.infra.sdo.recordsSDORepo': recordSDORepo,
    config,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    'core.domain.sdo': sdoDomain,
}: ISDOExportDomainDeps): ISDOExportDomain {
    const debug = config.sdo.debug ?? false;

    const _systemQueryContext = getSystemQueryContext('sdo::sdoExportDomain');

    const buffers: IBufferList = {};

    const process = async (
        dataEvent: IDbEvent,
        sdoGlobalSettingsTimer: number,
        callback: ProcessCallback,
    ): Promise<void> => {
        debug && logger.debug('[SDO] Processing data...');

        const record = dataEvent.payload.topic.record;
        // use record.libraryId because RECORD_INIT events does not have dataEvent.payload.topic.library
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
        debug && logger.debug(`[SDO] Start timer for buffer with library: ${leavLibraryId}`);

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
        const recordUUID = sdoUtils.getRecordUUIDFromSDO(sdo);
        const storedContent = await recordSDORepo.getContent({recordUUID, ctx: _systemQueryContext});

        if (_.isEqual(storedContent, sdo.content)) {
            debug && logger.debug(`[SDO] Content unchanged for ${recordId} in ${libraryId}, export skipped`);
            return;
        }

        // Send sdo to rabbitmq
        const exportChannel = await rabbitMQService.getSDOExportChannel();
        exportChannel.publish(config.sdo.exchange, '', Buffer.from(JSON.stringify(sdo)));
        await exportChannel.waitForConfirms();

        // Send log to ELK about sdo sent
        logger.verbose(`SDO Export record ${libraryId}/${recordUUID}/${recordId}`);

        // Persist the content only once the SDO has been successfully published, so a publish
        // failure (message nacked without requeue) doesn't leave a stale snapshot that would
        // wrongly skip a future export.
        await recordSDORepo.upsertContent({
            recordUUID,
            libraryId,
            recordId,
            content: sdo.content,
            ctx: _systemQueryContext,
        });

        await sdoDomain.sendLog({
            action: EventAction.SDO_LOG_EXPORT_RECORD,
            record: {id: recordId, libraryId},
            sdo,
            ctx: _systemQueryContext,
        });
    };

    const getSDODataEvent = async (
        dataEvent: IDbEvent,
        sdoGlobalSettingsMapping: ISDOMapping,
    ): Promise<SDOAction | null> => {
        const action = dataEvent.payload?.action;
        const libraryId = dataEvent?.payload?.topic?.record?.libraryId;
        const leavAttribute = dataEvent?.payload?.topic?.attribute;

        if (!(action in ACTIONS_MAPPING)) {
            debug && logger.debug(`[SDO] Action ${action} skipped`);
            return null;
        } else if (!libraryId) {
            throw new Error('[SDO] Library name not defined');
        }

        const libraryMapping = sdoUtils.getLibraryMapping(sdoGlobalSettingsMapping, libraryId);

        if (!libraryMapping) {
            debug && logger.debug(`[SDO] Element from library ${libraryId} skipped`);
            return null;
        }

        if (ACTIONS_MAPPING[action] === 'UPDATE') {
            // Check leavAttribute only in case of UPDATE, for CREATE we always export SDO
            if (!leavAttribute) {
                throw new Error('[SDO] Leav Attribute not defined in amqp db event');
            }
            if (!sdoUtils.hasSDOAttribute(libraryMapping, leavAttribute)) {
                debug && logger.debug(`[SDO] Attribute ${leavAttribute} skipped`);
                return null;
            }
        }

        return ACTIONS_MAPPING[action];
    };

    return {
        process,
        getSDODataEvent,
        sendSDO,
    };
}
