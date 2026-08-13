import {type AutomationRuleEventAction, type AutomationRuleTrigger} from '../../../_types/automation';
import {Errors} from '../../../_types/errors';
import {type IQueryInfos} from '../../../_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {type IAutomationTriggersRegistry} from './automationTriggersRegistry';
import {AutomationTriggerDefSynchronicity} from './_types';

export interface IAutomationTriggers {
    validateAutomationRuleTrigger(ruleTrigger: AutomationRuleTrigger, ctx: IQueryInfos): Promise<void>;
    isEventActionInTriggers(eventAction: AutomationRuleEventAction, synchronous: boolean): boolean;
}

export interface IAutomationTriggersDeps {
    'core.domain.automation.triggers.registry': IAutomationTriggersRegistry;
}

export default function ({
    'core.domain.automation.triggers.registry': triggersRegistry,
}: IAutomationTriggersDeps): IAutomationTriggers {
    const isEventActionInTriggersCacheSync = new Map<AutomationRuleEventAction, boolean>();
    const isEventActionInTriggersCacheAsync = new Map<AutomationRuleEventAction, boolean>();

    return {
        isEventActionInTriggers: (eventAction, synchronous) => {
            // use map cache to avoid iterating over the triggers array on every event,
            // as this function is called for every event received and the triggers are not expected to change during runtime
            const cache = synchronous ? isEventActionInTriggersCacheSync : isEventActionInTriggersCacheAsync;
            const resultCache = cache.get(eventAction);
            if (resultCache !== undefined) {
                return resultCache;
            }
            const result = triggersRegistry
                .listTriggers()
                .some(
                    t =>
                        t.eventAction === eventAction &&
                        (synchronous
                            ? t.synchronicity === AutomationTriggerDefSynchronicity.SYNC ||
                              t.synchronicity === AutomationTriggerDefSynchronicity.BOTH
                            : t.synchronicity === AutomationTriggerDefSynchronicity.ASYNC ||
                              t.synchronicity === AutomationTriggerDefSynchronicity.BOTH),
                );
            cache.set(eventAction, result);
            return result;
        },
        validateAutomationRuleTrigger: async ({eventAction, eventTopic, synchronous}) => {
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
