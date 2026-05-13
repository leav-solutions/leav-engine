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
