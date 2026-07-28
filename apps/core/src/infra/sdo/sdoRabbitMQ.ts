import {type IAmqpConnection, type IAmqpChannel, createAmqpConnection} from '@leav/message-broker';
import {type IConfig} from '../../_types/config';
import {type ICoreExchangeRabbitMQ} from '../amqp/coreExchange';

export interface IRabbitMQDeps {
    'core.infra.amqp.connection': IAmqpConnection;
    'core.infra.amqp.coreExchange': ICoreExchangeRabbitMQ;
    config: IConfig;
}

export interface IRabbitMQ {
    getSDOExportChannel: () => Promise<IAmqpChannel>;
    getSDOImportChannel: () => Promise<IAmqpChannel>;
    getDTOImportChannel: () => Promise<IAmqpChannel>;
    getLeavDataEventChannel: () => Promise<IAmqpChannel>;
    close(): Promise<void>;
}

/**
 * getLeavDataEventChannel lives on the leav core AMQP connection (config.amqp /
 * core.infra.amqp.connection). getSDOExportChannel/getSDOImportChannel/getDTOImportChannel use a
 * separate, dedicated SDO broker connection (config.sdo.amqp), created lazily below:
 * core.interface.sdo (hence this factory) is resolved in every CoreMode process, but only SDO/DTO
 * import/export ever calls them.
 */
export default function rabbitMQ({
    'core.infra.amqp.connection': amqpConnection,
    'core.infra.amqp.coreExchange': coreExchange,
    config,
}: IRabbitMQDeps): IRabbitMQ {
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

    let sdoConnection: IAmqpConnection | undefined;
    const getSdoConnection = (): IAmqpConnection => {
        if (!sdoConnection) {
            sdoConnection = createAmqpConnection({
                connOpt: config.sdo.amqp,
                connectionName: `${config.instanceId}-sdo`,
            });
        }
        return sdoConnection;
    };

    let sdoExportChannel: IAmqpChannel | undefined;
    const getSdoExportChannel = (): IAmqpChannel => {
        if (!sdoExportChannel) {
            sdoExportChannel = getSdoConnection().createChannel({
                name: 'sdo:export',
                setup: async t => {
                    await t.assertExchange(config.sdo.exchange, config.sdo.exchangeType);
                },
            });
        }
        return sdoExportChannel;
    };
    const getSDOExportChannel = async (): Promise<IAmqpChannel> => getSdoExportChannel();

    let sdoImportChannel: IAmqpChannel | undefined;
    const getSdoImportChannel = (): IAmqpChannel => {
        if (!sdoImportChannel) {
            sdoImportChannel = getSdoConnection().createChannel({
                name: 'sdo:import',
                // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
                confirm: false,
                setup: async t => {
                    await t.assertQueue(config.sdo.import.queue, {durable: true});
                    await t.assertExchange(config.sdo.exchange, config.sdo.exchangeType);
                    await t.bindQueue(config.sdo.import.queue, config.sdo.exchange, '');
                    await t.prefetch(config.sdo.import.prefetch ?? 1);
                },
            });
        }
        return sdoImportChannel;
    };
    const getSDOImportChannel = async (): Promise<IAmqpChannel> => getSdoImportChannel();

    let dtoImportChannel: IAmqpChannel | undefined;
    const getDtoImportChannel = (): IAmqpChannel => {
        if (!dtoImportChannel) {
            const {exchange, exchangeType, queue, prefetch} = config.sdo.dto.import;

            dtoImportChannel = getSdoConnection().createChannel({
                name: 'dto:import',
                // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
                confirm: false,
                setup: async t => {
                    await t.assertQueue(queue, {durable: true});
                    await t.assertExchange(exchange, exchangeType);
                    await t.bindQueue(queue, exchange, '');
                    await t.prefetch(prefetch ?? 1);
                },
            });
        }
        return dtoImportChannel;
    };
    const getDTOImportChannel = async (): Promise<IAmqpChannel> => getDtoImportChannel();

    return {
        getLeavDataEventChannel,
        getSDOExportChannel,
        getSDOImportChannel,
        getDTOImportChannel,
        close: async () => {
            await Promise.allSettled(
                [sdoExportChannel, sdoImportChannel, dtoImportChannel]
                    .filter((c): c is IAmqpChannel => !!c)
                    .map(c => c.close()),
            );
            await sdoConnection?.close();
        },
    };
}
