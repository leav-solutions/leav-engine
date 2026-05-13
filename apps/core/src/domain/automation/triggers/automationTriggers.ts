import {type AutomationRuleTrigger} from '../../../_types/automation';
import {Errors} from '../../../_types/errors';
import {type IQueryInfos} from '../../../_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {type IAutomationTriggersRegistry} from './automationTriggersRegistry';
import {AutomationTriggerDefSynchronicity} from './_types';

export interface IAutomationTriggers {
    validateAutomationRuleTrigger(ruleTrigger: AutomationRuleTrigger, ctx: IQueryInfos): Promise<void>;
}

export interface IAutomationTriggersDeps {
    'core.domain.automation.triggers.registry': IAutomationTriggersRegistry;
}

export default function ({
    'core.domain.automation.triggers.registry': triggersRegistry,
}: IAutomationTriggersDeps): IAutomationTriggers {
    return {
        validateAutomationRuleTrigger: async ({eventAction, eventTopic, synchronous}, ctx) => {
            const triggerDef = triggersRegistry.getTrigger(eventAction);

            if (triggerDef.synchronicity === AutomationTriggerDefSynchronicity.SYNC && !synchronous) {
                throw new ValidationError(
                    {
                        eventAction: {
                            msg: Errors.AUTOMATION_INVALID_TRIGGER_ONLY_SYNC,
                            vars: {action: eventAction},
                        },
                    },
                    `Trigger for event action ${eventAction} is only available for synchronous execution`,
                );
            }
            if (triggerDef.synchronicity === AutomationTriggerDefSynchronicity.ASYNC && synchronous) {
                throw new ValidationError(
                    {
                        eventAction: {
                            msg: Errors.AUTOMATION_INVALID_TRIGGER_ONLY_ASYNC,
                            vars: {action: eventAction},
                        },
                    },
                    `Trigger for event action ${eventAction} is only available for asynchronous execution`,
                );
            }

            const result = await triggerDef.topicSchema.safeParseAsync(eventTopic);
            if (!result.success) {
                const details = result.error.issues.reduce(
                    (acc, issue) => {
                        const topic = issue.code === 'unrecognized_keys' ? issue.keys[0] : issue.path.join('.');
                        acc[topic] = {
                            msg: Errors.AUTOMATION_INVALID_TRIGGER_EVENT_TOPIC,
                            vars: {topic, details: issue.message},
                        };
                        return acc;
                    },
                    {} as Record<string, {msg: string; vars: Record<string, unknown>}>,
                );
                throw new ValidationError(details, `Invalid topic for trigger ${eventAction}`);
            }
        },
    };
}
