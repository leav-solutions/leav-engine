// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import initQueryContext from '../helpers/initQueryContext';
import type {ValidateRequestTokenFunc} from '../helpers/validateRequestToken';
import type {Express} from 'express';
import createEndpointApp from './endpointApp';

describe('endpointApp', () => {
    const validateRequestTokenHelper = jest.fn();
    const expressApp: Mockify<Express> = {get: jest.fn(), post: jest.fn()};

    beforeEach(() => {
        expressApp.get.mockClear();
        expressApp.post.mockClear();
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
        const endpointApp = createEndpointApp({
            'core.app.helpers.initQueryContext': initQueryContext({}),
            'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc
        });
        endpointApp.extensionPoints.registerRoutes([['/protected_endpoint', 'get', [jest.fn()]]]);

        it('Should call extends request and call next()', async () => {
            endpointApp.registerRoute(expressApp as unknown as Express);
            const [_initCtxHandler, ...ignoredHandlers] = expressApp.get.mock.calls[0][1];
            const request = {query: {lang: 'fr'}, body: {requestId: 'requestId'}};
            const nextMock = jest.fn();
            validateRequestTokenHelper.mockResolvedValue({groupsId: 'groupsId', userId: 'userId'});

            await _initCtxHandler(request, undefined, nextMock);

            expect(request).toEqual({
                body: {
                    requestId: 'requestId'
                },
                ctx: {
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

        it('Should call extends request and call next() with error', async () => {
            endpointApp.registerRoute(expressApp as unknown as Express);
            const [_initCtxHandler, ...ignoredHandlers] = expressApp.get.mock.calls[0][1];
            const request = {query: {lang: 'fr'}, body: {requestId: 'requestId'}};
            const nextMock = jest.fn();
            validateRequestTokenHelper.mockRejectedValue('error');

            await _initCtxHandler(request, undefined, nextMock);

            expect(request).toEqual({
                body: {
                    requestId: 'requestId'
                },
                ctx: {
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
    });
});
