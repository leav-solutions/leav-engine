// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z, ZodObject, type ZodRawShape, type ZodType} from 'zod';
import {
    type AutomationRuleEventAction,
    type AutomationRulesEventTopic,
    type AutomationRuleTrigger,
    SyncAutomationRuleEventAction,
} from '../../_types/automation';
import {type IQueryInfos} from '../../_types/queryInfos';
import {EventAction} from '@leav/utils';
import ValidationError from '../../errors/ValidationError';
import {Errors} from '../../_types/errors';
import {type IAttributeDomain} from '../attribute/attributeDomain';
import {type IValidateHelper} from '../helpers/validate';
import {type GetSystemQueryContext} from '../..//utils/helpers/getSystemQueryContext';

export enum AutomationTriggerDefTopics {
    LIBRARY = 'LIBRARY',
    ATTRIBUTE = 'ATTRIBUTE',
    // Add a new entry here when a new topic key is added to IDbPayload['topic']
}

export enum AutomationTriggerDefSynchronicity {
    SYNC = 'SYNC',
    ASYNC = 'ASYNC',
    BOTH = 'BOTH',
}

// Public shape returned by getAutomationTriggers() and exposed via GraphQL
export type AutomationTriggerDef = {
    eventAction: AutomationRuleEventAction;
    topics: AutomationTriggerDefTopics[];
    synchronicity: AutomationTriggerDefSynchronicity;
};

// Internal shape used for registration — carries the Zod schema for validation
type AutomationTriggerRegistration = {
    eventAction: AutomationRuleEventAction;
    topicSchema: ZodType<Partial<AutomationRulesEventTopic>>;
    synchronicity: AutomationTriggerDefSynchronicity;
};

export interface IAutomationTriggers {
    getAutomationTriggers({ctx}: {ctx: IQueryInfos}): AutomationTriggerDef[];
    validateAutomationRuleTrigger(ruleTrigger: AutomationRuleTrigger, ctx: IQueryInfos): Promise<void>;

    // Allows dynamic registration of triggers for plugins
    registerTrigger(def: AutomationTriggerRegistration): void;

    // Expose common topic schemas for reuse in automation rule validation
    commonTopicSchemas: {
        library: ZodType<string>;
        attribute: ZodType<string>;
    };
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
    'core.domain.attribute': IAttributeDomain;
    'core.domain.helpers.validate': IValidateHelper;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.helpers.validate': validate,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
}: IAutomationTriggersDeps): IAutomationTriggers {
    // TODO add translation if necessary for frontend display
    const systemCtx = getSystemQueryContext('automation-triggers');

    const attributeSchema = z
        .string()
        .meta({id: 'attribute'})
        .check(async input => {
            try {
                await attributeDomain.getAttributeProperties({id: input.value, ctx: systemCtx});
            } catch (err) {
                input.issues.push({
                    code: 'invalid_value',
                    values: [],
                    input,
                    message: `Attribute with id "${input.value}" does not exist`,
                });
            }
        });
    const librarySchema = z
        .string()
        .meta({id: 'library'})
        .check(async input => {
            try {
                await validate.validateLibrary(input.value, systemCtx);
            } catch (err) {
                input.issues.push({
                    code: 'invalid_value',
                    values: [],
                    input,
                    message: `Library with id "${input.value}" does not exist`,
                });
            }
        });

    const triggers: AutomationTriggerRegistration[] = [
        {
            eventAction: SyncAutomationRuleEventAction.RECORD_INIT,
            topicSchema: z.object({library: librarySchema}).strict(),
            synchronicity: AutomationTriggerDefSynchronicity.SYNC,
        },
        {
            eventAction: EventAction.RECORD_SAVE,
            topicSchema: z.object({library: librarySchema}).strict(),
            synchronicity: AutomationTriggerDefSynchronicity.ASYNC,
        },
        {
            eventAction: EventAction.VALUE_SAVE,
            topicSchema: z.object({library: librarySchema, attribute: attributeSchema}).strict(),
            synchronicity: AutomationTriggerDefSynchronicity.BOTH, // Just for testing
        },
    ];

    return {
        getAutomationTriggers: ({ctx}) =>
            triggers.map(({eventAction, topicSchema, synchronicity}) => ({
                eventAction,
                topics: _getTopicsFromSchema(topicSchema),
                synchronicity,
            })),

        validateAutomationRuleTrigger: async ({eventAction, eventTopic, synchronous}, ctx) => {
            const triggerDef = triggers.find(t => t.eventAction === eventAction);
            if (!triggerDef) {
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

        registerTrigger: (def: AutomationTriggerRegistration) => {
            if (triggers.some(t => t.eventAction === def.eventAction)) {
                throw new Error(`Trigger already registered for action ${def.eventAction}`);
            }
            triggers.push(def);
        },
        commonTopicSchemas: {
            library: librarySchema,
            attribute: attributeSchema,
        },
    };
}
