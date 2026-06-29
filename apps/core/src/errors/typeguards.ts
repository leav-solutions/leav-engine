import {ErrorTypes} from '../_types/errors';
import LeavError from './LeavError';
import type PermissionError from './PermissionError';
import type ValidationError from './ValidationError';

export const isLeavError = (err: Error): err is LeavError<unknown> => err instanceof LeavError;
export const isPermissionError = (err: Error): err is PermissionError<unknown> =>
    isLeavError(err) ? err.type === ErrorTypes.PERMISSION_ERROR && Object.hasOwn(err, 'action') : false;
export const isValidationError = (err: Error): err is ValidationError<unknown> =>
    isLeavError(err) ? err.type === ErrorTypes.VALIDATION_ERROR && Object.hasOwn(err, 'isCustomMessage') : false;
