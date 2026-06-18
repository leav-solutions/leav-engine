import amqp, {type Channel, type ChannelModel} from 'amqplib';
import {getConfig} from '../../../../config';

export class RabbitMqClient {
    private connection?: ChannelModel;
    private channel?: Channel;

    public async connect(): Promise<void> {
        const conf = await getConfig();

        this.connection = await amqp.connect(conf.amqp.connOpt);
        this.channel = await this.connection.createChannel();
    }

    public async close(): Promise<void> {
        await this.channel?.close();
        await this.connection?.close();
        this.channel = undefined;
        this.connection = undefined;
    }

    private getChannel(): Channel {
        if (!this.channel) {
            throw new Error('RabbitMqClient: call connect() before any operation.');
        }
        return this.channel;
    }

    public async assertExchangeAndBindQueue(queue: string, exchange: string, type = 'fanout'): Promise<void> {
        const channel = this.getChannel();
        await channel.assertExchange(exchange, type, {durable: true});
        await channel.assertQueue(queue, {durable: true});
        await channel.bindQueue(queue, exchange, '');
    }

    public async purgeQueue(queue: string): Promise<void> {
        const channel = this.getChannel();
        await channel.assertQueue(queue, {durable: true});
        await channel.purgeQueue(queue);
    }

    public async waitForMessage<T = unknown>(
        queue: string,
        predicate: (message: T) => boolean = () => true,
        timeoutMs = 30_000,
    ): Promise<T> {
        const channel = this.getChannel();
        //await channel.assertQueue(queue, {durable: true});

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
                .consume(queue, msg => {
                    if (!msg) {
                        return;
                    }

                    const content = JSON.parse(msg.content.toString()) as T;

                    if (predicate(content)) {
                        channel.ack(msg);
                        void stop();
                        resolve(content);
                    } else {
                        channel.nack(msg, false, false);
                    }
                })
                .then(({consumerTag: tag}) => {
                    consumerTag = tag;
                })
                .catch(reject);
        });
    }
}
