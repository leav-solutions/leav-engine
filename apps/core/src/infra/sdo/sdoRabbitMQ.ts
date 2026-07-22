import {type IAmqpConnection, type IAmqpChannel} from '@leav/message-broker';
import {logger} from '@leav/logger';
import {type ChannelModel, connect, type ConfirmChannel} from 'amqplib';
import {type IConfig} from '../../_types/config';
import {type ICoreExchangeRabbitMQ} from '../amqp/coreExchange';

export interface IRabbitMQDeps {
    'core.infra.amqp.connection': IAmqpConnection;
    'core.infra.amqp.coreExchange': ICoreExchangeRabbitMQ;
    config: IConfig;
}

export interface IRabbitMQ {
    getSDOExportChannel: () => Promise<ConfirmChannel>;
    getSDOImportChannel: () => Promise<ConfirmChannel>;
    getLeavDataEventChannel: () => Promise<IAmqpChannel>;
}

/**
 * getLeavDataEventChannel lives on the leav core AMQP connection (config.amqp /
 * core.infra.amqp.connection). getSDOExportChannel/getSDOImportChannel use a separate, dedicated
 * SDO broker connection (config.sdo.amqp) - unrelated to ADR-007, not migrated here.
 */
export default function rabbitMQ({
    'core.infra.amqp.connection': amqpConnection,
    'core.infra.amqp.coreExchange': coreExchange,
    config,
}: IRabbitMQDeps): IRabbitMQ {
    let _sdoExportChannel: ConfirmChannel;
    let _sdoImportChannel: ConfirmChannel;
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

    const leavDataEventChannel = amqpConnection.createChannel({
        name: 'sdo:export:dataEvents',
        setup: async t => {
            await coreExchange.assertOnto(t);
            await t.assertQueue(config.sdo.export.dataEventsQueue, {durable: true});
            await t.bindQueue(
                config.sdo.export.dataEventsQueue,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events,
            );
            await t.prefetch(config.sdo.export.dataEventsPrefetch ?? 1);
        },
    });

    const getLeavDataEventChannel = async (): Promise<IAmqpChannel> => leavDataEventChannel;

    const getSDOExportChannel = async () => {
        if (!_sdoExportChannel) {
            const sdoConnection = await _getSDOConnection();
            _sdoExportChannel = await sdoConnection.createConfirmChannel();
            await _sdoExportChannel.assertExchange(config.sdo.exchange, config.sdo.exchangeType);

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
            await _sdoImportChannel.assertExchange(config.sdo.exchange, config.sdo.exchangeType);
            await _sdoImportChannel.bindQueue(config.sdo.import.queue, config.sdo.exchange, '');

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
