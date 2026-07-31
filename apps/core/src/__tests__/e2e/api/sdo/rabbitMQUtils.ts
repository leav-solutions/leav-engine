import {createAmqpConnection, type IAmqpConnection, type IAmqpChannel} from '@leav/message-broker';
import {getConfig} from '../../../../config';

export class RabbitMqClient {
    private connection?: IAmqpConnection;
    private channel?: IAmqpChannel;

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
        this.channel = undefined;
    }

    private getConnection(): IAmqpConnection {
        if (!this.connection) {
            throw new Error('RabbitMqClient: call connect() before any operation.');
        }
        return this.connection;
    }

    private getChannel(): IAmqpChannel {
        if (!this.channel) {
            throw new Error('RabbitMqClient: call assertExchangeAndBindQueue() or publishToExchange() first.');
        }
        return this.channel;
    }

    /**
     * `type` must match the type the core asserts for that exchange, otherwise the broker answers
     * PRECONDITION_FAILED and closes the channel (SDO import/export is `fanout`, DTO import is
     * `direct`).
     */
    public async publishToExchange<T = unknown>(exchange: string, payload: T, type = 'fanout'): Promise<void> {
        if (!this.channel) {
            this.channel = this.getConnection().createChannel({
                name: 'e2e:rabbitMqUtils',
                setup: async t => {
                    await t.assertExchange(exchange, type, {durable: true});
                },
            });
        }
        await this.channel.publish(exchange, '', Buffer.from(JSON.stringify(payload)));
    }

    public async assertExchangeAndBindQueue(queue: string, exchange: string, type = 'fanout'): Promise<void> {
        if (!this.channel) {
            this.channel = this.getConnection().createChannel({
                name: 'e2e:rabbitMqUtils',
                setup: async t => {
                    await t.assertExchange(exchange, type, {durable: true});
                    await t.assertQueue(queue, {durable: true});
                    await t.bindQueue(queue, exchange, '');
                },
            });
        }
    }

    public async purgeQueue(queue: string): Promise<void> {
        await this.getChannel().purgeQueue(queue);
    }

    public async waitForMessage<T = unknown>(
        queue: string,
        predicate: (message: T) => boolean = () => true,
        timeoutMs = 30_000,
    ): Promise<T> {
        const channel = this.getChannel();

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
