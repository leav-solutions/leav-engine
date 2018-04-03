import {UserError} from 'graphql-errors';
import {GraphQLError} from 'graphql';

/**
 * Field error details
 * must be "fieldName: 'message about what failed'"
 */
export interface IValidationErrorFieldDetail {
    [fieldName: string]: string;
}

interface IValidationError {
    /**
     * Details about fields which did not pass validation
     */
    fields: IValidationErrorFieldDetail[];
}

export default class ValidationError extends Error {
    public fields: IValidationErrorFieldDetail[];

    constructor(fields: IValidationErrorFieldDetail[], message: string = 'Validation error') {
        super(message);

        this.fields = fields;
    }
}
