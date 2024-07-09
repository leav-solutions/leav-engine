// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ErrorTypes} from '@leav/utils';
import {GraphQLError, GraphQLFormattedError} from 'graphql';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IExtendedErrorMsg} from '_types/errors';
import {IQueryInfos} from '_types/queryInfos';
import LeavError from '../../errors/LeavError';
import PermissionError from '../../errors/PermissionError';
import ValidationError from '../../errors/ValidationError';

export type HandleGraphqlErrorFunc = (err: GraphQLError, ctx: IQueryInfos) => GraphQLFormattedError;

interface IDeps {
    config: IConfig;
    'core.utils': IUtils;
    'core.utils.logger'?: winston.Winston;
}

export default function({config, 'core.utils': utils, 'core.utils.logger': logger = null}: IDeps) {
    const _handleError: HandleGraphqlErrorFunc = (err, context) => {
        const newError = {...err};
        const originalError = err.originalError;

        const isGraphqlValidationError = err.extensions && err.extensions.code === 'GRAPHQL_VALIDATION_FAILED';
        const errorType = (originalError as LeavError<unknown>)?.type ?? ErrorTypes.INTERNAL_ERROR;
        const errorFields = (originalError as LeavError<unknown>)?.fields
            ? {...(originalError as LeavError<unknown>)?.fields}
            : {};
        const errorAction = (originalError as PermissionError<unknown>)?.action ?? null;
        const errorCustomMessage = (originalError as ValidationError<unknown>)?.isCustomMessage ?? false;

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

    return _handleError;
}
