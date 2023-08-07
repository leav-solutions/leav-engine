// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import {IDateRangeValue} from '_types/value';
import ValidationError from '../../errors/ValidationError';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';
import {AttributeFormats, IAttribute, IEmbeddedAttribute} from '../../_types/attribute';
import {Errors} from '../../_types/errors';
import {IActionsListDomain} from '../actionsList/actionsListDomain';

interface IDeps {
    'core.domain.actionsList'?: IActionsListDomain;
}

export default function ({'core.domain.actionsList': actionsListDomain = null}: IDeps = {}): IActionsListFunction {
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
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): ActionsListValueType => {
            const _getSchema = (attribute: IAttribute | IEmbeddedAttribute): Joi.Schema => {
                let schema;
                switch (attribute.format) {
                    case AttributeFormats.TEXT:
                    case AttributeFormats.ENCRYPTED:
                        schema = Joi.string().allow('', null);

                        if ((attribute as IEmbeddedAttribute).validation_regex) {
                            schema = schema.regex(new RegExp((attribute as IEmbeddedAttribute).validation_regex));
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
                        schema = Joi.string().hex();
                        break;
                }

                return schema;
            };

            const attributeSchema = _getSchema(ctx.attribute);

            if (!attributeSchema) {
                return value;
            }

            // Joi might convert value before testing. raw() force it to send back the value we passed in
            const formatSchema = attributeSchema.raw();

            const validationRes = formatSchema.validate(value);

            if (!!validationRes.error) {
                throw new ValidationError(actionsListDomain.handleJoiError(ctx.attribute, validationRes.error));
            }

            // Specific Validation for date range
            if (ctx.attribute.format === AttributeFormats.DATE_RANGE) {
                const rangeValue = value as IDateRangeValue;
                if (Number(rangeValue.from) > Number(rangeValue.to)) {
                    throw new ValidationError({[ctx.attribute.id]: Errors.INVALID_DATE_RANGE});
                }
            }

            return value;
        }
    };
}
