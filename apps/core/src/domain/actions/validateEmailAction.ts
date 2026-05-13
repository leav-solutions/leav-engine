import {ActionsListIOTypes, type IActionsListFunction} from '../../_types/actionsList';
import {Errors} from '../../_types/errors';

export default function (): IActionsListFunction {
    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    return {
        id: 'validateEmail',
        name: 'Validate email',
        description: 'Check if value is a string matching email format',
        input_types: [ActionsListIOTypes.STRING],
        output_types: [ActionsListIOTypes.STRING],
        compute: false,
        action: values => {
            const allErrors = values.reduce((errors, elementValue) => {
                if (!elementValue.payload.match(EMAIL_REGEX)) {
                    errors.push({errorType: Errors.INVALID_EMAIL, attributeValue: elementValue});
                }
                return errors;
            }, []);

            return {values, errors: allErrors};
        },
    };
}
