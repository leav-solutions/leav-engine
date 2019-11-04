import * as Joi from 'joi';
import ValidationError from '../../errors/ValidationError';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';
import {AttributeFormats, IAttribute, IEmbeddedAttribute} from '../../_types/attribute';
import {IActionsListDomain} from '../actionsList/actionsListDomain';

interface IDeps {
    'core.domain.actionsList'?: IActionsListDomain;
}

export default function({'core.domain.actionsList': actionsListDomain = null}: IDeps = {}): IActionsListFunction {
    return {
        name: 'validateFormat',
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
                        schema = Joi.string().allow(['', null]);

                        if ((attribute as IEmbeddedAttribute).validation_regex) {
                            schema = schema.regex(new RegExp((attribute as IEmbeddedAttribute).validation_regex));
                        }

                        break;
                    case AttributeFormats.NUMERIC:
                        schema = Joi.number().allow(['', null]);
                        break;
                    case AttributeFormats.DATE:
                        schema = Joi.date()
                            .allow(['', null])
                            .timestamp('unix')
                            .raw();
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

                        break;
                }

                return schema;
            };

            // Joi might convert value before testing. raw() force it to send back the value we passed in
            const formatSchema = _getSchema(ctx.attribute).raw();

            const validationRes = Joi.validate(value, formatSchema);

            if (!!validationRes.error) {
                throw new ValidationError(actionsListDomain.handleJoiError(ctx.attribute, validationRes.error));
            }

            return value;
        }
    };
}
