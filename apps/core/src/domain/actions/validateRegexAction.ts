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
import {IActionsListDomain} from '../actionsList/actionsListDomain';

interface IDeps {
    'core.domain.actionsList'?: IActionsListDomain;
}

export default function ({'core.domain.actionsList': actionsListDomain = null}: IDeps = {}): IActionsListFunction {
    return {
        id: 'validateRegex',
        name: 'Validate Regex',
        description: 'Check if value is a string matching given regex',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        params: [{name: 'regex', type: 'string', description: 'Validation regex', required: true, default_value: ''}],
        action: (value: ActionsListValueType, params: any, ctx: IActionsListContext): ActionsListValueType => {
            let schema = Joi.string();

            if (params.regex) {
                schema = schema.regex(new RegExp(params.regex));
            }

            const validationRes = schema.validate(value);

            if (!!validationRes.error) {
                throw new ValidationError(actionsListDomain.handleJoiError(ctx.attribute, validationRes.error));
            }

            return value;
        }
    };
}
