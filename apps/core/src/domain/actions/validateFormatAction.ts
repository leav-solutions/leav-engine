// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import {IDateRangeValue, IValue} from '_types/value';
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';
import {AttributeFormats, IAttribute, IEmbeddedAttribute} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import ValidationError from '../../errors/ValidationError';

export default function (): IActionsListFunction {
    return {
        id: 'validateFormat',
        name: 'Validate Format',
        description: 'Check if value matches attribute format',
        input_types: [
            ActionsListIOTypes.STRING,
            ActionsListIOTypes.NUMBER,
            ActionsListIOTypes.BOOLEAN,
            ActionsListIOTypes.OBJECT
        ],
        output_types: [
            ActionsListIOTypes.STRING,
            ActionsListIOTypes.NUMBER,
            ActionsListIOTypes.BOOLEAN,
            ActionsListIOTypes.OBJECT
        ],
        action: (values, _, ctx) => {
            const _getSchema = (attribute: IAttribute | IEmbeddedAttribute): Joi.Schema => {
                let schema;
                switch (attribute.format) {
                    case AttributeFormats.TEXT:
                    case AttributeFormats.RICH_TEXT:
                    case AttributeFormats.ENCRYPTED:
                        schema = Joi.string().allow('', null);
                        const embeddedAttribute = attribute as IEmbeddedAttribute;
                        if (embeddedAttribute.validation_regex) {
                            schema = schema.regex(new RegExp(embeddedAttribute.validation_regex));
                        }

                        break;
                    case AttributeFormats.NUMERIC:
                        schema = Joi.number().allow('', null);
                        break;
                    case AttributeFormats.DATE:
                        schema = Joi.date().allow('', null).timestamp('unix').raw();
                        break;
                    case AttributeFormats.BOOLEAN:
                        schema = Joi.boolean();
                        break;
                    case AttributeFormats.EXTENDED:
                        schema = Joi.object();

                        if (attribute.embedded_fields) {
                            schema = schema.keys(
                                attribute.embedded_fields.reduce((acc, field) => {
                                    acc[field.id] = _getSchema(field);

                                    return acc;
                                }, {})
                            );
                        }

                        schema = schema.allow(null);

                        break;
                    case AttributeFormats.DATE_RANGE:
                        schema = Joi.object({
                            from: Joi.date().timestamp('unix').raw().required(),
                            to: Joi.date().timestamp('unix').raw().required()
                        });
                        break;
                    case AttributeFormats.COLOR:
                        schema = Joi.string().max(6).hex();
                        break;
                }

                return schema;
            };
            if (!ctx.attribute) {
                throw new ValidationError<IAttribute>({id: Errors.UNKNOWN_ATTRIBUTE});
            }
            const attributeSchema = _getSchema(ctx.attribute);
            const errors: Array<{errorType: Errors; attributeValue: IValue; message?: string}> = [];

            if (!attributeSchema) {
                return {values, errors};
            }
            const formatSchema = attributeSchema.raw();

            const computedValues = values.map(elementValue => {
                // Joi might convert value before testing. raw() force it to send back the value we passed in
                const validationRes = formatSchema.validate(elementValue.payload);
                if (!!validationRes.error) {
                    errors.push({
                        errorType: Errors.FORMAT_ERROR,
                        attributeValue: elementValue,
                        message: validationRes.error.message
                    });
                }

                // Specific Validation for date range
                if (ctx.attribute!.format === AttributeFormats.DATE_RANGE) {
                    const rangeValue = elementValue.payload as IDateRangeValue;
                    if (Number(rangeValue.from) > Number(rangeValue.to)) {
                        errors.push({
                            errorType: Errors.INVALID_DATE_RANGE,
                            attributeValue: elementValue
                        });
                    }
                }
                return elementValue;
            });

            return {values: computedValues, errors};
        }
    };
}
