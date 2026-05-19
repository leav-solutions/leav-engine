import createAuthApp, {type IAuthAppDeps} from '../authApp';
import {type IOIDCClientService} from '../../../infra/oidc/oidcClientService';
import {type Express} from 'express';
import {identity} from 'lodash';
import {convertOIDCIdentifier} from '../../helpers';

vi.mock('jsonwebtoken', () => {
    const verify = vi.fn();
    const sign = vi.fn();
    const decode = vi.fn();
    return {
        default: {verify, sign, decode},
        verify,
        sign,
        decode,
    };
});

import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {type IRecordDomain} from '../../../domain/record/recordDomain';
import {type IValueDomain} from '../../../domain/value/valueDomain';
import {type IConfig} from '../../../_types/config';
import {type DeepPartial} from '../../../_types/utils';
import {type ToAny} from '../../../utils/utils';
import {adminsGroupId} from '../../../_constants/users';
import {mockCtx, mockSystemQueryContext} from '../../../__tests__/mocks/shared';
import {type ISessionRepo} from '../../../infra/session/sessionRepo';
import {type IUserDomain} from '../../../domain/user/userDomain';
import AuthenticationError from '../../../errors/AuthenticationError';

const depsBase: ToAny<IAuthAppDeps> = {
    'core.domain.value': vi.fn(),
    'core.infra.record': vi.fn(),
    'core.domain.record': vi.fn(),
    'core.domain.apiKey': vi.fn(),
    'core.domain.user': vi.fn(),
    'core.infra.session': vi.fn(),
    'core.utils.logger': {
        info: vi.fn(),
        error: vi.fn(),
    },
    'core.infra.oidc.oidcClientService': vi.fn(),
    'core.app.helpers.initQueryContext': vi.fn(() => mockCtx),
    'core.app.helpers.convertOIDCIdentifier': vi.fn(),
    'core.utils.getSystemQueryContext': vi.fn(() => mockSystemQueryContext),
    config: {},
};

