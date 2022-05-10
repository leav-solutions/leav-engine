// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export enum ApplicationErrorType {
    UNKNOWN_APP_ERROR = 'unknown_app',
    FORBIDDEN_ERROR = 'forbidden'
}

export default class ApplicationError extends Error {
    public type: ApplicationErrorType;
    public appEndpoint: string;
    public statusCode: number;

    private _statusCodeByType: {[key in ApplicationErrorType]: number} = {
        [ApplicationErrorType.UNKNOWN_APP_ERROR]: 404,
        [ApplicationErrorType.FORBIDDEN_ERROR]: 403
    };

    public constructor(type: ApplicationErrorType, appEndpoint: string) {
        super(type);

        this.type = type;
        this.statusCode = this._statusCodeByType[type];
        this.message = type;
        this.appEndpoint = appEndpoint;
    }
}
