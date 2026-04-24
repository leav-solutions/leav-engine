// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ZodObject, type ZodRawShape, type ZodType} from 'zod';
import {type AutomationRuleTrigger} from '../../../_types/automation';
import {Errors} from '../../../_types/errors';
import {type IQueryInfos} from '../../../_types/queryInfos';
import ValidationError from '../../../errors/ValidationError';
import {type IAutomationTriggersRegistry} from './automationTriggersRegistry';
import {type AutomationTriggerDef, AutomationTriggerDefSynchronicity, AutomationTriggerDefTopics} from './_types';

export interface IAutomationTriggers {
    listAutomationTriggersDef({ctx}: {ctx: IQueryInfos}): AutomationTriggerDef[];
    validateAutomationRuleTrigger(ruleTrigger: AutomationRuleTrigger, ctx: IQueryInfos): Promise<void>;
}

// Maps Zod object keys (lowercase topic property names) to AutomationTriggerDefTopics enum values.
// Extend this map when adding a new entry to AutomationTriggerDefTopics.
const TOPIC_KEY_TO_ENUM: Record<string, AutomationTriggerDefTopics> = {
    library: AutomationTriggerDefTopics.LIBRARY,
    attribute: AutomationTriggerDefTopics.ATTRIBUTE,
};

const _getTopicsFromSchema = (schema?: ZodType): AutomationTriggerDefTopics[] => {
    if (!schema || !(schema instanceof ZodObject)) {
        return [];
    }
    return Object.keys((schema as ZodObject<ZodRawShape>).shape)
        .filter(k => k in TOPIC_KEY_TO_ENUM)
        .map(k => TOPIC_KEY_TO_ENUM[k]);
};

export interface IAutomationTriggersDeps {
    'core.domain.automation.triggers.registry': IAutomationTriggersRegistry;
}

export default function ({
    'core.domain.automation.triggers.registry': triggersRegistry,
}: IAutomationTriggersDeps): IAutomationTriggers {
    return {
        listAutomationTriggersDef: ({ctx}) =>
            triggersRegistry.listTriggers().map(({eventAction, topicSchema, synchronicity}) => ({
                eventAction,
                topics: _getTopicsFromSchema(topicSchema),
                synchronicity,
            })),

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
