import {nanoid} from 'nanoid';
import {
    type IAmqpConnection,
    type IAmqpChannel,
    type AmqpMessageHandler,
    type IAmqpMessage,
} from '@leav/message-broker';
import {type IConfig} from '../../_types/config';
import {type ICoreExchangeRabbitMQ} from '../amqp/coreExchange';

export interface ITasksManagerRabbitMQ {
    // Master: owns the execOrders queue topology (asserted/bound once from initMaster()); the
    // master never consumes it itself.
    assertExecOrdersTopology(): Promise<void>;
    publishExecOrder(payload: string): Promise<void>;
    publishCancelOrder(payload: string): Promise<void>;

    // Worker: execOrders is a competing-consumer queue shared across workers. Paused while a task
    // runs (we can't wait for the task to finish, potentially long, before acking) - so ack
    // happens manually right after pausing, on receipt.
    consumeExecOrders(handler: AmqpMessageHandler): Promise<void>;
    pauseExecOrders(): Promise<void>;
    resumeExecOrders(): Promise<void>;
    ackExecOrder(msg: IAmqpMessage): void;

    // Worker: per-worker exclusive queue, always listening (standard automatic ack - cancel
    // processing is quick, no reason to hold it open).
    consumeCancelOrders(handler: AmqpMessageHandler): Promise<void>;

    close(): Promise<void>;
}

interface IDeps {
    'core.infra.amqp.connection': IAmqpConnection;
    'core.infra.amqp.coreExchange': ICoreExchangeRabbitMQ;
    config: IConfig;
}

export default function ({
    'core.infra.amqp.connection': amqpConnection,
    'core.infra.amqp.coreExchange': coreExchange,
    config,
}: IDeps): ITasksManagerRabbitMQ {
    // Stable for the process lifetime (not per reconnect): used as the cancelOrders queue name
    // suffix only - NOT reused as the execOrders AMQP consumer tag (see below).
    const workerTag = `${process.pid}_${nanoid(3)}`;
    const cancelOrdersQueue = `${config.tasksManager.queues.cancelOrders}_${workerTag}`;

    // All channels below are created LAZILY (on first actual master/worker call), never eagerly
    // here: this module is instantiated by awilix in EVERY core mode process, while only
    // TASKS_MANAGER_MASTER calls initMaster() and only TASKS_MANAGER_WORKER calls initWorker().
    let masterChannel: IAmqpChannel | undefined;
    let execOrdersChannel: IAmqpChannel | undefined;
    let cancelOrdersChannel: IAmqpChannel | undefined;
    let execOrdersHandler: AmqpMessageHandler | undefined;
    let execOrdersConsumerTag: string | undefined;

    const getMasterChannel = (): IAmqpChannel => {
        if (!masterChannel) {
            masterChannel = amqpConnection.createChannel({
                name: 'tasksManager:master',
                setup: async t => {
                    await coreExchange.assertOnto(t);
                    await t.assertQueue(config.tasksManager.queues.execOrders, {durable: true});
                    await t.bindQueue(
                        config.tasksManager.queues.execOrders,
                        config.amqp.exchange,
                        config.tasksManager.routingKeys.execOrders,
                    );
                },
            });
        }
        return masterChannel;
    };

    const getExecOrdersChannel = (): IAmqpChannel => {
        if (!execOrdersChannel) {
            execOrdersChannel = amqpConnection.createChannel({
                name: 'tasksManager:execOrders',
                // Consumer-only channel: no publish() call here, so no need for broker publish confirms.
                confirm: false,
                setup: async t => {
                    await coreExchange.assertOnto(t);
                    // Options must match the master's assertQueue call, or RabbitMQ errors the
                    // channel if the worker starts before the master.
                    await t.assertQueue(config.tasksManager.queues.execOrders, {durable: true});
                    await t.prefetch(config.tasksManager.workerPrefetch ?? 1);
                },
            });
        }
        return execOrdersChannel;
    };

    const getCancelOrdersChannel = (): IAmqpChannel => {
        if (!cancelOrdersChannel) {
            cancelOrdersChannel = amqpConnection.createChannel({
                name: 'tasksManager:cancelOrders',
                confirm: false,
                setup: async t => {
                    await coreExchange.assertOnto(t);
                    await t.assertQueue(cancelOrdersQueue, {durable: false, exclusive: true, autoDelete: true});
                    await t.bindQueue(
                        cancelOrdersQueue,
                        config.amqp.exchange,
                        config.tasksManager.routingKeys.cancelOrders,
                    );
                },
            });
        }
        return cancelOrdersChannel;
    };

    return {
        async assertExecOrdersTopology() {
            getMasterChannel();
        },
        publishExecOrder: payload =>
            getMasterChannel().publish(config.amqp.exchange, config.tasksManager.routingKeys.execOrders, payload),
        publishCancelOrder: payload =>
            getMasterChannel().publish(config.amqp.exchange, config.tasksManager.routingKeys.cancelOrders, payload),

        async consumeExecOrders(handler) {
            execOrdersHandler = handler;
            // No fixed consumerTag: let the library generate a fresh one on every registration, so
            // a pause/resume cycle can never make the broker see a "reuse" of the same tag (which
            // RabbitMQ rejects by closing the whole connection, not just the channel).
            execOrdersConsumerTag = await getExecOrdersChannel().consume(
                config.tasksManager.queues.execOrders,
                handler,
                {manualAck: true},
            );
        },
        async pauseExecOrders() {
            if (!execOrdersConsumerTag) {
                return;
            }
            await execOrdersChannel?.cancel(execOrdersConsumerTag);
            execOrdersConsumerTag = undefined;
        },
        async resumeExecOrders() {
            if (!execOrdersHandler) {
                return;
            }
            execOrdersConsumerTag = await getExecOrdersChannel().consume(
                config.tasksManager.queues.execOrders,
                execOrdersHandler,
                {manualAck: true},
            );
        },
        ackExecOrder: msg => execOrdersChannel?.ack(msg),

        consumeCancelOrders: handler =>
            getCancelOrdersChannel()
                .consume(cancelOrdersQueue, handler)
                .then(() => undefined),

        close: async () => {
            await Promise.allSettled(
                [masterChannel, execOrdersChannel, cancelOrdersChannel]
                    .filter((c): c is IAmqpChannel => !!c)
                    .map(c => c.close()),
            );
        },
    };
}
