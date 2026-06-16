import {EventAction} from '@leav/utils';
import {z, type ZodType} from 'zod';
import {
    type AutomationRuleEventAction,
    type AutomationRuleEventTopic,
    SyncAutomationRuleEventAction,
} from '../../../_types/automation';
import {type IAutomationTriggersTopics} from './automationTriggersTopics';
import {Errors} from '../../../_types/errors';
import ValidationError from '../../../errors/ValidationError';
import {AutomationTriggerDefSynchronicity} from './_types';

// Internal shape used for registration — carries the Zod schema for validation
type AutomationTriggerRegistration = {
    eventAction: AutomationRuleEventAction;
    topicSchema: ZodType<Partial<AutomationRuleEventTopic>>;
    synchronicity: AutomationTriggerDefSynchronicity;
};

export interface IAutomationTriggersRegistry {
    listTriggers(): AutomationTriggerRegistration[];

    getTrigger(eventAction: AutomationRuleEventAction): AutomationTriggerRegistration;
    // Allows dynamic registration of triggers for plugins
    registerTrigger(def: AutomationTriggerRegistration): void;
}

export interface IAutomationTriggersRegistryDeps {
    'core.domain.automation.triggers.topics': IAutomationTriggersTopics;
}

export default function ({
    'core.domain.automation.triggers.topics': topics,
}: IAutomationTriggersRegistryDeps): IAutomationTriggersRegistry {
    const triggers: AutomationTriggerRegistration[] = [
        {
            eventAction: EventAction.RECORD_INIT,
            topicSchema: z.object({library: topics.librarySchema}).strict(),
            synchronicity: AutomationTriggerDefSynchronicity.BOTH,
        },
        {
            eventAction: EventAction.VALUE_SAVE,
            topicSchema: topics.libraryAndOptAttributeSchema,
            synchronicity: AutomationTriggerDefSynchronicity.BOTH,
        },
        {
            eventAction: EventAction.VALUE_DELETE,
            topicSchema: topics.libraryAndOptAttributeSchema,
            synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
        },
    ];

    return {
        listTriggers: () => triggers,
        getTrigger(eventAction: AutomationRuleEventAction) {
            const trigger = triggers.find(t => t.eventAction === eventAction);
            if (!trigger) {
                throw new ValidationError(
                    {
                        eventAction: {
                            msg: Errors.AUTOMATION_UNKNOWN_TRIGGER_EVENT_ACTION,
                            vars: {action: eventAction},
                        },
                    },
                    `No trigger found for event action ${eventAction}`,
                );
            }
            return trigger;
        },
        registerTrigger: (def: AutomationTriggerRegistration) => {
            if (triggers.some(t => t.eventAction === def.eventAction)) {
                throw new Error(`Trigger already registered for action ${def.eventAction}`);
            }
            triggers.push(def);
        },
    };
}
