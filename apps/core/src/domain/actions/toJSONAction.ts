import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toJSON',
        name: 'To JSON',
        description: 'Convert value to a JSON string',
        input_types: [ActionsListIOTypes.OBJECT],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.payload = elementValue?.payload === null ? null : JSON.stringify(elementValue.payload);
                return elementValue;
            });

            return {values: computedValues, errors: []};
        },
    };
}
