import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';
import {type IValue} from '../../_types/value';

export default function (): IActionsListFunction {
    return {
        id: 'validateURL',
        name: 'Validate URL',
        description: 'Check if value is a string matching URL format',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: (values: IValue[]) => {
            const allErrors = values.reduce<Array<{errorType: Errors; attributeValue: IValue}>>(
                (errors, elementValue) => {
                    try {
                        new URL(elementValue as string);
                    } catch {
                        errors.push({errorType: Errors.INVALID_URL, attributeValue: elementValue});
                    }

                    return errors;
                },
                [],
            );

            return {values, errors: allErrors};
        },
    };
}
