// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as Config from '_types/config';
import {IQueryInfos} from '_types/queryInfos';
import * as amqp from 'amqplib';
import {PubSub} from 'graphql-subscriptions';
import Joi from 'joi';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {DbPayload, IPubSubEvent, IPubSubPayload} from '../../_types/event';

export interface IEventsManagerDomain {
    sendDatabaseEvent(payload: DbPayload, ctx: IQueryInfos): Promise<void>;
    sendPubSubEvent(payload: IPubSubPayload, ctx: IQueryInfos): Promise<void>;
    subscribe(triggersName: string[]): AsyncIterator<any>;
    initPubSubEventsConsumer(): Promise<void>;
    initCustomConsumer(
        queueName: string,
        routinKey: string,
        onMessage: (msg: amqp.ConsumeMessage, channel: amqp.ConfirmChannel) => Promise<void>
    ): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
}

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.utils.logger': logger = null,
    'core.utils': utils = null
}: IDeps): IEventsManagerDomain {
    const pubsub = new PubSub();

    const _validateMsg = (msg: IPubSubEvent) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
            emitter: Joi.string().required(),
            payload: Joi.object().keys({
                triggerName: Joi.string().required(),
                data: Joi.any().required()
            })
        });

        const isValid = msgBodySchema.validate(msg);

        if (!!isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    const _onMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
        amqpService.consumer.channel.ack(msg);

        const pubSubEvent: IPubSubEvent = JSON.parse(msg.content.toString());

        try {
            _validateMsg(pubSubEvent);
        } catch (e) {
            logger.error(e);
        }

        const publishedPayload = {
            time: pubSubEvent.time,
            userId: pubSubEvent.userId,
            ...pubSubEvent.payload.data
        };

        await pubsub.publish(pubSubEvent.payload.triggerName, publishedPayload);
    };

    const _send = async (routingKey: string, payload: any, ctx: IQueryInfos): Promise<void> => {
        await amqpService.publish(
            config.amqp.exchange,
            routingKey,
            JSON.stringify({time: Date.now(), userId: ctx.userId, emitter: utils.getProcessIdentifier(), payload})
        );
    };

    return {
        async initPubSubEventsConsumer() {
            // listening pubsub events
            await amqpService.consumer.channel.assertQueue(config.eventsManager.queues.pubsub_events);
            await amqpService.consumer.channel.bindQueue(
                config.eventsManager.queues.pubsub_events,
                config.amqp.exchange,
                config.eventsManager.routingKeys.pubsub_events
            );

            await amqpService.consume(
                config.eventsManager.queues.pubsub_events,
                config.eventsManager.routingKeys.pubsub_events,
                _onMessage
            );
        },
        async initCustomConsumer(queue, routingKey, onMessage) {
            // listening pubsub events
            await amqpService.consumer.channel.assertQueue(queue);
            await amqpService.consumer.channel.bindQueue(queue, config.amqp.exchange, routingKey);

            await amqpService.consume(queue, routingKey, msg => onMessage(msg, amqpService.consumer.channel));
        },
        async sendDatabaseEvent(payload: DbPayload, ctx: IQueryInfos): Promise<void> {
            await _send(config.eventsManager.routingKeys.data_events, payload, ctx);
        },
        async sendPubSubEvent(payload: IPubSubPayload, ctx: IQueryInfos): Promise<void> {
            await _send(config.eventsManager.routingKeys.pubsub_events, payload, ctx);
        },
        subscribe(triggersName: string[]): AsyncIterator<any> {
            return pubsub.asyncIterator(triggersName);
        }
    };
}
