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
    return {
        id: 'validateURL',
        name: 'Validate URL',
        description: 'Check if value is a string matching URL format',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): ActionsListValueType => {
            try {
                new URL(value as string);
            } catch (err) {
                throw new ValidationError({[ctx.attribute.id]: Errors.INVALID_URL});
            }

            return value;
        }
    };
}
