import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'parseJSON',
        name: 'Parse JSON',
        description: 'Parse a JSON string',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.OBJECT],
        compute: false,
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.payload = JSON.parse('' + elementValue.payload);
                return elementValue;
            });
            return {values: computedValues, errors: []};
        },
    };
}
