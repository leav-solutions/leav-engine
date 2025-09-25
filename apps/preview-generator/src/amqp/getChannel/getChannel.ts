// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
