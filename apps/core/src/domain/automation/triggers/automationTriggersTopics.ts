// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {z, type ZodType} from 'zod';
import {type GetSystemQueryContext} from '../../../utils/helpers/getSystemQueryContext';
import {type IAttributeDomain} from '../../attribute/attributeDomain';
import {type IValidateHelper} from '../../helpers/validate';

export interface IAutomationTriggersTopics {
    // Expose common topic schemas for reuse in automation rule validation
    librarySchema: ZodType<string>;
    attributeSchema: ZodType<string>;
    libraryAndAttributeSchema: ZodType<{library: string; attribute: string}>;
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
    // TODO add translation if necessary for frontend display
    const systemCtx = getSystemQueryContext('automation-triggers-topics');

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

    const libraryAndAttributeSchema = z
        .object({
            library: librarySchema,
            attribute: attributeSchema,
        })
        .check(async input => {
            try {
                await validate.validateLibraryAttribute(input.value.library, input.value.attribute, systemCtx);
            } catch (err) {
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
        libraryAndAttributeSchema,
    };
}
