// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import initQueryContext from '../helpers/initQueryContext';
import type {ValidateRequestTokenFunc} from '../helpers/validateRequestToken';
import type {Express} from 'express';
import createEndpointApp, {IPluginRoute} from './endpointApp';
import {IValueDomain} from 'domain/value/valueDomain';
import {IConfig} from '_types/config';

describe('endpointApp', () => {
    const validateRequestTokenHelper = jest.fn();
    const expressApp: Mockify<Express> = {get: jest.fn(), post: jest.fn()};

    const mockRoute = {
        path: '/test',
        handlers: [jest.fn()],
        method: 'get',
        isProtected: true
    } satisfies IPluginRoute;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should expose an extensionPoints.registerRoutes', async () => {
        const endpointApp = createEndpointApp({
            'core.app.helpers.initQueryContext': initQueryContext({}),
            'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc
        });

        expect(endpointApp.extensionPoints?.registerRoutes).toBeDefined();
    });

    it('Should register all methods in ExpressApp provided in extensionPoints', async () => {
        const endpointApp = createEndpointApp({
            'core.app.helpers.initQueryContext': initQueryContext({}),
            'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc
        });
        endpointApp.extensionPoints.registerRoutes([
            ['/test', 'get', [jest.fn()]],
            ['/mock', 'post', [jest.fn()]]
        ]);

        endpointApp.registerRoute(expressApp as unknown as Express);

        expect(expressApp.get).toHaveBeenCalledTimes(1);
        expect(expressApp.get).toHaveBeenCalledWith('/test', [expect.any(Function), expect.any(Function)]);
        expect(expressApp.post).toHaveBeenCalledTimes(1);
        expect(expressApp.post).toHaveBeenCalledWith('/mock', [expect.any(Function), expect.any(Function)]);
    });

    describe('_initCtxHandler as the first handler', () => {
        let mockInitQueryContext: jest.Mock;
        beforeEach(() => {
            mockInitQueryContext = jest.fn().mockReturnValue({
                userId: null,
                lang: 'fr',
                queryId: 'requestId',
                groupsId: [],
                errors: []
            });
        });

        it('Should call extends request and call next() if user is authenticated', async () => {
            const endpointApp = createEndpointApp({
                'core.app.helpers.initQueryContext': mockInitQueryContext,
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc
            });
            endpointApp.extensionPoints.registerRoutes([[mockRoute.path, mockRoute.method, mockRoute.handlers]]);

            endpointApp.registerRoute(expressApp as unknown as Express);
            const [_initCtxHandler, ..._ignoredHandlers] = expressApp.get.mock.calls[0][1];
            const request = {query: {lang: 'fr'}, body: {requestId: 'requestId'}};
            const nextMock = jest.fn();
            validateRequestTokenHelper.mockResolvedValue({groupsId: 'groupsId', userId: 'userId'});

            await _initCtxHandler(request, undefined, nextMock);

            expect(request).toEqual({
                body: {
                    requestId: 'requestId'
                },
                ctx: {
                    errors: [],
                    groupsId: 'groupsId',
                    lang: 'fr',
                    queryId: 'requestId',
                    userId: 'userId'
                },
                query: {
                    lang: 'fr'
                }
            });
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith();
        });

        it('Should call extends request and call next() with error if user is not authenticated', async () => {
            const endpointApp = createEndpointApp({
                'core.app.helpers.initQueryContext': mockInitQueryContext,
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc
            });
            endpointApp.extensionPoints.registerRoutes([[mockRoute.path, mockRoute.method, mockRoute.handlers]]);

            endpointApp.registerRoute(expressApp as unknown as Express);
            const [_initCtxHandler, ..._ignoredHandlers] = expressApp.get.mock.calls[0][1];
            const request = {query: {lang: 'fr'}, body: {requestId: 'requestId'}};
            const nextMock = jest.fn();
            validateRequestTokenHelper.mockRejectedValue('error');

            await _initCtxHandler(request, undefined, nextMock);

            expect(request).toEqual({
                body: {
                    requestId: 'requestId'
                },
                ctx: {
                    errors: [],
                    groupsId: [],
                    lang: 'fr',
                    queryId: 'requestId',
                    userId: null
                },
                query: {
                    lang: 'fr'
                }
            });

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith('error');
        });

        it('Should call extends request and call next() if route is not protected', async () => {
            const mockValueDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([
                    {
                        payload: {
                            id: '123456'
                        }
                    }
                ])
            };

            const mockConfig: Partial<IConfig> = {
                defaultUserId: '2'
            };

            const endpointApp = createEndpointApp({
                'core.app.helpers.initQueryContext': mockInitQueryContext,
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
                'core.domain.value': mockValueDomain as IValueDomain,
                config: mockConfig as IConfig
            });

            endpointApp.extensionPoints.registerRoutes([[mockRoute.path, mockRoute.method, mockRoute.handlers, false]]);

            endpointApp.registerRoute(expressApp as unknown as Express);
            const [_initCtxHandler, ..._ignoredHandlers] = expressApp.get.mock.calls[0][1];
            const request = {query: {lang: 'fr'}, body: {requestId: 'requestId'}};
            const nextMock = jest.fn();

            await _initCtxHandler(request, undefined, nextMock);

            expect(validateRequestTokenHelper).not.toHaveBeenCalled();

            expect(request).toEqual({
                body: {
                    requestId: 'requestId'
                },
                ctx: {
                    userId: mockConfig.defaultUserId, // default user id
                    groupsId: ['123456'],
                    errors: [],
                    lang: 'fr',
                    queryId: 'requestId'
                },
                query: {
                    lang: 'fr'
                }
            });
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith();
        });
    });
});
