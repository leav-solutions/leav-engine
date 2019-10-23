import {IAmqpParams} from './../types';

export const sendToRabbitMQ = (msg: string, amqp?: IAmqpParams) => {
    if (amqp && amqp.channel && amqp.exchange && amqp.routingKey) {
        const {channel, exchange, routingKey} = amqp;

        try {
            // if we had channel, send message to rabbitmq
            channel.publish(exchange, routingKey, Buffer.from(msg), {
                persistent: true
            });
        } catch (e) {
            process.exit(1);
        }
    } else {
        // else just console.log the infos
        console.info(msg);
    }
};

export const generateMsgRabbitMQ = (
    event: string,
    pathBefore: string | null,
    pathAfter: string | null,
    inode: number,
    rootKey: string
) => {
    return JSON.stringify({
        event,
        time: Math.round(Date.now() / 1000),
        pathAfter,
        pathBefore,
        inode,
        rootKey
    });
};
