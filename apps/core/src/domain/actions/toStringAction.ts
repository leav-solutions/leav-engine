import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';

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
        },
    };
}
