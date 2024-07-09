// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import LeavError from 'errors/LeavError';
import PermissionError from 'errors/PermissionError';
import ValidationError from 'errors/ValidationError';
import {GraphQLError, GraphQLErrorExtensions} from 'graphql';
import {IUtils} from 'utils/utils';
import {IConfig} from '_types/config';
import {AdminPermissionsActions} from '../../_types/permissions';
import {ErrorTypes} from '../../_types/errors';
import {mockCtx} from '../../__tests__/mocks/shared';
import handleGraphqlError from './handleGraphqlError';
import winston from 'winston';

describe('handleGraphqlError', () => {
    const mockConfig = {
        debug: false
    };

    const mockLogger: Mockify<winston.Winston> = {
        warn: jest.fn(),
        error: jest.fn()
    };

    const _makeError: (
        message: string,
        originalError: LeavError<unknown> | PermissionError<unknown> | ValidationError<unknown>,
        extensions?: GraphQLErrorExtensions
    ) => GraphQLError = (message, originalError, extensions = {}) => ({
        extensions,
        path: [],
        locations: [],
        message,
        nodes: [],
        source: null,
        positions: [],
        originalError,
        name: 'error',
        toJSON: null,
        [Symbol.toStringTag]: 'error'
    });

    const mockUtils: Mockify<IUtils> = {
        translateError: jest.fn().mockImplementation(err => err.msg + ' TRANSLATED')
    };

    describe('VALIDATION_ERROR', () => {
        it('Should return an error with original message and all fields provided with translated error', () => {
            const fields = {
                price: 'invalid price format',
                name: 'name does not match regex'
            };
            const originalError: LeavError<unknown> = {
                name: 'ValidationError',
                message: 'Validation error',
                type: ErrorTypes.VALIDATION_ERROR,
                fields
            };

            const errorHandler = handleGraphqlError({
                config: mockConfig as IConfig,
                'core.utils.logger': mockLogger as winston.Winston,
                'core.utils': mockUtils as IUtils
            });
            const handledError = errorHandler(_makeError('Some error message', originalError), mockCtx);

            expect(handledError.message).toBe('Some error message');
            expect(handledError.extensions.code).toBe(ErrorTypes.VALIDATION_ERROR);
            expect(handledError.extensions.fields).toEqual({
                price: fields.price + ' TRANSLATED',
                name: fields.name + ' TRANSLATED'
            });
        });

        it('Should return error message from first field if one field provided', () => {
            const fields = {
                price: 'invalid price format'
            };
            const originalError: LeavError<unknown> = {
                name: 'ValidationError',
                message: 'Validation error',
                type: ErrorTypes.VALIDATION_ERROR,
                fields
            };

            const errorHandler = handleGraphqlError({
                config: mockConfig as IConfig,
                'core.utils.logger': mockLogger as winston.Winston,
                'core.utils': mockUtils as IUtils
            });
            const handledError = errorHandler(_makeError('Some error message', originalError), mockCtx);

            expect(handledError.message).toBe(fields.price + ' TRANSLATED');
            expect(handledError.extensions.code).toBe(ErrorTypes.VALIDATION_ERROR);
            expect(handledError.extensions.fields).toEqual({
                price: fields.price + ' TRANSLATED'
            });
        });

        it('Should not translate error message if it is a custom message', () => {
            const fields = {
                price: 'invalid price format',
                name: 'name does not match regex'
            };
            const originalError: ValidationError<unknown> = {
                name: 'ValidationError',
                message: 'Validation error',
                type: ErrorTypes.VALIDATION_ERROR,
                isCustomMessage: true,
                context: mockCtx,
                fields
            };

            const errorHandler = handleGraphqlError({
                config: mockConfig as IConfig,
                'core.utils.logger': mockLogger as winston.Winston,
                'core.utils': mockUtils as IUtils
            });
            const handledError = errorHandler(_makeError('Some error message', originalError), mockCtx);

            expect(handledError.message).toBe('Some error message');
            expect(handledError.extensions.code).toBe(ErrorTypes.VALIDATION_ERROR);
            expect(handledError.extensions.fields).toEqual({
                price: fields.price,
                name: fields.name
            });
        });
    });

    describe('PERMISSION_ERROR', () => {
        it('Should return permission action and a generic message', () => {
            const originalError: PermissionError<unknown> = {
                type: ErrorTypes.PERMISSION_ERROR,
                message: 'You shall not pass!',
                name: 'PermissionError',
                action: AdminPermissionsActions.ACCESS_LIBRARIES
            };

            const errorHandler = handleGraphqlError({
                config: mockConfig as IConfig,
                'core.utils.logger': mockLogger as winston.Winston,
                'core.utils': mockUtils as IUtils
            });
            const handledError = errorHandler(_makeError('You shall not pass!', originalError), mockCtx);

            expect(handledError.message).toBe('You shall not pass!');
            expect(handledError.extensions.code).toBe(ErrorTypes.PERMISSION_ERROR);
        });
    });

    describe('GRAPHQL_VALIDATION_FAILED', () => {
        it('Should return GraphQL errors as they are', () => {
            const errorHandler = handleGraphqlError({
                config: mockConfig as IConfig,
                'core.utils.logger': mockLogger as winston.Winston,
                'core.utils': mockUtils as IUtils
            });
            const handledError = errorHandler(
                _makeError('Bad request', null, {code: 'GRAPHQL_VALIDATION_FAILED'}),
                mockCtx
            );

            expect(handledError.message).toBe('Bad request');
            expect(handledError.extensions.code).toBe(ErrorTypes.INTERNAL_ERROR);
        });
    });

    describe('INTERNAL_ERROR', () => {
        it('Should return an error with an ID and provided message', () => {
            const mockConfigWithDebug = {
                ...mockConfig,
                debug: true
            };

            const errorHandler = handleGraphqlError({
                config: mockConfigWithDebug as IConfig,
                'core.utils.logger': mockLogger as winston.Winston,
                'core.utils': mockUtils as IUtils
            });
            const handledError = errorHandler(_makeError('Boom!', null, {}), mockCtx);

            expect(handledError.message).toMatch('Boom!');
            expect(handledError.message).toMatch(mockCtx.queryId);
            expect(handledError.extensions.code).toBe(ErrorTypes.INTERNAL_ERROR);
        });

        it('Should hide the original message if not in debug mode', () => {
            const errorHandler = handleGraphqlError({
                config: mockConfig as IConfig,
                'core.utils.logger': mockLogger as winston.Winston,
                'core.utils': mockUtils as IUtils
            });
            const handledError = errorHandler(_makeError('Boom!', null, {}), mockCtx);

            expect(handledError.message).toMatch('Internal Error');
            expect(handledError.message).toMatch(mockCtx.queryId);
            expect(handledError.extensions.code).toBe(ErrorTypes.INTERNAL_ERROR);
        });
    });
});
