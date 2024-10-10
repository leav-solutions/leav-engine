// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import createAuthApp, {IAuthAppDeps} from '../authApp';
import {IOIDCClientService} from '../../../infra/oidc/oidcClientService';
import {Express} from 'express';
import {identity} from 'lodash';
import {convertOIDCIdentifier} from '../../helpers';
import initQueryContext from '../../helpers/initQueryContext';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {IRecordDomain} from '../../../domain/record/recordDomain';
import {ICacheService, ICachesService} from '../../../infra/cache/cacheService';
import {IValueDomain} from '../../../domain/value/valueDomain';
import {IConfig} from '../../../_types/config';
import {DeepPartial} from '../../../_types/utils';
import {Mockify} from '@leav/utils';
import {ToAny} from '../../../utils/utils';

const depsBase: ToAny<IAuthAppDeps> = {
    'core.domain.value': jest.fn(),
    'core.domain.record': jest.fn(),
    'core.domain.apiKey': jest.fn(),
    'core.domain.user': jest.fn(),
    'core.infra.cache.cacheService': jest.fn(),
    'core.utils.logger': jest.fn(),
    'core.infra.oidc.oidcClientService': jest.fn(),
    'core.app.helpers.initQueryContext': jest.fn(),
    'core.app.helpers.convertOIDCIdentifier': jest.fn(),
    config: {}
};

