// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toUppercase',
        name: 'To Uppercase',
        description: 'Convert the string to uppercase',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.value = elementValue.value !== null ? (elementValue.value as string).toUpperCase() : null;
                return elementValue;
            });
            return {values: computedValues, errors: []};
        }
    };
}
