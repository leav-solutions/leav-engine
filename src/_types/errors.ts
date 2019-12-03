export enum ErrorTypes {
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    PERMISSION_ERROR = 'PERMISSION_ERROR',
    INTERNAL_ERROR = 'INTERNAL_ERROR'
}

/**
 * Field error details
 * must be "fieldName: 'message about what failed'"
 */
export type ErrorFieldDetail<T> = {
    [P in keyof T]?: string;
};
