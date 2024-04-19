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
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.value =
                    elementValue.value !== null &&
                    elementValue.value !== '' &&
                    (typeof elementValue.value !== 'object' || Object.keys(elementValue.value).length)
                        ? '●●●●●●●'
                        : '';
                return elementValue;
            });
            return {values: computedValues, errors: []};
        }
    };
}
