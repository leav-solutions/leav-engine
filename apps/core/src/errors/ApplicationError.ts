// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import LeavError from './LeavError';

export enum ApplicationErrorType {
    UNKNOWN_APP_ERROR = 'unknown_app',
    FORBIDDEN_ERROR = 'forbidden'
}

export default class ApplicationError extends LeavError<{}, ApplicationErrorType> {
    public applicationErrorType: ApplicationErrorType;
    public appEndpoint: string;
    public statusCode: number;

    private _statusCodeByType: {[key in ApplicationErrorType]: number} = {
        [ApplicationErrorType.UNKNOWN_APP_ERROR]: 404,
        [ApplicationErrorType.FORBIDDEN_ERROR]: 403
    };

    public constructor(type: ApplicationErrorType, appEndpoint: string) {
        super(type, type);

        this.applicationErrorType = type;
        this.statusCode = this._statusCodeByType[type];
        this.appEndpoint = appEndpoint;
    }
}
