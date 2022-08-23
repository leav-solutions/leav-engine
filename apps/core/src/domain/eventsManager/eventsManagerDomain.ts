// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import {IAmqpService} from '@leav/message-broker';
import * as Config from '_types/config';
import {DbPayload, IPubSubPayload, IPubSubEvent} from '../../_types/event';
import {IQueryInfos} from '_types/queryInfos';
import {PubSub} from 'graphql-subscriptions';
import winston from 'winston';

export interface IEventsManagerDomain {
    sendDatabaseEvent(payload: DbPayload, ctx: IQueryInfos): Promise<void>;
    sendPubSubEvent(payload: IPubSubPayload, ctx: IQueryInfos): Promise<void>;
    suscribe(triggersName: string[]): AsyncIterator<any>;
    init(): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.utils.logger'?: winston.Winston;
}

export default function({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.utils.logger': logger = null
}: IDeps): IEventsManagerDomain {
    const pubsub = new PubSub();

    const _validateMsg = (msg: IPubSubEvent) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
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

    const _onMessage = async (msg: string): Promise<void> => {
        const pubSubEvent: IPubSubEvent = JSON.parse(msg);

        try {
            _validateMsg(pubSubEvent);
        } catch (e) {
            logger.error(e);
        }

        await pubsub.publish(pubSubEvent.payload.triggerName, pubSubEvent.payload.data);
    };

    const _send = async (routingKey: string, payload: any, ctx: IQueryInfos): Promise<void> => {
        await amqpService.publish(
            config.amqp.exchange,
            routingKey,
            JSON.stringify({time: Date.now(), userId: ctx.userId, payload})
        );
    };

    return {
        async init() {
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
        async sendDatabaseEvent(payload: DbPayload, ctx: IQueryInfos): Promise<void> {
            await _send(config.eventsManager.routingKeys.data_events, payload, ctx);
        },
        async sendPubSubEvent(payload: IPubSubPayload, ctx: IQueryInfos): Promise<void> {
            await _send(config.eventsManager.routingKeys.pubsub_events, payload, ctx);
        },
        suscribe(triggersName: string[]): AsyncIterator<any> {
            return pubsub.asyncIterator(triggersName);
        }
    };
}