describe('authApp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('auth/authenticate', () => {
        it('Should set new access and refresh token', async () => {
            // GIVEN
            const mockRecordDomain: Mockify<IRecordDomain> = {
                find: global.__mockPromise({
                    cursor: {},
                    totalCount: 1,
                    list: [{id: 'id'}],
                }),
            };

            const mockSessionRepo: Mockify<ISessionRepo> = {
                getData: global.__mockPromise(['id']),
                storeData: global.__mockPromise(),
                deleteData: global.__mockPromise(),
            };

            const userDomain: Mockify<IUserDomain> = {
                verifyPassword: global.__mockPromise(true),
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([{payload: {id: 'id'}}]),
            };

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    key: 'key',
                    cookie: {
                        sameSite: 'lax',
                        secure: false,
                    },
                    oidc: {enable: false},
                    algorithm: 'HS256',
                    tokenExpiration: '15m',
                    refreshTokenExpiration: '2h',
                },
                server: {
                    basePath: '/campaigns-manager',
                },
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.session': mockSessionRepo as ISessionRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                'core.domain.user': userDomain as IUserDomain,
                config: mockConfig as IConfig,
            });

            const response = {
                cookie: vi.fn(),
            };

            const expressMock = {
                get: vi.fn(),
                post: vi.fn(),
            } satisfies Mockify<Express>;

            const nextMock = vi.fn();

            const mockedVerify = vi.spyOn(jwt, 'verify');

            mockedVerify.mockImplementation(() => ({
                userId: '1',
                ip: '1',
                agent: 'test',
            }));

            const mockedSign = vi.spyOn(jwt, 'sign');

            mockedSign
                .mockImplementationOnce(() => 'new_mocked_access_token')
                .mockImplementationOnce(() => 'new_mocked_refresh_token');

            vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

            const request = {
                cookies: {
                    refreshToken: 'refreshToken',
                },
                query: {
                    lang: 'lang',
                },
                body: {
                    login: 'admin',
                    password: 'admin',
                },
                headers: {
                    host: 'host',
                    'user-agent': 'test',
                    'x-forwarded-for': '1',
                },
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
                domain: undefined,
                path: '/campaigns-manager',
            });

            expect(response.cookie).toHaveBeenCalledWith('refreshToken', 'new_mocked_refresh_token', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: undefined,
                path: '/campaigns-manager',
            });
        });
    });

    describe('authenticateWithOIDCService', () => {
        it('Should return 401 if oidc not configured', async () => {
            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    oidc: {enable: false},
                },
            };

            const authApp = createAuthApp({
                ...depsBase,
                config: mockConfig as IConfig,
            });
            const request: any = {};
            const response: any = {
                status: vi.fn(() => 'statusReturn'),
            };

            const result = await authApp.authenticateWithOIDCService(request, response);

            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(401);
            expect(result).toBe('statusReturn');
        });

        it('Should redirect to auth url with payload', async () => {
            const oidcClientServiceMock = {
                getAuthorizationUrl: vi.fn(),
                saveOriginalUrl: vi.fn(),
            } satisfies Mockify<IOIDCClientService>;

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    oidc: {enable: true},
                },
                server: {
                    publicUrl: 'test://publicUrl',
                },
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as any,
                'core.app.helpers.convertOIDCIdentifier': convertOIDCIdentifier(),
                config: mockConfig as IConfig,
            });
            oidcClientServiceMock.getAuthorizationUrl.mockResolvedValueOnce('oidcLoginUrl');
            const request: any = {
                originalUrl: 'originalUrl',
                ctx: {
                    queryId: 'queryId',
                },
            };
            const response: any = {
                redirect: vi.fn(() => 'redirectReturn'),
            };

            const result = await authApp.authenticateWithOIDCService(request, response);

            expect(oidcClientServiceMock.saveOriginalUrl).toHaveBeenCalledTimes(1);
            expect(oidcClientServiceMock.saveOriginalUrl).toHaveBeenCalledWith({
                queryId: 'queryId',
                originalUrl: 'originalUrl',
            });
            expect(oidcClientServiceMock.getAuthorizationUrl).toHaveBeenCalledTimes(1);
            expect(oidcClientServiceMock.getAuthorizationUrl).toHaveBeenCalledWith({
                queryId: 'queryId',
                redirectUri: 'test://publicUrl/auth/oidc/verify/cXVlcnlJZA',
            });
            expect(response.redirect).toHaveBeenCalledTimes(1);
            expect(response.redirect).toHaveBeenCalledWith('oidcLoginUrl');
            expect(result).toBe('redirectReturn');
        });
    });

    describe('auth/logout', () => {
        it('Should clear access cookie and return empty json when no oidc service configure', async () => {
            const oidcClientServiceMock: Mockify<IOIDCClientService> = {
                getLogoutUrl: vi.fn(),
            };

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    cookie: {
                        sameSite: 'lax',
                        secure: false,
                    },
                    oidc: {enable: false},
                },
                server: {},
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as IOIDCClientService,
                config: mockConfig as IConfig,
            });
            const expressMock = {
                get: vi.fn(),
                post: vi.fn(),
            } satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const logoutHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/logout')[1];
            const request = {
                headers: {
                    host: 'host',
                },
                cookies: vi.fn().mockReturnValue({access_token: 'access_token'}),
            };
            const response = {
                clearCookie: vi.fn(),
                status: vi.fn().mockReturnValueOnce({
                    json: identity,
                }),
            };

            const result = await logoutHandler(request, response);

            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({});
            expect(oidcClientServiceMock.getLogoutUrl).not.toHaveBeenCalled();
            expect(response.clearCookie).toHaveBeenCalledTimes(2);
            expect(response.clearCookie).toHaveBeenCalledWith('accessToken', {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: undefined,
                path: '/',
            });
            expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: undefined,
                path: '/',
            });
        });

        it('Should clear access cookie and return logoutUrl inside redirectUrl when oidc service configure', async () => {
            const oidcClientServiceMock = {
                getLogoutUrl: vi.fn(),
            } satisfies Mockify<IOIDCClientService>;

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    cookie: {
                        sameSite: 'lax',
                        secure: false,
                    },
                    oidc: {enable: true},
                },
                server: {},
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as any,
                config: mockConfig as IConfig,
            });
            const expressMock = {
                get: vi.fn(),
                post: vi.fn(),
            } satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const logoutHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/logout')[1];
            const request = {
                headers: {
                    host: 'host',
                },
                cookies: vi.fn().mockReturnValue({access_token: 'access_token'}),
            };
            const response = {
                clearCookie: vi.fn(),
                status: vi.fn().mockReturnValueOnce({
                    json: identity,
                }),
            };
            oidcClientServiceMock.getLogoutUrl.mockReturnValueOnce('redirectUrl');

            const result = await logoutHandler(request, response);

            expect(response.status).toHaveBeenCalledTimes(1);
            expect(response.status).toHaveBeenCalledWith(200);
            expect(result).toEqual({
                redirectUrl: 'redirectUrl',
            });
            expect(oidcClientServiceMock.getLogoutUrl).toHaveBeenCalledTimes(1);
            expect(oidcClientServiceMock.getLogoutUrl).toHaveBeenCalledWith({userId: '1'});
            expect(response.clearCookie).toHaveBeenCalledTimes(2);
            expect(response.clearCookie).toHaveBeenCalledWith('accessToken', {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: undefined,
                path: '/',
            });
            expect(response.clearCookie).toHaveBeenCalledWith('refreshToken', {
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: undefined,
                path: '/',
            });
        });
    });

    describe('auth/login-checker', () => {
        it('Should return if no refresh token provided in cookies on oidc service configured', async () => {
            const oidcClientServiceMock: Mockify<IOIDCClientService> = {};

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    cookie: {},
                    oidc: {enable: true},
                },
                server: {},
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as IOIDCClientService,
                config: mockConfig as IConfig,
            });
            const expressMock = {
                get: vi.fn(),
                post: vi.fn(),
            } satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const refreshHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/login-checker')[1];
            const request = {
                cookies: {
                    refreshToken: undefined,
                },
                query: {
                    lang: 'lang',
                },
                body: {},
            };
            const response = {
                status: vi.fn().mockReturnValueOnce({
                    send: identity,
                }),
            };
            const nextMock = vi.fn();

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
                    list: [{id: 'id'}],
                }),
            };

            const mockSessionRepo: Mockify<ISessionRepo> = {
                getData: global.__mockPromise(['id']),
                storeData: global.__mockPromise(),
                deleteData: global.__mockPromise(),
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                getValues: global.__mockPromise([{payload: {id: 'id'}}]),
            };

            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    key: 'key',
                    cookie: {
                        sameSite: 'lax',
                        secure: false,
                    },
                    oidc: {enable: false},
                    algorithm: 'HS256',
                    tokenExpiration: '15m',
                    refreshTokenExpiration: '2h',
                },
                server: {},
            };

            const authApp = createAuthApp({
                ...depsBase,
                'core.infra.session': mockSessionRepo as ISessionRepo,
                'core.domain.record': mockRecordDomain as IRecordDomain,
                'core.domain.value': mockValueDomain as IValueDomain,
                config: mockConfig as IConfig,
            });

            const response = {
                cookie: vi.fn(),
            };

            const expressMock = {
                get: vi.fn(),
                post: vi.fn(),
            } satisfies Mockify<Express>;

            const nextMock = vi.fn();

            const mockedVerify = vi.spyOn(jwt, 'verify');
            mockedVerify.mockImplementation(() => ({
                userId: '1',
                ip: '1',
                agent: 'test',
            }));

            const mockedSign = vi.spyOn(jwt, 'sign');

            mockedSign
                .mockImplementationOnce(() => 'new_mocked_access_token')
                .mockImplementationOnce(() => 'new_mocked_refresh_token');

            const request = {
                cookies: {
                    refreshToken: 'refreshToken',
                },
                query: {
                    lang: 'lang',
                },
                body: {},
                headers: {
                    host: 'host',
                    'user-agent': 'test',
                    'x-forwarded-for': '1',
                },
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
                domain: undefined,
                path: '/',
            });

            expect(response.cookie).toHaveBeenCalledWith('refreshToken', 'new_mocked_refresh_token', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'lax',
                secure: false,
                domain: undefined,
                path: '/',
            });
        });
    });

    describe('auth/oidc/verify/*', () => {
        const postOidcLoginCallback = vi.fn();

        it('Should respond 401 when oidc not enable', async () => {
            const mockConfig: DeepPartial<IConfig> = {
                auth: {
                    oidc: {enable: false},
                },
            };

            const authApp = createAuthApp({
                ...depsBase,
                config: mockConfig as IConfig,
            });
            authApp.extensionPoints.registerAuthPostOidcLoginCallback(postOidcLoginCallback);
            const expressMock = {
                get: vi.fn(),
                post: vi.fn(),
            } satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const verifyHandler = expressMock.get.mock.calls.find(
                args => args[0] === '/auth/oidc/verify/:identifierBase64Url',
            )[1];
            const request = {};
            const response = {
                status: vi.fn(identity),
            };

            const result = await verifyHandler(request, response);

            expect(result).toEqual(401);
            expect(postOidcLoginCallback).not.toHaveBeenCalled();
        });

        it('Should redirect user to oidc login url when user exists and is token is valid', async () => {
            const mockConfig: DeepPartial<IConfig> = {
                defaultUserId: 'system',
                auth: {
                    key: 'key',
                    algorithm: 'HS256',
                    tokenExpiration: '15m',
                    refreshTokenExpiration: '2h',
                    cookie: {sameSite: 'lax', secure: false},
                    oidc: {enable: true, idTokenUserClaim: 'email', clientId: 'client'},
                },
                server: {},
            };

            const mockRecordDomain = {
                find: vi.fn().mockResolvedValue({
                    list: [{id: 'existing-user-id', email: 'user@example.com'}],
                    cursor: {},
                    totalCount: 1,
                }),
                createRecord: vi.fn(),
            } as unknown as Mockify<IRecordDomain>;

            const mockSessionRepo: Mockify<ISessionRepo> = {
                storeData: global.__mockPromise(),
            };

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: vi.fn(),
                getValues: vi.fn().mockResolvedValue([]),
            };

            const mockOidcService: Mockify<IOIDCClientService> = {
                getTokensFromCodes: vi.fn().mockResolvedValue({id_token: 'id-tok', access_token: 'acc-tok'}),
                saveOIDCTokens: vi.fn(),
                getOriginalUrl: vi.fn().mockResolvedValue('redirectUrl'),
            };

            const mockConvert = {decodeIdentifierFromBase64Url: vi.fn().mockReturnValue('queryId')};

            const authApp = createAuthApp({
                ...depsBase,
                'core.domain.record': mockRecordDomain as any,
                'core.domain.value': mockValueDomain as any,
                'core.infra.session': mockSessionRepo as any,
                'core.infra.oidc.oidcClientService': mockOidcService as any,
                'core.app.helpers.convertOIDCIdentifier': mockConvert as any,
                config: mockConfig as IConfig,
            });
            authApp.extensionPoints.registerAuthPostOidcLoginCallback(postOidcLoginCallback);

            const expressMock = {get: vi.fn(), post: vi.fn()} satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const verifyHandler = expressMock.get.mock.calls.find(
                args => args[0] === '/auth/oidc/verify/:identifierBase64Url',
            )[1];

            // Mock jwt.decode calls for id_token then access_token
            const decodedAccessToken = {resource_access: {client: {roles: []}}};
            const decodeSpy = vi.spyOn(jwt, 'decode');
            decodeSpy
                .mockImplementationOnce(() => ({email: 'user@example.com', name: 'john.doe'}) as any)
                .mockImplementationOnce(() => decodedAccessToken as any);

            const request: any = {
                params: {identifierBase64Url: 'whatever'},
                query: {code: 'authCode', lang: 'fr'},
                body: {requestId: '0'},
                headers: {host: 'host', 'user-agent': 'jest'},
            };
            const response: any = {
                cookie: vi.fn(),
                redirect: vi.fn(),
            };

            // Act
            await verifyHandler(request, response, vi.fn());

            // Assert
            expect(mockRecordDomain.createRecord).not.toHaveBeenCalled();
            expect(response.redirect).toHaveBeenCalledWith('redirectUrl');
            expect(postOidcLoginCallback).toHaveBeenCalledWith(
                expect.objectContaining({id: 'existing-user-id', email: 'user@example.com'}),
                decodedAccessToken,
                expect.objectContaining({userId: '2'}),
            );
        });

        it('Should respond 401 when a user not found and oidc enable and auto-provisioning disable', async () => {
            const mockConfig: DeepPartial<IConfig> = {
                defaultUserId: 'system',
                auth: {
                    key: 'key',
                    algorithm: 'HS256',
                    tokenExpiration: '15m',
                    refreshTokenExpiration: '2h',
                    cookie: {sameSite: 'lax', secure: false},
                    oidc: {enable: true, idTokenUserClaim: 'email', clientId: 'client', enableAutoProvisioning: false},
                },
            };

            const mockRecordDomain = {
                find: vi.fn().mockResolvedValue({list: [], cursor: {}, totalCount: 0}),
            } as unknown as Mockify<IRecordDomain>;

            const mockOidcService: Mockify<IOIDCClientService> = {
                getTokensFromCodes: vi.fn().mockResolvedValue({id_token: 'id-tok', access_token: 'acc-tok'}),
                saveOIDCTokens: vi.fn(),
                getOriginalUrl: vi.fn().mockResolvedValue('redirectUrl'),
            };

            const mockConvert = {decodeIdentifierFromBase64Url: vi.fn().mockReturnValue('queryId')};

            const authApp = createAuthApp({
                ...depsBase,
                'core.domain.record': mockRecordDomain as any,
                'core.infra.oidc.oidcClientService': mockOidcService as any,
                'core.app.helpers.convertOIDCIdentifier': mockConvert as any,
                config: mockConfig as IConfig,
            });
            authApp.extensionPoints.registerAuthPostOidcLoginCallback(postOidcLoginCallback);

            // Mock jwt.decode calls for id_token then access_token
            const decodeSpy = vi.spyOn(jwt, 'decode');
            decodeSpy
                .mockImplementationOnce(() => ({email: 'user@example.com', name: 'john.doe'}) as any)
                .mockImplementationOnce(() => ({resource_access: {client: {roles: []}}}) as any);

            const expressMock = {get: vi.fn(), post: vi.fn()} satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const verifyHandler = expressMock.get.mock.calls.find(
                args => args[0] === '/auth/oidc/verify/:identifierBase64Url',
            )[1];

            const request: any = {
                params: {identifierBase64Url: 'whatever'},
                query: {code: 'authCode', lang: 'fr'},
                body: {requestId: '0'},
                headers: {host: 'host', 'user-agent': 'jest'},
            };
            const response: any = {
                cookie: vi.fn(),
                redirect: vi.fn(),
                status: vi.fn(identity),
            };

            // Act
            const resultReqPromise = new Promise((resolve, reject) => verifyHandler(request, response, reject));
            await expect(resultReqPromise).rejects.toEqual(new AuthenticationError('Invalid user'));
            expect(postOidcLoginCallback).not.toHaveBeenCalled();
        });

        it('Should auto provision a user when not found (no admin role)', async () => {
            const mockConfig: DeepPartial<IConfig> = {
                defaultUserId: 'system',
                auth: {
                    key: 'key',
                    algorithm: 'HS256',
                    tokenExpiration: '15m',
                    refreshTokenExpiration: '2h',
                    cookie: {sameSite: 'lax', secure: false},
                    oidc: {enable: true, idTokenUserClaim: 'email', clientId: 'client', enableAutoProvisioning: true},
                },
                server: {},
            };

            const mockRecordDomain = {
                find: vi.fn().mockResolvedValue({list: [], cursor: {}, totalCount: 0}),
                createRecord: vi.fn().mockResolvedValue({record: {id: 'new-user-id', email: 'user@example.com'}}),
            } as unknown as Mockify<IRecordDomain>;

            const mockValueDomain: Mockify<IValueDomain> = {
                saveValue: vi.fn(),
                getValues: vi.fn().mockResolvedValue([]),
            };

            const mockSessionRepo: Mockify<ISessionRepo> = {
                storeData: global.__mockPromise(),
            };

            const mockOidcService: Mockify<IOIDCClientService> = {
                getTokensFromCodes: vi.fn().mockResolvedValue({id_token: 'id-tok', access_token: 'acc-tok'}),
                saveOIDCTokens: vi.fn(),
                getOriginalUrl: vi.fn().mockResolvedValue('redirectUrl'),
            };

            const mockConvert = {decodeIdentifierFromBase64Url: vi.fn().mockReturnValue('queryId')};

            const authApp = createAuthApp({
                ...depsBase,
                'core.domain.record': mockRecordDomain as any,
                'core.domain.value': mockValueDomain as any,
                'core.infra.session': mockSessionRepo as any,
                'core.infra.oidc.oidcClientService': mockOidcService as any,
                'core.app.helpers.convertOIDCIdentifier': mockConvert as any,
                config: mockConfig as IConfig,
            });
            authApp.extensionPoints.registerAuthPostOidcLoginCallback(postOidcLoginCallback);

            const expressMock = {get: vi.fn(), post: vi.fn()} satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const verifyHandler = expressMock.get.mock.calls.find(
                args => args[0] === '/auth/oidc/verify/:identifierBase64Url',
            )[1];

            // Mock jwt.decode calls for id_token then access_token
            const decodedAccessToken = {resource_access: {client: {roles: []}}};
            const decodeSpy = vi.spyOn(jwt, 'decode');
            decodeSpy
                .mockImplementationOnce(() => ({email: 'user@example.com', name: 'john.doe'}) as any)
                .mockImplementationOnce(() => decodedAccessToken as any);

            const request: any = {
                params: {identifierBase64Url: 'whatever'},
                query: {code: 'authCode', lang: 'fr'},
                body: {requestId: '0'},
                headers: {host: 'host', 'user-agent': 'jest'},
            };
            const response: any = {
                cookie: vi.fn(),
                redirect: vi.fn(),
            };

            // Act
            await verifyHandler(request, response, vi.fn());

            // Assert
            expect(mockRecordDomain.createRecord).toHaveBeenCalledTimes(1);
            expect(mockRecordDomain.createRecord).toHaveBeenCalledWith({
                library: 'users',
                values: [
                    {payload: 'user@example.com', attribute: 'email'},
                    {payload: 'john.doe', attribute: 'login'},
                ],
                ctx: expect.any(Object),
            });
            expect((mockValueDomain as any).saveValue).not.toHaveBeenCalled();
            expect(response.redirect).toHaveBeenCalledWith('redirectUrl');
            expect(postOidcLoginCallback).toHaveBeenCalledWith(
                expect.objectContaining({id: 'new-user-id', email: 'user@example.com'}),
                decodedAccessToken,
                expect.objectContaining({userId: '2'}),
            );
        });

        it('Should add user to admin group when token contains admin role', async () => {
            // Arrange
            const mockConfig: DeepPartial<IConfig> = {
                defaultUserId: 'system',
                auth: {
                    key: 'key',
                    algorithm: 'HS256',
                    tokenExpiration: '15m',
                    refreshTokenExpiration: '2h',
                    cookie: {sameSite: 'lax', secure: false},
                    oidc: {enable: true, idTokenUserClaim: 'email', clientId: 'client', enableAutoProvisioning: true},
                },
                server: {},
            };

            const mockRecordDomain = {
                find: vi.fn().mockResolvedValue({list: [], cursor: {}, totalCount: 0}),
                createRecord: vi.fn().mockResolvedValue({record: {id: 'new-user-id', email: 'user@example.com'}}),
            } as unknown as Mockify<IRecordDomain>;

            const mockValueDomain = {
                saveValue: vi.fn(),
                getValues: vi.fn().mockResolvedValue([]),
            } as unknown as Mockify<IValueDomain>;

            const mockSessionRepo: Mockify<ISessionRepo> = {
                storeData: global.__mockPromise(),
            };

            const mockOidcService: Mockify<IOIDCClientService> = {
                getTokensFromCodes: vi.fn().mockResolvedValue({id_token: 'id-tok', access_token: 'acc-tok'}),
                saveOIDCTokens: vi.fn(),
                getOriginalUrl: vi.fn().mockResolvedValue('redirectUrl'),
            };

            const mockConvert = {decodeIdentifierFromBase64Url: vi.fn().mockReturnValue('queryId')};

            const authApp = createAuthApp({
                ...depsBase,
                'core.domain.record': mockRecordDomain as any,
                'core.domain.value': mockValueDomain as any,
                'core.infra.session': mockSessionRepo as any,
                'core.infra.oidc.oidcClientService': mockOidcService as any,
                'core.app.helpers.convertOIDCIdentifier': mockConvert as any,
                config: mockConfig as IConfig,
            });

            const expressMock = {get: vi.fn(), post: vi.fn()} satisfies Mockify<Express>;
            authApp.registerRoute(expressMock as unknown as Express);
            const verifyHandler = expressMock.get.mock.calls.find(
                args => args[0] === '/auth/oidc/verify/:identifierBase64Url',
            )[1];

            // Mock jwt.decode calls for id_token then access_token with admin role
            const decodeSpy = vi.spyOn(jwt, 'decode');
            decodeSpy
                .mockImplementationOnce(() => ({email: 'user@example.com', name: 'john.doe'}) as any)
                .mockImplementationOnce(() => ({resource_access: {client: {roles: ['admin']}}}) as any);

            const request: any = {
                params: {identifierBase64Url: 'whatever'},
                query: {code: 'authCode', lang: 'fr'},
                body: {requestId: '0'},
                headers: {host: 'host', 'user-agent': 'jest'},
            };
            const response: any = {
                cookie: vi.fn(),
                redirect: vi.fn(),
            };

            // Act
            await verifyHandler(request, response, vi.fn());

            // Assert admin group assignment
            expect(mockValueDomain.saveValue).toHaveBeenCalledWith(
                expect.objectContaining({
                    library: 'users',
                    recordId: 'new-user-id',
                    attribute: 'user_groups',
                    value: {payload: adminsGroupId},
                }),
            );
            expect(response.redirect).toHaveBeenCalledWith('redirectUrl');
        });
    });
});
