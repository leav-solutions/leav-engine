// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import createApplicationApp, {type IApplicationAppDeps} from '../applicationApp';
import {APPS_URL_PREFIX} from '../../../_types/application';
import initQueryContext from '../../helpers/initQueryContext';
import {type ValidateRequestTokenFunc} from '../../helpers/validateRequestToken';
import {type IAuthApp} from '../../auth/authApp';
import {type IApplicationDomain} from '../../../domain/application/applicationDomain';
import {type IUtils, type ToAny} from '../../../utils/utils';
import {type IGlobalSettingsDomain} from '../../../domain/globalSettings/globalSettingsDomain';
import {type IConfig} from '../../../_types/config';

const depsBase: ToAny<IApplicationAppDeps> = {
    config: {},
    'core.app.graphql': vi.fn(),
    'core.app.auth': vi.fn(),
    'core.app.helpers.initQueryContext': vi.fn(),
    'core.app.helpers.validateRequestToken': vi.fn(),
    'core.app.core.subscriptionsHelper': vi.fn(),
    'core.domain.application': vi.fn(),
    'core.domain.permission': vi.fn(),
    'core.domain.record': vi.fn(),
    'core.domain.eventsManager': vi.fn(),
    'core.domain.globalSettings': vi.fn(),
    'core.domain.application.appStudio': vi.fn(),
    'core.utils.logger': vi.fn(),
    'core.utils': vi.fn(),
};

describe('ApplicationApp', () => {
    const utilsMock: Mockify<IUtils> = {
        getFullApplicationEndpoint: vi.fn().mockReturnValueOnce('getFullApplicationEndpoint'),
    };

    describe('when token is invalid', () => {
        it('Should authenticate on OIDC Service', async () => {
            const authAppMock: Mockify<IAuthApp> = {
                authenticateWithOIDCService: vi.fn(),
            };
            const validateRequestTokenHelper = vi.fn();
            const applicationDomainMock: Mockify<IApplicationDomain> = {
                getApplications: vi.fn().mockResolvedValueOnce({
                    list: [
                        {
                            id: 'applicationId',
                            module: 'applicationModule',
                        },
                    ],
                }),
            };

            const applicationApp = createApplicationApp({
                ...depsBase,
                'core.domain.application': applicationDomainMock as IApplicationDomain,
                'core.app.auth': authAppMock as IAuthApp,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
                'core.utils': utilsMock as IUtils,
                config: {
                    auth: {oidc: {enable: true}},
                    applications: {rootFolder: 'applications/rootFolder'},
                    server: {
                        basePath: '',
                    },
                } as IConfig,
            });
            validateRequestTokenHelper.mockRejectedValueOnce('unused error');

            const expressInstance: any = {
                get: vi.fn(),
            };
            applicationApp.registerRoute(expressInstance);
            const getAppsUrl = expressInstance.get.mock.calls[0];
            expect(getAppsUrl[0]).toEqual([`/${APPS_URL_PREFIX}/:endpoint`, `/${APPS_URL_PREFIX}/:endpoint/*`]);
            const authHandler = getAppsUrl[1];

            const req = {
                params: {endpoint: 'test'},
                path: '/app/application-test',
                query: {lang: 'fr'},
                body: {requestId: 'requestId'},
            };
            const res = {
                redirect: vi.fn(),
            };
            const next = vi.fn();
            await authHandler(req, res, next);

            expect(res.redirect).not.toHaveBeenCalled();
            expect(next).not.toHaveBeenCalled();
            expect(authAppMock.authenticateWithOIDCService).toHaveBeenCalledTimes(1);
            expect(authAppMock.authenticateWithOIDCService).toHaveBeenCalledWith(req, res);
        });

        it('Should redirect to login app with eventual server base path', async () => {
            const validateRequestTokenHelper = vi.fn();
            const applicationDomainMock: Mockify<IApplicationDomain> = {
                getApplications: vi.fn().mockResolvedValueOnce({
                    list: [
                        {
                            id: 'applicationId',
                            module: 'applicationModule',
                        },
                    ],
                }),
            };

            const applicationApp = createApplicationApp({
                ...depsBase,
                'core.domain.application': applicationDomainMock as IApplicationDomain,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
                'core.utils': utilsMock as IUtils,
                config: {
                    auth: {oidc: {enable: false}},
                    applications: {rootFolder: 'applications/rootFolder'},
                    server: {
                        basePath: '/server-base',
                    },
                } as IConfig,
            });
            validateRequestTokenHelper.mockRejectedValueOnce('unused error');

            const expressInstance: any = {
                get: vi.fn(),
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
                body: {requestId: 'requestId'},
            };
            const res = {
                redirect: vi.fn(),
            };
            const next = vi.fn();
            await authHandler(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith(
                '/server-base/app/login/?dest=test%3A%2F%2Fmock.domain.application%2Ffake%2Fpath%3Fquery%3D1%26requestId%3D1',
            );
        });
    });

    describe('when login is asked', () => {
        it('Should redirect to default app if oidc service enable because we cannot log directly to leav', async () => {
            const globalSettingsMock: Mockify<IGlobalSettingsDomain> = {
                getSettings: vi.fn().mockResolvedValueOnce({
                    name: 'My App',
                    icon: null,
                    defaultApp: 'admin',
                }),
            };
            const applicationApp = createApplicationApp({
                ...depsBase,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.domain.globalSettings': globalSettingsMock as IGlobalSettingsDomain,
                config: {
                    applications: {rootFolder: 'applications/rootFolder'},
                    auth: {oidc: {enable: true}},
                    server: {
                        basePath: '',
                    },
                } as IConfig,
            });

            const expressInstance: any = {
                get: vi.fn(),
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
            };
            const res = {
                redirect: vi.fn(),
            };
            const next = vi.fn();
            await authHandler(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith('/app/admin/');
        });

        it('Should not verify token and continue handlers, login is public when oidc not enable', async () => {
            const validateRequestTokenHelper = vi.fn();
            const applicationApp = createApplicationApp({
                ...depsBase,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.app.helpers.validateRequestToken': validateRequestTokenHelper as ValidateRequestTokenFunc,
                'core.utils': utilsMock as IUtils,
                config: {
                    applications: {rootFolder: 'applications/rootFolder'},
                    auth: {oidc: {enable: false}},
                    server: {
                        basePath: '',
                    },
                } as IConfig,
            });
            const expressInstance: any = {
                get: vi.fn(),
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
                path: '/app/login',
            };
            const res = {
                redirect: vi.fn(),
            };
            const next = vi.fn();
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
