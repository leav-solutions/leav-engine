// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';
import {IValue} from '_types/value';

export default function(): IActionsListFunction {
    return {
        id: 'validateURL',
        name: 'Validate URL',
        description: 'Check if value is a string matching URL format',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        action: (values: IValue[]) => {
            const errors = [];
            for (const value of values) {
                try {
                    new URL(value as string);
                } catch (err) {
                    errors.push({errorType: Errors.INVALID_URL, attributeValue: value});
                }
            }

            return {values, errors};
        }
    };
}
