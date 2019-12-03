import {ErrorTypes} from '../_types/errors';

/**
 * Field error details
 * must be "fieldName: 'message about what failed'"
 */
export type ErrorFieldDetail<T> = {
    [P in keyof T]?: string;
};

export default class ValidationError<T> extends Error {
    /**
     * Details about fields which did not pass validation
     */
    public fields: ErrorFieldDetail<T>;

    public type: ErrorTypes;

    constructor(fields: ErrorFieldDetail<T>, message: string = 'Validation error') {
        super(message);

        this.type = ErrorTypes.VALIDATION_ERROR;
        this.fields = fields;
    }
}
