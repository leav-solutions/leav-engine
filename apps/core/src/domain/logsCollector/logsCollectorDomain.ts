// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAmqpService} from '@leav/message-broker';
import {getLogsIndexName, type IDbEvent} from '@leav/utils';
import type * as amqp from 'amqplib';
import Joi from 'joi';
import {type ILogger} from '@leav/logger';
import type * as Config from '_types/config';
import {type IIndexationService} from '../../infra/indexation/indexationService';
import {type IElasticsearchService} from '../../infra/elasticsearch/elasticsearchService';

export interface ILogsCollectorDomain {
    init(): Promise<void>;
}

export interface ILogsCollectorDomainDeps {
    config: Config.IConfig;
    'core.infra.amqpService': IAmqpService;
    'core.infra.indexation.indexationService': IIndexationService;
    'core.utils.logger': ILogger;
    'core.infra.elasticsearch.service': IElasticsearchService;
}

export default function ({
    config,
    'core.infra.amqpService': amqpService,
    'core.infra.indexation.indexationService': indexationService,
    'core.utils.logger': logger,
    'core.infra.elasticsearch.service': esService,
}: ILogsCollectorDomainDeps): ILogsCollectorDomain {
    const _validateMsg = (msg: IDbEvent) => {
        const msgBodySchema = Joi.object()
            .keys({
                time: Joi.number().required(),
                userId: Joi.string().required(),
                emitter: Joi.string().required(),
                payload: Joi.object()
                    .keys({
                        trigger: Joi.string(),
                        action: Joi.string().required(),
                        topic: Joi.object()
                            .keys({
                                record: Joi.object().keys({
                                    id: Joi.string().required(),
                                    libraryId: Joi.string().required(),
                                }),
                                library: Joi.string(),
                                attribute: Joi.string(),
                                tree: Joi.string(),
                            })
                            .unknown(true)
                            .allow(null),
                        before: Joi.any(),
                        after: Joi.any(),
                        metadata: Joi.any(),
                    })
                    .required(),
            })
            .unknown(true);

        const isValid = msgBodySchema.validate(msg);

        if (!!isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    const _onMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
        amqpService.consumer.channel.ack(msg);

        const event: IDbEvent = JSON.parse(msg.content.toString());

        try {
            _validateMsg(event);
        } catch (e) {
            logger.error(`Error processing message ${e.stack}`, {
                msg: {
                    ...msg,
                    content: msg.content.toString() || 'Unable to parse json content', // override buffer data, may be undefined if JSON.parse failed
                },
            });
        }

        const {payload, emitter, ...msgMetadata} = event;

        const indexName = getLogsIndexName(config.elasticsearch.indexPrefix, msgMetadata.instanceId);
        const dataToSave = {
            '@timestamp': event.time,
            ...msgMetadata,
            ...payload,
        };

        await esService.writeData(indexName, dataToSave);
    };

    return {
        async init(): Promise<void> {
            await amqpService.consumer.channel.assertQueue(config.logsCollector.queue);
            await amqpService.consumer.channel.bindQueue(
                config.logsCollector.queue,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events,
            );

            await amqpService.consume(
                config.logsCollector.queue,
                config.eventsManager.routingKeys.data_events,
                _onMessage,
            );

            await indexationService.init();

            logger.info('Logs Manager is ready. Waiting for events... 👀');
        },
    };
}
