// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ActionsListIOTypes,
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
        action: (values) => {
            const allErrors = values.reduce((errors, value) => {
                if (!value.value.match(EMAIL_REGEX)) {
                    errors.push({errorType: Errors.INVALID_EMAIL, attributeValue: value});
                }
                return errors;
            }, []);

            return {values, errors: allErrors};
        }
    };
}
