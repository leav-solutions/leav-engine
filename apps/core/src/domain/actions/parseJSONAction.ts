// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ActionsListIOTypes,
    IActionsListFunction
} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'parseJSON',
        name: 'Parse JSON',
        description: 'Parse a JSON string',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.OBJECT],
        action: (values) => {
            const computedValues = values.map((value) => {
                value.value = JSON.parse('' + value.value);
                return value;
            });
            return {values: computedValues, errors: []};
        }
    };
}
