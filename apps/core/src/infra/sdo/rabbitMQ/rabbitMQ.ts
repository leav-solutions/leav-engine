import {type IAmqpService} from '@leav/message-broker';
import {logger} from '@leav/logger';
import {type ChannelModel, connect, type ConfirmChannel} from 'amqplib';
import {type IConfig} from '../../../_types/config';

export interface IRabbitMQDeps {
    'core.infra.amqpService': IAmqpService;
    config: IConfig;
}

export interface IRabbitMQ {
    getSDOExportChannel: () => Promise<ConfirmChannel>;
    getSDOImportChannel: () => Promise<ConfirmChannel>;
    getLeavDataEventChannel: () => Promise<ConfirmChannel>;
}

/**
 * SDO channels all live on the leav core AMQP connection (config.amqp / core.infra.amqpService).
 * There is no dedicated SDO broker: we only open dedicated channels on the core connections so
 * that the export buffering (deferred acks, up to a couple of minutes) does not block the prefetch
 * window of the other core consumers sharing amqpService.consumer.channel.
 */
export default function rabbitMQ({'core.infra.amqpService': leavAmqpService, config}: IRabbitMQDeps): IRabbitMQ {
    let _sdoExportChannel: ConfirmChannel;
    let _sdoImportChannel: ConfirmChannel;
    let _leavDataEventChannel: ConfirmChannel;
    let _sdoConnection: ChannelModel;

    const _getSDOConnection = async () => {
        if (!_sdoConnection) {
            logger.verbose(`Connect to sdo amqp server ${config.sdo.amqp.hostname}:${config.sdo.amqp.port}`);
            _sdoConnection = await connect(config.sdo.amqp);

            _sdoConnection.on('error', err => {
                logger.error(`[SDO] AMQP SDO Connection error : ${err.message}`);
            });
        }
        return _sdoConnection;
    };

    const getLeavDataEventChannel = async () => {
        if (!_leavDataEventChannel) {
            _leavDataEventChannel = await leavAmqpService.consumer.connection.createConfirmChannel();
            await _leavDataEventChannel.assertQueue(config.sdo.export.dataEventsQueue, {durable: true});
            await _leavDataEventChannel.bindQueue(
                config.sdo.export.dataEventsQueue,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events,
            );

            _leavDataEventChannel.on('error', err => {
                logger.error(`[SDO] AMQP Channel DataEvent error : ${err.message}`);
            });
        }
        return _leavDataEventChannel;
    };

    const getSDOExportChannel = async () => {
        if (!_sdoExportChannel) {
            const sdoConnection = await _getSDOConnection();
            _sdoExportChannel = await sdoConnection.createConfirmChannel();
            await _sdoExportChannel.assertExchange(config.sdo.export.exchange, config.sdo.export.type);

            _sdoExportChannel.on('error', err => {
                logger.error(`[SDO] AMQP Channel Export error : ${err.message}`);
            });
        }
        return _sdoExportChannel;
    };

    const getSDOImportChannel = async () => {
        if (!_sdoImportChannel) {
            const sdoConnection = await _getSDOConnection();
            _sdoImportChannel = await sdoConnection.createConfirmChannel();
            if (config.sdo.import.prefetch) {
                await _sdoImportChannel.prefetch(config.sdo.import.prefetch);
            }
            await _sdoImportChannel.assertQueue(config.sdo.import.queue, {durable: true});
            if (config.sdo.import.exchange) {
                await _sdoImportChannel.assertExchange(config.sdo.import.exchange, 'fanout');
                await _sdoImportChannel.bindQueue(config.sdo.import.queue, config.sdo.import.exchange, '');
            }

            _sdoImportChannel.on('error', err => {
                logger.error(`[SDO] AMQP Channel Import error : ${err.message}`);
            });
        }
        return _sdoImportChannel;
    };

    return {
        getLeavDataEventChannel,
        getSDOExportChannel,
        getSDOImportChannel,
    };
}
