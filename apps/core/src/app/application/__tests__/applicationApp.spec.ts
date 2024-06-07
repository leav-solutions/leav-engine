import createApplicationApp from '../applicationApp';
import {APPS_URL_PREFIX} from '../../../_types/application';
import initQueryContext from '../../helpers/initQueryContext';
import {ValidateRequestTokenFunc} from '../../helpers/validateRequestToken';
import {IAuthApp} from '../../auth/authApp';

describe('ApplicationApp', () => {
    it('Should authenticate on OIDC Service', async () => {
        const authAppMock: Mockify<IAuthApp> = {
            authenticateWithOIDCService: jest.fn()
        };
        const validateRequestTokenHelper = jest.fn();
        const applicationApp = createApplicationApp({
            'core.app.auth': authAppMock as IAuthApp,
            'core.app.helpers.initQueryContext': initQueryContext({}),
            'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
            config: {auth: {oidc: {}}}
        });
        validateRequestTokenHelper.mockRejectedValueOnce('unused error');

        const expressInstance: any = {
            get: jest.fn()
        };
        applicationApp.registerRoute(expressInstance);
        const getAppsUrl = expressInstance.get.mock.calls[0];
        expect(getAppsUrl[0]).toEqual([`/${APPS_URL_PREFIX}/:endpoint`, `/${APPS_URL_PREFIX}/:endpoint/*`]);
        const authHandler = getAppsUrl[1];

        const req = {
            params: {endpoint: 'test'},
            query: {lang: 'fr'},
            body: {requestId: 'requestId'}
        };
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();
        await authHandler(req, res, next);

        expect(res.redirect).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(authAppMock.authenticateWithOIDCService).toHaveBeenCalledTimes(1);
        expect(authAppMock.authenticateWithOIDCService).toHaveBeenCalledWith(req, res);
    });

    it('Should redirect to login app', async () => {
        const validateRequestTokenHelper = jest.fn();
        const applicationApp = createApplicationApp({
            'core.app.helpers.initQueryContext': initQueryContext({}),
            'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
            config: {auth: {oidc: null}}
        });
        validateRequestTokenHelper.mockRejectedValueOnce('unused error');

        const expressInstance: any = {
            get: jest.fn()
        };
        applicationApp.registerRoute(expressInstance);
        const getAppsUrl = expressInstance.get.mock.calls[0];
        expect(getAppsUrl[0]).toEqual([`/${APPS_URL_PREFIX}/:endpoint`, `/${APPS_URL_PREFIX}/:endpoint/*`]);
        const authHandler = getAppsUrl[1];

        const req = {
            originalUrl: 'originalUrl',
            params: {endpoint: 'test'},
            query: {lang: 'fr'},
            body: {requestId: 'requestId'}
        };
        const res = {
            redirect: jest.fn()
        };
        const next = jest.fn();
        await authHandler(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith(`/app/login/?dest=${req.originalUrl}`);
    });
});
