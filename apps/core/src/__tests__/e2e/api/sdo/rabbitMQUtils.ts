import {createAmqpConnection, type IAmqpConnection, type IAmqpChannel, type IAmqpTopology} from '@leav/message-broker';
import {getConfig} from '../../../../config';

export class RabbitMqClient {
    private connection?: IAmqpConnection;
    /**
     * One channel per purpose (an exchange to publish on, a queue to listen to): a channel's `setup`
     * only runs when it is created, so sharing a single channel would silently skip the assertions of
     * every exchange/queue but the first.
     */
    private channels = new Map<string, IAmqpChannel>();
    /** Channel to use to consume/purge a given queue, i.e. the one that asserted and bound it */
    private queueChannels = new Map<string, IAmqpChannel>();

    public async connect(): Promise<void> {
        const conf = await getConfig();

        this.connection = createAmqpConnection({
            connOpt: conf.amqp.connOpt,
            connectionName: `${conf.instanceId}-e2e-test-utils`,
        });
    }

    public async close(): Promise<void> {
        await this.connection?.close();
        this.connection = undefined;
        this.channels.clear();
        this.queueChannels.clear();
    }

    private getConnection(): IAmqpConnection {
        if (!this.connection) {
            throw new Error('RabbitMqClient: call connect() before any operation.');
        }
        return this.connection;
    }

    private getOrCreateChannel(key: string, setup: (t: IAmqpTopology) => Promise<void>): IAmqpChannel {
        if (!this.channels.has(key)) {
            this.channels.set(
                key,
                this.getConnection().createChannel({
                    name: `e2e:rabbitMqUtils:${key}`,
                    setup,
                }),
            );
        }
        return this.channels.get(key);
    }

    private getQueueChannel(queue: string): IAmqpChannel {
        const channel = this.queueChannels.get(queue);

        if (!channel) {
            throw new Error(`RabbitMqClient: call assertExchangeAndBindQueue() for queue "${queue}" first.`);
        }
        return channel;
    }

    public async publishToExchange<T = unknown>(exchange: string, payload: T, type = 'fanout'): Promise<void> {
        const channel = this.getOrCreateChannel(`publish:${exchange}`, async t => {
            await t.assertExchange(exchange, type, {durable: true});
        });

        await channel.publish(exchange, '', Buffer.from(JSON.stringify(payload)));
    }

    public async assertExchangeAndBindQueue(queue: string, exchange: string, type = 'fanout'): Promise<void> {
        const channel = this.getOrCreateChannel(`queue:${queue}`, async t => {
            await t.assertExchange(exchange, type, {durable: true});
            await t.assertQueue(queue, {durable: true});
            await t.bindQueue(queue, exchange, '');
        });

        this.queueChannels.set(queue, channel);
    }

    public async purgeQueue(queue: string): Promise<void> {
        await this.getQueueChannel(queue).purgeQueue(queue);
    }

    public async waitForMessage<T = unknown>(
        queue: string,
        predicate: (message: T) => boolean = () => true,
        timeoutMs = 30_000,
    ): Promise<T> {
        const channel = this.getQueueChannel(queue);

        return new Promise<T>((resolve, reject) => {
            let consumerTag: string | undefined;

            const timer = setTimeout(() => {
                void stop();
                reject(new Error(`No matching message on "${queue}" after ${timeoutMs}ms.`));
            }, timeoutMs);

            const stop = async () => {
                clearTimeout(timer);

                if (consumerTag) {
                    await channel.cancel(consumerTag).catch(() => undefined);
                }
            };

            channel
                .consume(
                    queue,
                    async msg => {
                        const content = JSON.parse(msg.content.toString()) as T;

                        if (predicate(content)) {
                            channel.ack(msg);
                            void stop();
                            resolve(content);
                        } else {
                            channel.nack(msg);
                        }
                    },
                    {manualAck: true},
                )
                .then(tag => {
                    consumerTag = tag;
                })
                .catch(reject);
        });
    }
}
