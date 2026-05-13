import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';

export default function (): IActionsListFunction {
    return {
        id: 'toLowercase',
        name: 'To Lowercase',
        description: 'Convert the string to lowercase',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: values => {
            const computedValues = values.map(elementValue => {
                elementValue.payload =
                    elementValue.payload !== null ? (elementValue.payload as string).toLowerCase() : null;

                return elementValue;
            });

            return {values: computedValues, errors: []};
        },
    };
}
