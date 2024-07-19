// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '@leav/utils';
import {GraphQLError, GraphQLFormattedError} from 'graphql';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {IConfig} from '_types/config';
import {GRAPHQL_ERROR_CODES, IExtendedErrorMsg} from '../../_types/errors';
import {IQueryInfos} from '_types/queryInfos';
import {isLeavError, isPermissionError, isValidationError} from 'errors/guards';

export type HandleGraphqlErrorFunc = (err: GraphQLError, ctx: IQueryInfos) => GraphQLFormattedError;

interface IDeps {
    config: IConfig;
    'core.utils': IUtils;
    'core.utils.logger'?: winston.Winston;
}

export default function ({
    config,
    'core.utils': utils,
    'core.utils.logger': logger = null
}: IDeps): HandleGraphqlErrorFunc {
    return (err, context) => {
        const newError = {...err};
        const originalError = err.originalError;

        const isGraphqlValidationError =
            err.extensions && err.extensions.code === GRAPHQL_ERROR_CODES.VALIDATION_FAILED;
        const errorType =
            isLeavError(originalError) && originalError.type ? originalError.type : ErrorTypes.INTERNAL_ERROR;
        const errorFields = isLeavError(originalError) ? {...originalError.fields} : {};
        const errorRecord = isLeavError(originalError) ? {...originalError.record} : {};
        const errorAction = isPermissionError(originalError) ? originalError.action : null;
        const errorCustomMessage = isValidationError(originalError) ? originalError.isCustomMessage : false;

        // Translate errors details
        for (const [field, errorDetails] of Object.entries(errorFields)) {
            const toTranslate =
                typeof errorDetails === 'string' ? {msg: errorDetails, vars: {}} : (errorDetails as IExtendedErrorMsg);

            const lang = context.lang ?? config.lang.default;

            errorFields[field] = !errorCustomMessage ? utils.translateError(toTranslate, lang) : errorFields[field];
        }

        newError.extensions.code = errorType;
        newError.extensions.fields = errorFields;
        newError.extensions.action = errorAction;
        newError.extensions.record = errorRecord;

        if (
            errorType === ErrorTypes.VALIDATION_ERROR ||
            errorType === ErrorTypes.PERMISSION_ERROR ||
            isGraphqlValidationError
        ) {
            if (errorType === ErrorTypes.VALIDATION_ERROR && Object.keys(errorFields).length === 1) {
                newError.message = errorFields[Object.keys(errorFields)[0]];
            }

            return newError;
        }

        // Error is logged with original message
        newError.message = `[${context.queryId}] ${err.message}`;
        // @ts-ignore
        logger.error(`${newError.message}\n${(err.extensions.exception?.stacktrace ?? []).join('\n')}`);

        if (!config.debug) {
            newError.message = `[${context.queryId}] Internal Error`;
            delete newError.extensions?.exception;
        }

        return newError;
    };
}
