// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '../_types/errors';
import LeavError from './LeavError';
import PermissionError from './PermissionError';
import ValidationError from './ValidationError';

export const isLeavError = (err: Error): err is LeavError<unknown> => err instanceof LeavError;
export const isPermissionError = (err: Error): err is PermissionError<unknown> =>
    isLeavError(err) ? err.type === ErrorTypes.PERMISSION_ERROR && err.hasOwnProperty('action') : false;
export const isValidationError = (err: Error): err is ValidationError<unknown> =>
    isLeavError(err) ? err.type === ErrorTypes.VALIDATION_ERROR && err.hasOwnProperty('isCustomMessage') : false;
