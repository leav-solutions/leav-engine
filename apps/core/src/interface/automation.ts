import {logger} from '@leav/logger';
import {type IDbEvent} from '@leav/utils';
import {type GetSystemQueryContext} from '../utils/helpers/getSystemQueryContext';
import {type IAutomationDomain} from '../domain/automation/automationDomain';
import {type IAutomationRabbitMQ} from '../infra/automation/automationRabbitMQ';
import {type AutomationRuleEventAction} from '../_types/automation';

export interface IAutomationInterface {
    init(): Promise<void>;
}

interface IDeps {
    'core.domain.automation': IAutomationDomain;
    'core.infra.automation.rabbitMQ': IAutomationRabbitMQ;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
}

export default function ({
    'core.domain.automation': automationDomain,
    'core.infra.automation.rabbitMQ': automationRabbitMQ,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
}: IDeps): IAutomationInterface {
    return {
        async init(): Promise<void> {
            await automationRabbitMQ.consumeEvents(async msg => {
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
                // No ack/nack here: resolving acks, throwing nacks (discard) - handled by createAmqpConnection.
            });

            logger.info('Automation is ready. Waiting for events... 👀');
        },
    };
}
