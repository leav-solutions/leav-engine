export enum ErrorTypes {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

export interface IErrorByField {
    [fieldname: string]: string;
}

export interface IFormError {
    message?: string;
    extensions: {
        code: ErrorTypes;
        fields?: IErrorByField;
    };
}
