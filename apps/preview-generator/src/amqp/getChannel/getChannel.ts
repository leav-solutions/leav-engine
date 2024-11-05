// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {connect, Options} from 'amqplib';

export const getChannel = async (amqpConfig: Options.Connect) => {
    try {
        const connection = await connect(amqpConfig);
        return connection.createChannel();
    } catch (e) {
        console.error("101 - Can't connect to rabbitMQ", e.message);
        process.exit(101);
        throw e;
    }
};
