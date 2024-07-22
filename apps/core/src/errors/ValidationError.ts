// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorFieldDetail, ErrorTypes} from '../_types/errors';
import LeavError from './LeavError';

export default class ValidationError<T> extends LeavError<T> {
    /**
     * Details about fields which did not pass validation
     */
    public isCustomMessage: boolean;
    public context: any;

    public constructor(
        fields: ErrorFieldDetail<T>,
        message: string = 'Invalid request',
        isCustomMessage: boolean = false,
        context?: any
    ) {
        super(ErrorTypes.VALIDATION_ERROR, message, {fields});

        this.isCustomMessage = isCustomMessage;
        this.context = context;
    }
}
