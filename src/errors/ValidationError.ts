import {ErrorTypes} from '../_types/errors';

/**
 * Field error details
 * must be "fieldName: 'message about what failed'"
 */
export interface IValidationErrorFieldDetail {
    [fieldName: string]: string;
}

export default class ValidationError extends Error {
    /**
     * Details about fields which did not pass validation
     */
    public fields: IValidationErrorFieldDetail;

    public type: ErrorTypes;

    constructor(fields: IValidationErrorFieldDetail, message: string = 'Validation error') {
        super(message);

        this.type = ErrorTypes.VALIDATION_ERROR;
        this.fields = fields;
    }
}
