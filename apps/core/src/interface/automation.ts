import type * as amqp from 'amqplib';
import {type IAmqpService} from '@leav/message-broker';
import {logger} from '@leav/logger';
import {type IDbEvent} from '@leav/utils';
import {type GetSystemQueryContext} from '../utils/helpers/getSystemQueryContext';
import {type IAutomationDomain} from '../domain/automation/automationDomain';
import {type IConfig} from '../_types/config';
import {type AutomationRuleEventAction} from '../_types/automation';

export interface IAutomationInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.domain.automation': IAutomationDomain;
    'core.infra.amqpService': IAmqpService;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
    config: IConfig;
}

export default function ({
    'core.domain.automation': automationDomain,
    'core.infra.amqpService': amqpService,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
    config,
}: IDeps): IAutomationInterface {
    return {
        async init(): Promise<void> {
            await amqpService.consumer.channel.assertQueue(config.automation.queues.events);
            await amqpService.consumer.channel.bindQueue(
                config.automation.queues.events,
                config.amqp.exchange,
                config.eventsManager.routingKeys.data_events,
            );

            await amqpService.consume(
                config.automation.queues.events,
                config.eventsManager.routingKeys.data_events,
                async (msg: amqp.ConsumeMessage): Promise<void> => {
                    try {
                        const event: IDbEvent = JSON.parse(msg.content.toString());
                        const ctx = getSystemQueryContext('automation:onMessage');

                        await automationDomain.triggerRules({
                            event: {
                                action: event.payload.action as AutomationRuleEventAction,
                                topic: event.payload.topic,
                            },
                            synchronous: false,
                            ctx,
                        });
                        amqpService.consumer.channel.ack(msg);
                    } catch (e) {
                        logger.error(`[Automation] Error processing message: ${e.stack ?? e.message}`, {
                            msg: {
                                ...msg,
                                content: msg.content.toString(),
                            },
                        });
                        amqpService.consumer.channel.nack(msg, false, false); // Discard the message
                    }
                },
            );

            logger.info('Automation is ready. Waiting for events... 👀');
        },
    };
}
