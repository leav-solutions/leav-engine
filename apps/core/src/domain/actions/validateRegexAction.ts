// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';

export default function (): IActionsListFunction<{regex: true}> {
    return {
        id: 'validateRegex',
        name: 'Validate Regex',
        description: 'Check if value is a string matching given regex',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        params: [{name: 'regex', type: 'string', description: 'Validation regex', required: true, default_value: ''}],
        action: (values, params) => {
            const allErrors = values.reduce((errors, elementValue) => {
                if (params.regex && !elementValue.payload.match(new RegExp(params.regex))) {
                    errors.push({errorType: Errors.INVALID_REGEXP, attributeValue: elementValue});
                }
                return errors;
            }, []);

            return {values, errors: allErrors};
        }
    };
}
