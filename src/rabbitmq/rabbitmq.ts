import {IAmqpParams, IMessageSend} from './../types';

export const sendToRabbitMQ = (msg: string, amqp?: IAmqpParams) => {
    if (amqp && amqp.channel && amqp.exchange && amqp.routingKey) {
        const {channel, exchange, routingKey} = amqp;

        try {
            // if we had channel, send message to rabbitmq
            channel.publish(exchange, routingKey, Buffer.from(msg), {
                persistent: true
            });
        } catch (e) {
            console.error("105 - Can't publish to rabbitMQ");
            process.exit(105);
        }
    } else {
        // else just display the infos
        console.info(msg);
    }
};

export const generateMsgRabbitMQ = (
    event: string,
    pathBefore: string | null,
    pathAfter: string | null,
    inode: number,
    isDirectory: boolean,
    rootKey: string
) => {
    const params: IMessageSend = {
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        isDirectory,
        inode,
        rootKey
    };

    return JSON.stringify(params);
};
