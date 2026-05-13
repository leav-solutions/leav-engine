import LeavError from './LeavError';

export enum ApplicationErrorType {
    UNKNOWN_APP_ERROR = 'unknown_app',
    FORBIDDEN_ERROR = 'forbidden',
}

export default class ApplicationError extends LeavError<{}, ApplicationErrorType> {
    public applicationErrorType: ApplicationErrorType;
    public appEndpoint: string;
    public statusCode: number;

    private _statusCodeByType: {[key in ApplicationErrorType]: number} = {
        [ApplicationErrorType.UNKNOWN_APP_ERROR]: 404,
        [ApplicationErrorType.FORBIDDEN_ERROR]: 403,
    };

    public constructor(type: ApplicationErrorType, appEndpoint: string) {
        super(type, type);

        this.applicationErrorType = type;
        this.statusCode = this._statusCodeByType[type];
        this.appEndpoint = appEndpoint;
    }
}
