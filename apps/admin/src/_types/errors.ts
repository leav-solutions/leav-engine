// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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

export enum ErrorDisplayTypes {
    ERROR = 'error',
    PERMISSION_ERROR = 'permission_error'
}
