import type * as amqp from 'amqplib';
import {connect, type AmqpConnectionManager, type ChannelWrapper} from 'amqp-connection-manager';
import {logger} from '@leav/logger';
import {
    type AmqpConnectionState,
    type IAmqpChannel,
    type IAmqpConnection,
    type IAmqpConnectionConfig,
    type IAmqpMessage,
    type IAmqpTopology,
    type ICreateChannelParams,
} from './types/amqp';

const DEFAULT_HEARTBEAT_IN_SECONDS = 30;
const DEFAULT_RECONNECT_TIME_IN_SECONDS = 5;

const _createChannel = (channelWrapper: ChannelWrapper, connectionName: string, channelName: string): IAmqpChannel => {
    const publish: IAmqpChannel['publish'] = async (exchange, routingKey, content, opts = {}) => {
        try {
            await channelWrapper.publish(exchange, routingKey, content, {
                persistent: opts.persistent ?? true,
                priority: opts.priority,
                headers: opts.headers,
                correlationId: opts.correlationId,
                replyTo: opts.replyTo,
            });
        } catch (e) {
            throw new Error(`Fail to publish message to ${exchange} because ${e.message}`, {cause: e});
        }
    };

    const consume: IAmqpChannel['consume'] = async (queue, handler, opts = {}) => {
        const {manualAck = false, requeueOnError = false, consumerTag} = opts;

        const _handleMessage = async (msg: amqp.ConsumeMessage | null) => {
            if (!msg) {
                return;
            }

            if (manualAck) {
                // The app owns ack/nack entirely (e.g. tasksManager's pause/resume dance) - we
                // only guard against an unhandled rejection killing the consumer loop.
                try {
                    await handler(msg as unknown as IAmqpMessage);
                } catch (e) {
                    logger.error(
                        `[${connectionName}/${channelName}] Error while processing message (manualAck) on queue ${queue}: ${e.stack ?? e.message}`,
                        {msg: {...msg, content: msg.content.toString()}},
                    );
                }
                return;
            }

            try {
                await handler(msg as unknown as IAmqpMessage);
                channelWrapper.ack(msg);
            } catch (e) {
                logger.error(
                    `[${connectionName}/${channelName}] Error while processing message on queue ${queue}: ${e.stack ?? e.message}`,
                    {msg: {...msg, content: msg.content.toString()}},
                );
                channelWrapper.nack(msg, false, requeueOnError);
            }
        };

        const {consumerTag: resolvedTag} = await channelWrapper.consume(queue, _handleMessage, {consumerTag});
        return resolvedTag;
    };

    return {
        publish,
        consume,
        ack: msg => channelWrapper.ack(msg as unknown as amqp.Message),
        nack: (msg, requeue = false) => channelWrapper.nack(msg as unknown as amqp.Message, false, requeue),
        cancel: consumerTag => channelWrapper.cancel(consumerTag),
        close: () => channelWrapper.close(),
        // purgeQueue/deleteQueue throw "Not connected" if called before the channel finishes its
        // first connect (unlike publish/consume, which queue internally) - wait for it explicitly.
        purgeQueue: async queue => {
            await channelWrapper.waitForConnect();
            await channelWrapper.purgeQueue(queue);
        },
        deleteQueue: async queue => {
            await channelWrapper.waitForConnect();
            await channelWrapper.deleteQueue(queue);
        },
    };
};

export function createAmqpConnection(config: IAmqpConnectionConfig): IAmqpConnection {
    const connectionName = config.connectionName ?? 'leav';
    const heartbeatIntervalInSeconds = config.heartbeatInSeconds ?? DEFAULT_HEARTBEAT_IN_SECONDS;
    const reconnectTimeInSeconds = config.reconnectTimeInSeconds ?? DEFAULT_RECONNECT_TIME_IN_SECONDS;

    const connectionManager: AmqpConnectionManager = connect([config.connOpt], {
        heartbeatIntervalInSeconds,
        reconnectTimeInSeconds,
    });

    let currentState: AmqpConnectionState = 'connecting';

    connectionManager.on('connect', () => {
        if (currentState === 'disconnected') {
            logger.verbose(`[${connectionName}] AMQP reconnected`);
        }
        currentState = 'connected';
    });
    connectionManager.on('disconnect', ({err}) => {
        logger.warn(`[${connectionName}] AMQP connection lost: ${err?.message}`);
        currentState = 'disconnected';
    });
    connectionManager.on('connectFailed', ({err}) => {
        logger.warn(`[${connectionName}] AMQP connect attempt failed: ${err?.message}`);
    });

    const createChannel = (params: ICreateChannelParams): IAmqpChannel => {
        const topologySetup = params.setup;

        const channelWrapper = connectionManager.createChannel({
            name: params.name,
            confirm: params.confirm ?? true,
            setup: topologySetup
                ? async (rawChannel: amqp.ConfirmChannel) => {
                      const topology: IAmqpTopology = {
                          assertExchange: (exchange, type, opts) =>
                              rawChannel.assertExchange(exchange, type, opts).then(() => undefined),
                          assertQueue: (queue, opts) => rawChannel.assertQueue(queue, opts).then(() => undefined),
                          bindQueue: (queue, exchange, routingKey) =>
                              rawChannel.bindQueue(queue, exchange, routingKey).then(() => undefined),
                          prefetch: count => rawChannel.prefetch(count).then(() => undefined),
                      };
                      await topologySetup(topology);
                  }
                : undefined,
        });

        return _createChannel(channelWrapper, connectionName, params.name);
    };

    // connectionManager.close() already closes every channel it tracks (in order, swallowing
    // channel-close errors) before closing the connection itself - closing channels ourselves
    // in parallel here would race that internal sequencing and could leave the connection close
    // hanging forever (channel-close RPC still in flight when the connection disappears under it).
    const close = async (): Promise<void> => {
        try {
            await connectionManager.close();
        } catch (e) {
            logger.error(`[${connectionName}] Error while closing AMQP connection: ${e.message}`);
        }
        currentState = 'closed';
    };

    return {
        createChannel,
        getConnectionState: () => currentState,
        close,
    };
}
