// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type RJSFValidationError} from '@rjsf/utils';

/**
 * Transforms RJSF validation errors into a more user-friendly format.
 * Replaces the 'required' error message with a translated version.
 */
export const makeTransformErrors =
    (t: (key: string) => string) =>
    (errors: RJSFValidationError[]): RJSFValidationError[] =>
        errors.map(error => {
            if (error.name === 'required') {
                return {...error, message: t('automation.form.required')};
            }
            return error;
        });
