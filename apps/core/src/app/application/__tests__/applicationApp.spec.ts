// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import createApplicationApp, {IApplicationAppDeps} from '../applicationApp';
import {APPS_URL_PREFIX} from '../../../_types/application';
import initQueryContext from '../../helpers/initQueryContext';
import {ValidateRequestTokenFunc} from '../../helpers/validateRequestToken';
import {IAuthApp} from '../../auth/authApp';
import {IApplicationDomain} from '../../../domain/application/applicationDomain';
import {IUtils, ToAny} from '../../../utils/utils';
import {IGlobalSettingsDomain} from '../../../domain/globalSettings/globalSettingsDomain';

const depsBase: ToAny<IApplicationAppDeps> = {
    config: {},
    'core.app.graphql': jest.fn(),
    'core.app.auth': jest.fn(),
    'core.app.helpers.initQueryContext': jest.fn(),
    'core.app.helpers.validateRequestToken': jest.fn(),
    'core.app.core.subscriptionsHelper': jest.fn(),
    'core.domain.application': jest.fn(),
    'core.domain.permission': jest.fn(),
    'core.domain.record': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.domain.globalSettings': jest.fn(),
    'core.utils.logger': jest.fn(),
    'core.utils': jest.fn()
};

describe('ApplicationApp', () => {
    const utilsMock: Mockify<IUtils> = {
        getFullApplicationEndpoint: jest.fn().mockReturnValueOnce('getFullApplicationEndpoint')
    };

    describe('when token is invalid', () => {
        it('Should authenticate on OIDC Service', async () => {
            const authAppMock: Mockify<IAuthApp> = {
                authenticateWithOIDCService: jest.fn()
            };
            const validateRequestTokenHelper = jest.fn();
            const applicationDomainMock: Mockify<IApplicationDomain> = {
                getApplications: jest.fn().mockResolvedValueOnce({
                    list: [
                        {
                            id: 'applicationId',
                            module: 'applicationModule'
                        }
                    ]
                })
            };

            const applicationApp = createApplicationApp({
                ...depsBase,
                'core.domain.application': applicationDomainMock as IApplicationDomain,
                'core.app.auth': authAppMock as IAuthApp,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
                'core.utils': utilsMock as IUtils,
                config: {auth: {oidc: {enable: true}}, applications: {rootFolder: 'applications/rootFolder'}}
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
                path: '/app/application-test',
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
            const applicationDomainMock: Mockify<IApplicationDomain> = {
                getApplications: jest.fn().mockResolvedValueOnce({
                    list: [
                        {
                            id: 'applicationId',
                            module: 'applicationModule'
                        }
                    ]
                })
            };

            const applicationApp = createApplicationApp({
                ...depsBase,
                'core.domain.application': applicationDomainMock as IApplicationDomain,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
                'core.utils': utilsMock as IUtils,
                config: {auth: {oidc: {enable: false}}, applications: {rootFolder: 'applications/rootFolder'}}
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
                originalUrl: 'test://mock.domain.application/fake/path?query=1&requestId=1',
                params: {endpoint: 'test'},
                path: '/app/application-test',
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
            expect(res.redirect).toHaveBeenCalledWith(
                '/app/login/?dest=test%3A%2F%2Fmock.domain.application%2Ffake%2Fpath%3Fquery%3D1%26requestId%3D1'
            );
        });
    });

    describe('when login is asked', () => {
        it('Should redirect to default app if oidc service enable because we cannot log directly to leav', async () => {
            const globalSettingsMock: Mockify<IGlobalSettingsDomain> = {
                getSettings: jest.fn().mockResolvedValueOnce({
                    name: 'My App',
                    icon: null,
                    defaultApp: 'admin'
                })
            };
            const applicationApp = createApplicationApp({
                ...depsBase,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.domain.globalSettings': globalSettingsMock as IGlobalSettingsDomain,
                config: {applications: {rootFolder: 'applications/rootFolder'}, auth: {oidc: {enable: true}}}
            });

            const expressInstance: any = {
                get: jest.fn()
            };
            applicationApp.registerRoute(expressInstance);
            const getAppsUrl = expressInstance.get.mock.calls[0];
            expect(getAppsUrl[0]).toEqual([`/${APPS_URL_PREFIX}/:endpoint`, `/${APPS_URL_PREFIX}/:endpoint/*`]);
            const authHandler = getAppsUrl[1];

            const req = {
                originalUrl: 'test://mock.domain.application/fake/path?query=1&requestId=1',
                params: {endpoint: 'login'},
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
            expect(res.redirect).toHaveBeenCalledWith('/app/admin/');
        });

        it('Should not verify token and continue handlers, login is public when oidc not enable', async () => {
            const validateRequestTokenHelper = jest.fn();
            const applicationApp = createApplicationApp({
                ...depsBase,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
                'core.utils': utilsMock as IUtils,
                config: {applications: {rootFolder: 'applications/rootFolder'}, auth: {oidc: {enable: false}}}
            });
            const expressInstance: any = {
                get: jest.fn()
            };
            applicationApp.registerRoute(expressInstance);
            const getAppsUrl = expressInstance.get.mock.calls[0];
            expect(getAppsUrl[0]).toEqual([`/${APPS_URL_PREFIX}/:endpoint`, `/${APPS_URL_PREFIX}/:endpoint/*`]);
            const authHandler = getAppsUrl[1];

            const req = {
                originalUrl: 'test://mock.domain.application/fake/path?query=1&requestId=1',
                params: {endpoint: 'login'},
                query: {lang: 'fr'},
                body: {requestId: 'requestId'},
                path: '/app/login'
            };
            const res = {
                redirect: jest.fn()
            };
            const next = jest.fn();
            await authHandler(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(next).toHaveBeenCalledWith();
            expect(res.redirect).not.toHaveBeenCalled();
            expect(validateRequestTokenHelper).not.toHaveBeenCalled();
        });
    });

    describe('when token is valid and app (not login/) is asked', () => {
        it.todo('Should complete req.ctx and continue call');
    });
});
