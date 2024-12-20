// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';
import {IValue} from '_types/value';

export default function (): IActionsListFunction {
    return {
        id: 'validateURL',
        name: 'Validate URL',
        description: 'Check if value is a string matching URL format',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: (values: IValue[]) => {
            const allErrors = values.reduce<Array<{errorType: Errors; attributeValue: IValue}>>(
                (errors, elementValue) => {
                    try {
                        new URL(elementValue as string);
                    } catch (err) {
                        errors.push({errorType: Errors.INVALID_URL, attributeValue: elementValue});
                    }

                    return errors;
                },
                []
            );

            return {values, errors: allErrors};
        }
    };
}
