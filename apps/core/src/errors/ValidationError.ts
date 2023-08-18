// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';

export default class ValidationError<T> extends Error {
    /**
     * Details about fields which did not pass validation
     */
    public fields: ErrorFieldDetail<T>;

    public type: ErrorTypes;

    public isCustomMessage: boolean;

    public context: any;

    public constructor(
        fields: ErrorFieldDetail<T>,
        message: string = 'Validation error',
        isCustomMessage: boolean = false,
        context?: any
    ) {
        super(message);

        this.type = ErrorTypes.VALIDATION_ERROR;
        this.fields = fields;
        this.isCustomMessage = isCustomMessage;
        this.context = context;
    }
}
