// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLogsIndexName, type IDbEvent} from '@leav/utils';
import {type IConfig} from '_types/config';
import type * as amqp from 'amqplib';
import {type IElasticsearchService} from '../elasticsearchService';

export const handleMessage = async (
    msg: amqp.ConsumeMessage,
    channel: amqp.ConfirmChannel,
    config: IConfig,
    esService: IElasticsearchService
) => {
    try {
        const msgContent: IDbEvent = JSON.parse(msg.content.toString());

        if (config.debug) {
            console.info('Received message', msgContent);
        }

        const {payload, emitter, ...msgMetadata} = msgContent;

        const indexName = getLogsIndexName(config.elasticsearch.indexPrefix, msgMetadata.instanceId);
        const dataToSave = {
            '@timestamp': msgContent.time,
            ...msgMetadata,
            ...payload
        };

        // Write data to elasticsearch
        await esService.writeData(indexName, dataToSave);

        channel.ack(msg);
    } catch (e) {
        console.error('Error processing message', e, 'Message was:', msg);
    }
};
