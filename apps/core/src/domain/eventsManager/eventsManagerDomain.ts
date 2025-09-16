// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IAmqpService} from '@leav/message-broker';
import {EventAction, IDbPayload, type IPubSubEvent, type IPubSubPayload} from '@leav/utils';
import type * as amqp from 'amqplib';
import {PubSub} from 'graphql-subscriptions';
import Joi from 'joi';
import {type IUtils} from 'utils/utils';
import {type ILogger} from '@leav/logger';
import type * as Config from '_types/config';
import {type IQueryInfos} from '_types/queryInfos';
import {Errors} from '../../_types/errors';
import {type IDbPayloadInternal} from '_types/events';

export interface IEventsManagerDomain {
    sendDatabaseEvent<DBPayloadAction extends EventAction>(
        payload: IDbPayloadInternal<DBPayloadAction>,

        ctx: IQueryInfos
    ): Promise<void>;
    sendPubSubEvent(payload: IPubSubPayload, ctx: IQueryInfos): Promise<void>;
    subscribe(triggersName: string[]): AsyncIterator<any>;
    initPubSubEventsConsumer(): Promise<void>;
    initCustomConsumer(
        queueName: string,
        routinKey: string,
        onMessage: (msg: amqp.ConsumeMessage, channel: amqp.ConfirmChannel) => Promise<void>
    ): Promise<void>;
    registerEventActions(actions: string[], prefix: string, ctx: IQueryInfos): void;
    getActions(): string[];
}

export interface IEventsManagerDomainDeps {
    config: Config.IConfig;
    'core.infra.amqpService': IAmqpService;
    'core.utils.logger': ILogger;
    'core.utils': IUtils;
}

export default function ({
    config,
    'core.infra.amqpService': amqpService,
    'core.utils.logger': logger,
    'core.utils': utils
}: IEventsManagerDomainDeps): IEventsManagerDomain {
    const _customEventActions = new Set<string>(); // Using a Set to avoid duplicates
    const pubsub = new PubSub();

    const _validateMsg = (msg: IPubSubEvent) => {
        const msgBodySchema = Joi.object().keys({
            instanceId: Joi.string().required(),
            time: Joi.number().required(),
            userId: Joi.string().required(),
            emitter: Joi.string().required(),
            queryId: Joi.string(),
            trigger: Joi.string(),
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

    const _onPubSubMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
        amqpService.consumer.channel.ack(msg);
        const msgContent = msg.content.toString();

        const pubSubEvent: IPubSubEvent = JSON.parse(msgContent);

        try {
            _validateMsg(pubSubEvent);
        } catch (e) {
            logger.error(`Invalid message because ${e.message}`, {msgContent});
        }

        const publishedPayload = {
            time: pubSubEvent.time,
            userId: pubSubEvent.userId,
            ...pubSubEvent.payload.data
        };

        await pubsub.publish(pubSubEvent.payload.triggerName, publishedPayload);
    };

    const _send = (routingKey: string, payload: any, ctx: IQueryInfos): Promise<void> =>
        amqpService
            .publish(
                config.amqp.exchange,
                routingKey,
                JSON.stringify({
                    time: Date.now(),
                    instanceId: config.instanceId,
                    userId: ctx.userId,
                    queryId: ctx.queryId,
                    emitter: utils.getProcessIdentifier(),
                    trigger: ctx.trigger,
                    payload
                })
            )
            .catch(e => {
                logger.error(`Error while sending event to rabbitMQ: ${e.stack}`);
            });

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
                _onPubSubMessage
            );
        },
        async initCustomConsumer(queue, routingKey, onMessage) {
            // listening pubsub events
            await amqpService.consumer.channel.assertQueue(queue);
            await amqpService.consumer.channel.bindQueue(queue, config.amqp.exchange, routingKey);

            await amqpService.consume(queue, routingKey, msg => onMessage(msg, amqpService.consumer.channel));
        },
        sendDatabaseEvent<DBPayloadAction extends EventAction>(
            payload: IDbPayloadInternal<DBPayloadAction>,
            ctx: IQueryInfos
        ) {
            return _send(config.eventsManager.routingKeys.data_events, payload, ctx);
        },
        sendPubSubEvent(payload: IPubSubPayload, ctx: IQueryInfos) {
            return _send(config.eventsManager.routingKeys.pubsub_events, payload, ctx);
        },
        subscribe(triggersName: string[]): AsyncIterator<any> {
            return pubsub.asyncIterator(triggersName);
        },
        registerEventActions(actions, prefix, ctx) {
            // Check if all actions are prefixed
            const invalidActions = actions.filter(action => !action.startsWith(prefix + '_'));
            if (invalidActions.length) {
                throw utils.generateExplicitValidationError(
                    'action',
                    {msg: Errors.MISSING_ACTION_PREFIX, vars: {actions: invalidActions.join(', ')}},
                    ctx.lang
                );
            }

            actions.forEach(action => _customEventActions.add(action));
        },
        getActions() {
            // Return the list of all actions: the custom actions and system action
            return [...Array.from(_customEventActions), ...Object.values(EventAction)];
        }
    };
}
