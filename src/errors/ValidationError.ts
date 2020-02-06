import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';

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
