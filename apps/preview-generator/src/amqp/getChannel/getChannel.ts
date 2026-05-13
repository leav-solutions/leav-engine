import {logger} from '@leav/logger';
import {connect, type Options} from 'amqplib';

export const getChannel = async (amqpConfig: Options.Connect) => {
    try {
        const connection = await connect(amqpConfig);
        return await connection.createChannel();
    } catch (e) {
        logger.error(`101 - Can't connect to rabbitMQ because ${e.message}`);
        process.exit(101);
        throw e;
    }
};
