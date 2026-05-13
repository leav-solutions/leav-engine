import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toNumber',
        name: 'To Number',
        description: 'Convert value to number',
        input_types: [ActionsListIOTypes.STRING, ActionsListIOTypes.NUMBER, ActionsListIOTypes.BOOLEAN],
        output_types: [ActionsListIOTypes.NUMBER],
        compute: false,
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.payload = elementValue.payload !== null ? Number(elementValue.payload) : null;
                return elementValue;
            });
            return {values: computedValues, errors: []};
        },
    };
}
