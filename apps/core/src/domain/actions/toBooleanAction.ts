// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListIOTypes, IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toBoolean',
        name: 'To Boolean',
        description: 'Convert value to boolean',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        output_types: [ActionsListIOTypes.BOOLEAN],
        compute: false,
        action: values => {
            const computedValues = values.map(elementValue => {
                switch (elementValue.payload) {
                    case 'true':
                        elementValue.payload = true;
                        break;
                    case 'false':
                        elementValue.payload = false;
                        break;
                    default:
                        elementValue.payload = !!elementValue.payload;
                        break;
                }
                return elementValue;
            });
            return {values: computedValues, errors: []};
        }
    };
}