describe('authApp', () => {
    describe('auth/authenticate', () => {
        it('Should set new access and refresh token', async () => {
            // GIVEN
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    cursor: {},
                    totalCount: 1,
                    list: [{id: 'id'}]
                })
            };

            const mockCacheService: Mockify<ICacheService> = {
                getData: global.__mockPromise(['id']),
                storeData: global.__mockPromise(),
                deleteData: global.__mockPromise()
            };

            const mockCachesService: Mockify<ICachesService> = {
                getCache: jest.fn().mockReturnValue(mockCacheService)
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromiseMultiple([[{raw_payload: 'admin'}], [{payload: {id: 'id'}}]])
            };

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    key: 'key',
                    cookie: {
                        sameSite: 'lax',
                        secure: false
                    },
                    oidc: {enable: false},
                    algorithm: 'HS256',
                    tokenExpiration: '15m',
                    refreshTokenExpiration: '2h'
                }
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                config: mockConfig as IConfig
            });

            const response = {
                cookie: jest.fn()
            };

            const expressMock = {
                get: jest.fn(),
                post: jest.fn()
            } satisfies Mockify<Express>;

            const nextMock = jest.fn();

            const mockedVerify = jest.spyOn(jwt, 'verify');

            mockedVerify.mockImplementation(() => ({
                userId: '1',
                ip: '1',
                agent: 'test'
            }));

            const mockedSign = jest.spyOn(jwt, 'sign') as jest.MockedFunction<typeof jwt.sign>;

            mockedSign
                .mockImplementationOnce(() => 'new_mocked_access_token')
                .mockImplementationOnce(() => 'new_mocked_refresh_token');

            jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            const request = {
                cookies: {
                    refreshToken: 'refreshToken'
                },
                query: {
                    lang: 'lang'
                },
                body: {
                    login: 'admin',
                    password: 'admin'
                },
                headers: {
                    host: 'host',
                    'user-agent': 'test',
                    'x-forwarded-for': '1'
                }
            };

            authApp.registerRoute(expressMock as unknown as Express);

            const refreshHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/authenticate')[1];

            // WHEN
            await refreshHandler(request, response, nextMock);

            // THEN
            expect(response.cookie).toHaveBeenCalledWith('accessToken', 'new_mocked_access_token', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });

            expect(response.cookie).toHaveBeenCalledWith('refreshToken', 'new_mocked_refresh_token', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });
        });
    });

    describe('authenticateWithOIDCService', () => {
        it('Should return 401 if oidc not configured', async () => {
            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    oidc: {enable: false}
                }
            };

            const authApp = createAuthApp({
                ...depsBase,
                config: mockConfig as IConfig
            });
            const request: any = {};
            const response: any = {
                status: jest.fn(() => 'statusReturn')
            };

            const result = await authApp.authenticateWithOIDCService(request, response);

            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(401);
            expect(result).toBe('statusReturn');
        });

        it('Should redirect to auth url with payload', async () => {
            const oidcClientServiceMock = {
                getAuthorizationUrl: jest.fn(),
                saveOriginalUrl: jest.fn()
            } satisfies Mockify<IOIDCClientService>;

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    oidc: {enable: true}
                },
                server: {
                    publicUrl: 'test://publicUrl'
                }
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as any,
                'core.app.helpers.convertOIDCIdentifier': convertOIDCIdentifier(),
                config: mockConfig as IConfig
            });
            oidcClientServiceMock.getAuthorizationUrl.mockResolvedValueOnce('oidcLoginUrl');
            const request: any = {
                originalUrl: 'originalUrl',
                ctx: {
                    queryId: 'queryId'
                }
            };
            const response: any = {
                redirect: jest.fn(() => 'redirectReturn')
            };

            const result = await authApp.authenticateWithOIDCService(request, response);

            expect(oidcClientServiceMock.saveOriginalUrl).toHaveBeenCalledTimes(1);
            expect(oidcClientServiceMock.saveOriginalUrl).toHaveBeenCalledWith({
                queryId: 'queryId',
                originalUrl: 'originalUrl'
            });
            expect(oidcClientServiceMock.getAuthorizationUrl).toHaveBeenCalledTimes(1);
            expect(oidcClientServiceMock.getAuthorizationUrl).toHaveBeenCalledWith({
                queryId: 'queryId',
                redirectUri: 'test://publicUrl/auth/oidc/verify/cXVlcnlJZA'
            });
            expect(response.redirect).toHaveBeenCalledTimes(1);
            expect(response.redirect).toHaveBeenCalledWith('oidcLoginUrl');
            expect(result).toBe('redirectReturn');
        });
    });

    describe('auth/logout', () => {
        it('Should clear access cookie and return empty json when no oidc service configure', async () => {
            const oidcClientServiceMock: Mockify<IOIDCClientService> = {
                getLogoutUrl: jest.fn()
            };

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    cookie: {
                        sameSite: 'lax',
                        secure: false
                    },
                    oidc: {enable: false}
                }
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as IOIDCClientService,
                config: mockConfig as IConfig
            });
            const expressMock = {
                get: jest.fn(),
                post: jest.fn()
            } satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const logoutHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/logout')[1];
            const request = {
                headers: {
                    host: 'host'
                }
            };
            const response = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnValueOnce({
                    json: identity
                })
            };

            const result = await logoutHandler(request, response);

            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({});
            expect(oidcClientServiceMock.getLogoutUrl).not.toHaveBeenCalled();
            expect(response.cookie).toHaveBeenCalledTimes(2);
            expect(response.cookie).toHaveBeenCalledWith('accessToken', '', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });
            expect(response.cookie).toHaveBeenCalledWith('refreshToken', '', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });
        });

        it('Should clear access cookie and return logoutUrl inside redirectUrl when oidc service configure', async () => {
            const oidcClientServiceMock = {
                getLogoutUrl: jest.fn()
            } satisfies Mockify<IOIDCClientService>;

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    cookie: {
                        sameSite: 'lax',
                        secure: false
                    },
                    oidc: {enable: true}
                }
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as any,
                config: mockConfig as IConfig
            });
            const expressMock = {
                get: jest.fn(),
                post: jest.fn()
            } satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const logoutHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/logout')[1];
            const request = {
                headers: {
                    host: 'host'
                }
            };
            const response = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnValueOnce({
                    json: identity
                })
            };
            oidcClientServiceMock.getLogoutUrl.mockReturnValueOnce('redirectUrl');

            const result = await logoutHandler(request, response);

            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                redirectUrl: 'redirectUrl'
            });
            expect(oidcClientServiceMock.getLogoutUrl).toHaveBeenCalledTimes(1);
            expect(oidcClientServiceMock.getLogoutUrl).toHaveBeenCalledWith();
            expect(response.cookie).toHaveBeenCalledTimes(2);
            expect(response.cookie).toHaveBeenCalledWith('accessToken', '', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });
            expect(response.cookie).toHaveBeenCalledWith('refreshToken', '', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });
        });
    });

    describe('auth/login-checker', () => {
        it('Should return if no refresh token provided in cookies on oidc service configured', async () => {
            const oidcClientServiceMock: Mockify<IOIDCClientService> = {};

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    cookie: {},
                    oidc: {enable: true}
                }
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as IOIDCClientService,
                config: mockConfig as IConfig
            });
            const expressMock = {
                get: jest.fn(),
                post: jest.fn()
            } satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const refreshHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/login-checker')[1];
            const request = {
                cookies: {
                    refreshToken: undefined
                },
                query: {
                    lang: 'lang'
                },
                body: {}
            };
            const response = {
                status: jest.fn().mockReturnValueOnce({
                    send: identity
                })
            };
            const nextMock = jest.fn();

            const result = await refreshHandler(request, response, nextMock);

            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(400);
            expect(nextMock).not.toHaveBeenCalled();
            expect(result).toBe('Missing refresh token');
        });

        it('Should set new access and refresh token', async () => {
            // GIVEN
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    cursor: {},
                    totalCount: 1,
                    list: [{id: 'id'}]
                })
            };

            const mockCacheService: Mockify<ICacheService> = {
                getData: global.__mockPromise(['id']),
                storeData: global.__mockPromise(),
                deleteData: global.__mockPromise()
            };

            const mockCachesService: Mockify<ICachesService> = {
                getCache: jest.fn().mockReturnValue(mockCacheService)
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([{payload: {id: 'id'}}])
            };

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    key: 'key',
                    cookie: {
                        sameSite: 'lax',
                        secure: false
                    },
                    oidc: {enable: false},
                    algorithm: 'HS256',
                    tokenExpiration: '15m',
                    refreshTokenExpiration: '2h'
                }
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.app.helpers.initQueryContext': initQueryContext({config: mockConfig as IConfig}),
                'core.infra.cache.cacheService': mockCachesService as ICachesService,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                config: mockConfig as IConfig
            });

            const response = {
                cookie: jest.fn()
            };

            const expressMock = {
                get: jest.fn(),
                post: jest.fn()
            } satisfies Mockify<Express>;

            const nextMock = jest.fn();

            const mockedVerify = jest.spyOn(jwt, 'verify');
            mockedVerify.mockImplementation(() => ({
                userId: '1',
                ip: '1',
                agent: 'test'
            }));

            const mockedSign = jest.spyOn(jwt, 'sign') as jest.MockedFunction<typeof jwt.sign>;

            mockedSign
                .mockImplementationOnce(() => 'new_mocked_access_token')
                .mockImplementationOnce(() => 'new_mocked_refresh_token');

            const request = {
                cookies: {
                    refreshToken: 'refreshToken'
                },
                query: {
                    lang: 'lang'
                },
                body: {},
                headers: {
                    host: 'host',
                    'user-agent': 'test',
                    'x-forwarded-for': '1'
                }
            };

            authApp.registerRoute(expressMock as unknown as Express);

            const refreshHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/login-checker')[1];

            // WHEN
            await refreshHandler(request, response, nextMock);

            // THEN
            expect(response.cookie).toHaveBeenCalledWith('accessToken', 'new_mocked_access_token', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });

            expect(response.cookie).toHaveBeenCalledWith('refreshToken', 'new_mocked_refresh_token', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: 'host'
            });
        });
    });

    describe('auth/oidc/verify/*', () => {
        it('Should respond 401 when oidc not enable', async () => {
            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    oidc: {enable: false}
                }
            };

            const authApp = createAuthApp({
                ...depsBase,
                config: mockConfig as IConfig
            });
            const expressMock = {
                get: jest.fn(),
                post: jest.fn()
            } satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const verifyHandler = expressMock.get.mock.calls.find(
                args => args[0] === '/auth/oidc/verify/:identifierBase64Url'
            )[1];
            const request = {};
            const response = {
                status: jest.fn(identity)
            };

            const result = await verifyHandler(request, response);

            expect(result).toEqual(401);
        });
    });
});
