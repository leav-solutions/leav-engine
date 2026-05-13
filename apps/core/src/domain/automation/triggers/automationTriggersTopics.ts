import {z, type ZodType} from 'zod';
import {type ZodMetaUISchema} from '../../../_types/jsonSchemaForm';
import {type GetSystemQueryContext} from '../../../utils/helpers/getSystemQueryContext';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IValidateHelper} from '../../helpers/validate';

export interface IAutomationTriggersTopics {
    // Expose common topic schemas for reuse in automation rule validation
    librarySchema: ZodType<string>;
    attributeSchema: ZodType<string>;
    libraryAndOptAttributeSchema: ZodType<{library: string; attribute?: string}>;
}

export interface IAutomationTriggersTopicsDeps {
    'core.domain.attribute': IAttributeDomain;
    'core.domain.helpers.validate': IValidateHelper;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
}

export default function ({
    'core.domain.attribute': attributeDomain,
    'core.domain.helpers.validate': validate,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
}: IAutomationTriggersTopicsDeps): IAutomationTriggersTopics {
    const systemCtx = getSystemQueryContext('automation-triggers-topics');

    const librarySchema = z
        .string()
        .check(async input => {
            try {
                await validate.validateLibrary(input.value, systemCtx);
            } catch (err) {
                // TODO add translation if necessary for frontend display
                input.issues.push({
                    code: 'invalid_value',
                    values: [],
                    input,
                    message: `Library with id "${input.value}" does not exist`,
                });
            }
        })
        .meta({
            id: 'library',
            ui: {
                title: 'automation.form.trigger.event_topic_library',
                placeholder: 'automation.form.trigger.event_topic_library_placeholder',
            },
        } satisfies ZodMetaUISchema);

    const attributeSchema = z
        .string()
        .check(async input => {
            try {
                await attributeDomain.getAttributeProperties({id: input.value, ctx: systemCtx});
            } catch (err) {
                // TODO add translation if necessary for frontend display
                input.issues.push({
                    code: 'invalid_value',
                    values: [],
                    input,
                    message: `Attribute with id "${input.value}" does not exist`,
                });
            }
        })
        .meta({
            id: 'attribute',
            ui: {
                title: 'automation.form.trigger.event_topic_attribute',
                placeholder: 'automation.form.trigger.event_topic_attribute_placeholder',
            },
        } satisfies ZodMetaUISchema);

    const libraryAndOptAttributeSchema = z
        .object({
            library: librarySchema,
            attribute: attributeSchema.optional(),
        })
        .check(async input => {
            if (input.value.attribute === undefined) {
                return;
            }
            try {
                await validate.validateLibraryAttribute(input.value.library, input.value.attribute, systemCtx);
            } catch (err) {
                // TODO add translation if necessary for frontend display
                input.issues.push({
                    code: 'invalid_value',
                    values: [],
                    input,
                    message: `Library with id "${input.value.library}" and attribute with id "${input.value.attribute}" do not exist`,
                });
            }
        })
        .strict();

    return {
        librarySchema,
        attributeSchema,
        libraryAndOptAttributeSchema,
    };
}
