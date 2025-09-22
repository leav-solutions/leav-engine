// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {amqpService} from '@leav/message-broker';
import {type IConfig} from '_types/config';
import {handleMessage} from './messageHandler';
import {type IElasticsearchService} from 'elasticsearchService';

export const initConsumer = async (config: IConfig, esService: IElasticsearchService) => {
    const service = await amqpService({
        config: {exchange: config.amqp.exchange, type: config.amqp.type, connOpt: {...config.amqp}}
    });

    const {queue, routingKey} = config.amqp;

    await service.consumer.channel.assertQueue(queue);
    await service.consumer.channel.bindQueue(queue, config.amqp.exchange, routingKey);

    await service.consume(queue, routingKey, msg => handleMessage(msg, service.consumer.channel, config, esService));

    console.info('Logs collector ready. Waiting for messages... ');
};
