import {type AmqpMessageHandler} from '@leav/message-broker';
import {EventAction, type IPubSubEvent, type IPubSubPayload} from '@leav/utils';
import {PubSub} from 'graphql-subscriptions';
import Joi from 'joi';
import {type IUtils} from '../../utils/utils';
import {type ILogger} from '@leav/logger';
import type * as Config from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {Errors} from '../../_types/errors';
import {type IDbPayloadInternal} from '../../_types/events';
import {type IEventsManagerRabbitMQ} from '../../infra/eventsManager/eventsManagerRabbitMQ';
import {databaseEventPayloadSize, databaseEventPublishDuration, databaseEventsCounter} from './_metrics';

export interface IEventsManagerDomain {
    sendDatabaseEvent<DBPayloadAction extends EventAction | unknown>(
        payload: IDbPayloadInternal<DBPayloadAction>,
        ctx: IQueryInfos,
    ): Promise<void>;
    sendPubSubEvent(payload: IPubSubPayload, ctx: IQueryInfos): Promise<void>;
    subscribe(triggersName: string[]): AsyncIterator<any>;
    initPubSubEventsConsumer(): Promise<void>;
    registerEventActions(actions: string[], prefix: string, ctx: IQueryInfos): void;
    getActions(): string[];
}

export interface IEventsManagerDomainDeps {
    config: Config.IConfig;
    'core.infra.eventsManager.rabbitMQ': IEventsManagerRabbitMQ;
    'core.utils.logger': ILogger;
    'core.utils': IUtils;
}

export default function ({
    config,
    'core.infra.eventsManager.rabbitMQ': eventsManagerRabbitMQ,
    'core.utils.logger': logger,
    'core.utils': utils,
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
                data: Joi.any().required(),
            }),
        });

        const isValid = msgBodySchema.validate(msg);

        if (isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    // No manual ack here anymore: resolving acks, throwing nacks (discard, no requeue) - handled by
    // createAmqpConnection's default contract. An unparseable message now fails the handler and gets
    // cleanly nacked/logged instead of being acked first and only logged on a later uncaught throw -
    // same practical outcome (never reprocessed), just traced through the standard error path.
    const _onPubSubMessage: AmqpMessageHandler = async msg => {
        const msgContent = msg.content.toString();

        const pubSubEvent: IPubSubEvent = JSON.parse(msgContent);

        try {
            _validateMsg(pubSubEvent);
        } catch (e) {
            // Logged only, processing still continues below - unchanged from previous behavior.
            logger.error(`Invalid message because ${e.message}`, {msgContent});
        }

        const publishedPayload = {
            time: pubSubEvent.time,
            userId: pubSubEvent.userId,
            ...pubSubEvent.payload.data,
        };

        await pubsub.publish(pubSubEvent.payload.triggerName, publishedPayload);
    };

    const _buildEventEnvelope = (payload: any, ctx: IQueryInfos): object => ({
        time: Date.now(),
        instanceId: config.instanceId,
        userId: ctx.userId,
        queryId: ctx.queryId,
        emitter: utils.getProcessIdentifier(),
        trigger: ctx.trigger,
        payload,
    });

    return {
        async initPubSubEventsConsumer() {
            await eventsManagerRabbitMQ.consumePubSubEvents(_onPubSubMessage);
        },
        async sendDatabaseEvent<DBPayloadAction extends EventAction | unknown>(
            payload: IDbPayloadInternal<DBPayloadAction>,
            ctx: IQueryInfos,
        ) {
            // trigger and automationDepth are database-events only (see IDbEvent): the pubsub
            // consumers have no use for them.
            const envelope = JSON.stringify({
                ..._buildEventEnvelope(payload, ctx),
                automationDepth: ctx.automationDepth,
            });

            const attributes = {event_action: payload.action};
            databaseEventPayloadSize.record(Buffer.byteLength(envelope, 'utf8'), attributes);

            const start = Date.now();
            let outcome: 'success' | 'error' = 'success';
            try {
                await eventsManagerRabbitMQ.publishDatabaseEvent(envelope);
            } catch (e) {
                outcome = 'error';
                logger.error(`Error while sending event to rabbitMQ: ${e.stack}`);
            } finally {
                databaseEventsCounter.add(1, {...attributes, outcome});
                databaseEventPublishDuration.record(Date.now() - start, {...attributes, outcome});
            }
        },
        sendPubSubEvent(payload: IPubSubPayload, ctx: IQueryInfos) {
            return eventsManagerRabbitMQ
                .publishPubSubEvent(JSON.stringify(_buildEventEnvelope(payload, ctx)))
                .catch(e => logger.error(`Error while sending event to rabbitMQ: ${e.stack}`));
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
                    ctx.lang,
                );
            }

            actions.forEach(action => _customEventActions.add(action));
        },
        getActions() {
            // Return the list of all actions: the custom actions and system action
            return [...Array.from(_customEventActions), ...Object.values(EventAction)];
        },
    };
}
