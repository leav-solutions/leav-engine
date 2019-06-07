import ValidationError from '../../../errors/ValidationError';
import * as Joi from '@hapi/joi';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../../_types/actionsList';
import {IActionsListDomain} from '../actionsListDomain';

export default function(actionsListDomain: IActionsListDomain): IActionsListFunction {
    return {
        name: 'validateRegex',
        description: 'Check if value is a string matching given regex',
        inputTypes: [ActionsListIOTypes.STRING],
        outputTypes: [ActionsListIOTypes.STRING],
        params: [{name: 'regex', type: 'string', description: 'Validation regex'}],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): ActionsListValueType => {
            let schema = Joi.string();

            if (params.regex) {
                schema = schema.regex(new RegExp(params.regex));
            }

            const validationRes = Joi.validate(value, schema);

            if (!!validationRes.error) {
                throw new ValidationError(actionsListDomain.handleJoiError(ctx.attribute, validationRes.error));
            }

            return value;
        }
    };
}
