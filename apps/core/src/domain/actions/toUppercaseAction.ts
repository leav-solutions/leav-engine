import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toUppercase',
        name: 'To Uppercase',
        description: 'Convert the string to uppercase',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.payload =
                    elementValue.payload !== null ? (elementValue.payload as string).toUpperCase() : null;
                return elementValue;
            });
            return {values: computedValues, errors: []};
        },
    };
}
