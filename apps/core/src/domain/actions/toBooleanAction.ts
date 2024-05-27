// Copyright LEAV Solutions 2017
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
        action: values => {
            const computedValues = values.map(elementValue => {
                switch (elementValue.value) {
                    case 'true':
                        elementValue.value = true;
                        break;
                    case 'false':
                        elementValue.value = false;
                        break;
                    default:
                        elementValue.value = !!elementValue.value;
                        break;
                }
                return elementValue;
            });
            return {values: computedValues, errors: []};
        }
    };
}
