// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IValue} from '_types/value';
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';

export default function (): IActionsListFunction<{regex: true}> {
    return {
        id: 'validateRegex',
        name: 'Validate Regex',
        description: 'Check if value is a string matching given regex',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        params: [{name: 'regex', type: 'string', description: 'Validation regex', required: true, helper_value: ''}],
        compute: false,
        action: (values, params) => {
            const allErrors = values.reduce<Array<{errorType: Errors; attributeValue: IValue}>>(
                (errors, elementValue) => {
                    if (params.regex && !elementValue.payload.match(new RegExp(params.regex))) {
                        errors.push({errorType: Errors.INVALID_REGEXP, attributeValue: elementValue});
                    }
                    return errors;
                },
                []
            );

            return {values, errors: allErrors};
        }
    };
}
