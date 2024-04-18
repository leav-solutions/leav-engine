// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'maskValue',
        name: 'Mask Value',
        description: 'Mask any value by replacing with dots or empty string if no value',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.STRING],
        action: (values) => {
            const computedValues = values.map((value) => {
                value.value = value.value !== null && value.value !== '' && (typeof value.value !== 'object' || Object.keys(value.value).length)
                ? '●●●●●●●'
                : '';
                return value;
            });
            return {values: computedValues, errors: []};
        }
    };
}
