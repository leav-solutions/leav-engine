import initQueryContext from '../helpers/initQueryContext';
import {type ValidateRequestTokenFunc} from '../helpers/validateRequestToken';
import {type Express} from 'express';
import createEndpointApp, {type IPluginRoute} from './endpointApp';
import {type IValueDomain} from '../../domain/value/valueDomain';
import {type IConfig} from '../../_types/config';

describe('endpointApp', () => {
    const validateRequestTokenHelper = vi.fn();
    const expressApp: Mockify<Express> = {get: vi.fn(), post: vi.fn()};

    const mockRoute = {
        path: '/test',
        handlers: [vi.fn()],
        method: 'get',
        isProtected: true,
    } satisfies IPluginRoute;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Should expose an extensionPoints.registerRoutes', async () => {
        const endpointApp = createEndpointApp({
            'core.app.helpers.initQueryContext': initQueryContext({}),
            'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
        });

        expect(endpointApp.extensionPoints?.registerRoutes).toBeDefined();
    });

    it('Should register all methods in ExpressApp provided in extensionPoints', async () => {
        const endpointApp = createEndpointApp({
            'core.app.helpers.initQueryContext': initQueryContext({}),
            'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
        });
        endpointApp.extensionPoints.registerRoutes([
            ['/test', 'get', [vi.fn()]],
            ['/mock', 'post', [vi.fn()]],
        ]);

        endpointApp.registerRoute(expressApp as unknown as Express);

        expect(expressApp.get).toHaveBeenCalledTimes(1);
        expect(expressApp.get).toHaveBeenCalledWith('/test', [expect.any(Function), expect.any(Function)]);
        expect(expressApp.post).toHaveBeenCalledTimes(1);
        expect(expressApp.post).toHaveBeenCalledWith('/mock', [expect.any(Function), expect.any(Function)]);
    });

    describe('_initCtxHandler as the first handler', () => {
        const mockInitQueryContext = vi.fn();
        beforeEach(() => {
            mockInitQueryContext.mockReturnValue({
                userId: null,
                lang: 'fr',
                queryId: 'requestId',
                groupsId: [],
                errors: [],
            });
        });

        it('Should call extends request and call next() if user is authenticated', async () => {
            const endpointApp = createEndpointApp({
                'core.app.helpers.initQueryContext': mockInitQueryContext,
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
            });
            endpointApp.extensionPoints.registerRoutes([[mockRoute.path, mockRoute.method, mockRoute.handlers]]);

            endpointApp.registerRoute(expressApp as unknown as Express);
            const [_initCtxHandler] = expressApp.get.mock.calls[0][1];
            const request = {query: {lang: 'fr'}, body: {requestId: 'requestId'}};
            const nextMock = vi.fn();
            validateRequestTokenHelper.mockResolvedValue({groupsId: 'groupsId', userId: 'userId'});

            await _initCtxHandler(request, undefined, nextMock);

            expect(request).toEqual({
                body: {
                    requestId: 'requestId',
                },
                ctx: {
                    errors: [],
                    groupsId: 'groupsId',
                    lang: 'fr',
                    queryId: 'requestId',
                    userId: 'userId',
                },
                query: {
                    lang: 'fr',
                },
            });
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith();
        });

        it('Should call extends request and call next() with error if user is not authenticated', async () => {
            const endpointApp = createEndpointApp({
                'core.app.helpers.initQueryContext': mockInitQueryContext,
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
            });
            endpointApp.extensionPoints.registerRoutes([[mockRoute.path, mockRoute.method, mockRoute.handlers]]);

            endpointApp.registerRoute(expressApp as unknown as Express);
            const [_initCtxHandler] = expressApp.get.mock.calls[0][1];
            const request = {query: {lang: 'fr'}, body: {requestId: 'requestId'}};
            const nextMock = vi.fn();
            validateRequestTokenHelper.mockRejectedValue('error');

            await _initCtxHandler(request, undefined, nextMock);

            expect(request).toEqual({
                body: {
                    requestId: 'requestId',
                },
                ctx: {
                    errors: [],
                    groupsId: [],
                    lang: 'fr',
                    queryId: 'requestId',
                    userId: null,
                },
                query: {
                    lang: 'fr',
                },
            });

            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith('error');
        });

        it('Should call extends request and call next() if route is not protected', async () => {
            const mockValueDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([
                    {
                        payload: {
                            id: '123456',
                        },
                    },
                ]),
            };

            const mockConfig: Partial<IConfig> = {
                defaultUserId: '2',
            };

            const endpointApp = createEndpointApp({
                'core.app.helpers.initQueryContext': mockInitQueryContext,
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
                'core.domain.value': mockValueDomain as IValueDomain,
                config: mockConfig as IConfig,
            });

            endpointApp.extensionPoints.registerRoutes([[mockRoute.path, mockRoute.method, mockRoute.handlers, false]]);

            endpointApp.registerRoute(expressApp as unknown as Express);
            const [_initCtxHandler] = expressApp.get.mock.calls[0][1];
            const request = {query: {lang: 'fr'}, body: {requestId: 'requestId'}};
            const nextMock = vi.fn();

            await _initCtxHandler(request, undefined, nextMock);

            expect(validateRequestTokenHelper).not.toHaveBeenCalled();

            expect(request).toEqual({
                body: {
                    requestId: 'requestId',
                },
                ctx: {
                    userId: mockConfig.defaultUserId, // default user id
                    groupsId: ['123456'],
                    errors: [],
                    lang: 'fr',
                    queryId: 'requestId',
                },
                query: {
                    lang: 'fr',
                },
            });
            expect(nextMock).toHaveBeenCalledTimes(1);
            expect(nextMock).toHaveBeenCalledWith();
        });
    });
});
