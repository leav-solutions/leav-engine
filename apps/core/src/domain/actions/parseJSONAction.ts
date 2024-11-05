// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'parseJSON',
        name: 'Parse JSON',
        description: 'Parse a JSON string',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.OBJECT],
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.payload = JSON.parse('' + elementValue.payload);
                return elementValue;
            });
            return {values: computedValues, errors: []};
        }
    };
}
