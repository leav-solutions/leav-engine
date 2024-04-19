// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ActionsListIOTypes,
    IActionsListFunction
} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toNumber',
        name: 'To Number',
        description: 'Convert value to number',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        output_types: [ActionsListIOTypes.NUMBER],
        action: (values) => {
            const computedValues = values.map((value) => {
                value.value = value.value !== null ? Number(value.value) : null;
                return value;
            });
            return {values: computedValues, errors: []};
        }
    };
}
