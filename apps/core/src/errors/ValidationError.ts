import {type ErrorFieldDetail, ErrorTypes} from '../_types/errors';
import LeavError from './LeavError';

export default class ValidationError<T> extends LeavError<T> {
    /**
     * Details about fields which did not pass validation
     */
    public isCustomMessage: boolean;
    public context: any;

    public constructor(
        fields: ErrorFieldDetail<T>,
        message = 'Invalid request',
        isCustomMessage = false,
        context?: any,
    ) {
        super(ErrorTypes.VALIDATION_ERROR, message, {fields});

        this.isCustomMessage = isCustomMessage;
        this.context = context;
    }
}
