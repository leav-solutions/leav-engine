// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {ErrorTypes} from '../_types/errors';
import LeavError from './LeavError';

export enum ApplicationErrorType {
    UNKNOWN_APP_ERROR = 'unknown_app',
    FORBIDDEN_ERROR = 'forbidden'
}

export default class ApplicationError extends LeavError<{}> {
    public applicationErrorType: ApplicationErrorType;
    public appEndpoint: string;
    public statusCode: number;

    private _statusCodeByType: {[key in ApplicationErrorType]: number} = {
        [ApplicationErrorType.UNKNOWN_APP_ERROR]: 404,
        [ApplicationErrorType.FORBIDDEN_ERROR]: 403
    };

    public constructor(type: ApplicationErrorType, appEndpoint: string) {
        super(ErrorTypes.VALIDATION_ERROR, type);

        this.applicationErrorType = type;
        this.statusCode = this._statusCodeByType[type];
        this.appEndpoint = appEndpoint;
    }
}
