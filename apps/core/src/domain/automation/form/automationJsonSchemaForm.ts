// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AutomationRuleJsonSchemaFormType} from '../../../_types/automation';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IAutomationTriggersRegistry} from '../triggers/automationTriggersRegistry';
import {AutomationTriggerDefSynchronicity} from '../triggers/_types';
import {type RJSFSchema} from '@rjsf/utils';

export interface IAutomationJsonSchemaFormDomain {
    getAutomationRuleJsonSchemaForm({
        formType,
        ctx,
    }: {
        formType: AutomationRuleJsonSchemaFormType;
        ctx: IQueryInfos;
    }): Promise<RJSFSchema>;
}

interface IAutomationJsonSchemaFormDomainDeps {
    'core.domain.automation.triggers.registry': IAutomationTriggersRegistry;
}

// Extracts $defs from a Zod-generated sub-schema and returns the cleaned schema alongside
// the extracted definitions. Necessary because Zod places $defs at the root of each
// toJSONSchema() call, but rjsf resolves $ref against the root of the whole document.
export const extractAndLiftDefs = (jsonSchema: RJSFSchema): {schema: RJSFSchema; defs: Record<string, RJSFSchema>} => {
    const {
        $defs,
        $schema: _$schema,
        ...rest
    } = jsonSchema as RJSFSchema & {
        $defs?: Record<string, RJSFSchema>;
        $schema?: string;
    };

    // Zod v4 generates `id` (JSON Schema Draft 4) via .meta({id}). We drop it intentionally:
    // the dict key already anchors $ref resolution (e.g. $ref: "#/$defs/library"), and keeping
    // $id causes AJV8 to register multiple URI anchors when the same def is $ref'd from more
    // than one place in the schema (e.g. trigger.properties.topic AND allOf[].then).
    // We also strip the `ui` key: Zod copies all .meta() fields into $defs, but ui metadata
    // belongs only in the UI schema.
    const normalizedDefs: Record<string, RJSFSchema> = {};

    for (const [key, def] of Object.entries($defs ?? {})) {
        if (typeof def !== 'object' || def === null) {
            normalizedDefs[key] = def as RJSFSchema;
            continue;
        }

        normalizedDefs[key] = Object.fromEntries(
            Object.entries(def).filter(([k]) => k !== 'id' && k !== 'ui'),
        ) as RJSFSchema;
    }

    return {schema: rest as RJSFSchema, defs: normalizedDefs};
};

export default function ({
    'core.domain.automation.triggers.registry': automationTriggersRegistry,
}: IAutomationJsonSchemaFormDomainDeps): IAutomationJsonSchemaFormDomain {
    return {
        async getAutomationRuleJsonSchemaForm({formType}) {
            const isEdition = formType === AutomationRuleJsonSchemaFormType.EDITION;
            const collectedDefs: Record<string, RJSFSchema> = {};

            const triggers = automationTriggersRegistry.listTriggers();

            // Extract all topic schemas up front so we can merge their properties for RJSF rendering.
            const triggerTopicSchemas = triggers.map(trigger => {
                const {schema: eventTopicSchema, defs} = extractAndLiftDefs(
                    trigger.topicSchema.toJSONSchema() as unknown as RJSFSchema,
                );
                Object.assign(collectedDefs, defs);
                return {trigger, eventTopicSchema};
            });

            const triggerSchema: RJSFSchema = {
                type: 'object',
                properties: {
                    eventAction: {
                        type: 'string',
                        enum: triggers.map(t => t.eventAction),
                    },
                },
                required: ['eventAction'],
                allOf: triggerTopicSchemas.map(({trigger, eventTopicSchema}) => ({
                    if: {
                        properties: {eventAction: {const: trigger.eventAction}},
                        required: ['eventAction'],
                    },
                    then: {
                        properties: {
                            eventTopic: eventTopicSchema,
                            synchronous: (() => {
                                switch (trigger.synchronicity) {
                                    case AutomationTriggerDefSynchronicity.SYNC:
                                        return {type: 'boolean', default: true, readOnly: true};
                                    case AutomationTriggerDefSynchronicity.ASYNC:
                                        return {type: 'boolean', default: false, readOnly: true};
                                    case AutomationTriggerDefSynchronicity.BOTH:
                                        return {type: 'boolean', default: false};
                                }
                            })(),
                        },
                        required: ['eventTopic', 'synchronous'],
                    },
                })),
            };

            return {
                type: 'object',
                ...(Object.keys(collectedDefs).length > 0 ? {$defs: collectedDefs} : {}),
                properties: {
                    ...(isEdition ? {active: {type: 'boolean', default: false}} : {}),
                    label: {
                        type: 'string',
                    },
                    description: {
                        type: 'string',
                    },
                    trigger: {
                        ...triggerSchema,
                        ...(isEdition ? {readOnly: true} : {}),
                    },
                },
                required: ['label', 'trigger'],
            };
        },
    };
}
