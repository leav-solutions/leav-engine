// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, ActionsListValueType, IActionsListFunction} from '../../_types/actionsList';

export default function(): IActionsListFunction {
    return {
        id: 'maskValue',
        name: 'Mask Value',
        description: 'Mask any value by replacing with dots or empty string if no value',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.STRING],
        action: (value: ActionsListValueType): string => {
            return value !== null && value !== '' && (typeof value !== 'object' || Object.keys(value).length)
                ? '●●●●●●●'
                : '';
        }
    };
}
