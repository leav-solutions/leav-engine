// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toJSON',
        name: 'To JSON',
        description: 'Convert value to a JSON string',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.STRING],
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.value = elementValue?.value === null ? null : JSON.stringify(elementValue.value);
                return elementValue;
            });

            return {values: computedValues, errors: []};
        }
    };
}
