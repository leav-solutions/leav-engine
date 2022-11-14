// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import ValidationError from '../../errors/ValidationError';
import {
    ActionsListIOTypes,
    ActionsListValueType,
    IActionsListContext,
    IActionsListFunction
} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';

export default function (): IActionsListFunction {
    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    return {
        id: 'validateEmail',
        name: 'Validate email',
        description: 'Check if value is a string matching email format',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): ActionsListValueType => {
            const schema = Joi.string().regex(EMAIL_REGEX);

            const validationRes = schema.validate(value);

            if (!!validationRes.error) {
                throw new ValidationError({[ctx.attribute.id]: Errors.INVALID_EMAIL});
            }

            return value;
        }
    };
}
