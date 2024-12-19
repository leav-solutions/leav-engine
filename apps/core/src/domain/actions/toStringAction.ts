// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toString',
        name: 'To String',
        description: 'Convert value to string',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.payload = elementValue.payload !== null ? String(elementValue.payload) : null;
                return elementValue;
            });
            return {values: computedValues, errors: []};
        }
    };
}
