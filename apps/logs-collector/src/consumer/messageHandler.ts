// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Client} from '@elastic/elasticsearch';
import {getLogsIndexName} from '@leav/utils';
import * as amqp from 'amqplib';
import {IConfig} from '_types/config';
import {writeData} from '../elasticsearchService';

export const handleMessage = async (
    msg: amqp.ConsumeMessage,
    channel: amqp.ConfirmChannel,
    config: IConfig,
    esClient: Client
) => {
    try {
        const msgContent = JSON.parse(msg.content.toString());

        if (config.debug) {
            console.info('📰 Received message', msgContent);
        }

        const {payload, emitter, ...msgMetadata} = msgContent;

        const indexName = getLogsIndexName(msgMetadata.instanceId);
        const dataToSave = {
            ...msgMetadata,
            ...payload
        };

        // Write data to elasticsearch
        await writeData(indexName, dataToSave, esClient);

        channel.ack(msg);
    } catch (e) {
        console.error('📰 Error processing message', e, 'Message was:', msg);
    }
};
