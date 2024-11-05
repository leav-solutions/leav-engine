// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
        message = 'Invalid request',
        isCustomMessage = false,
        context?: any
    ) {
        super(ErrorTypes.VALIDATION_ERROR, message, {fields});

        this.isCustomMessage = isCustomMessage;
        this.context = context;
    }
}
