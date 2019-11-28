import {Options, connect} from 'amqplib';

export const getChannel = async (amqpConfig: Options.Connect) => {
    try {
        const connection = await connect(amqpConfig);
        return connection.createChannel();
    } catch (e) {
        console.error("101 - Can't connect to rabbitMQ");
        // process.exit(101);
        throw new Error();
    }
};
