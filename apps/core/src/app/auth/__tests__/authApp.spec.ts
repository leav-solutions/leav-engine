// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import createAuthApp from '../authApp';
import {IOIDCClientService} from '../../../infra/oidc/oidcClientService';
import {Express} from 'express';
import {identity} from 'lodash';
import {convertOIDCIdentifier} from '../../helpers';
import initQueryContext from '../../helpers/initQueryContext';

describe('authApp', () => {
    describe('authenticateWithOIDCService', () => {
        it('Should return 401 if oidc not configured', async () => {
            const authApp = createAuthApp({
                config: {
                    auth: {
                        oidc: {enable: false}
                    }
                } as any
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
            const oidcClientServiceMock: Mockify<IOIDCClientService> = {
                getAuthorizationUrl: jest.fn(),
                saveOriginalUrl: jest.fn()
            };
            const authApp = createAuthApp({
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as IOIDCClientService,
                'core.app.helpers.convertOIDCIdentifier': convertOIDCIdentifier(),
                config: {
                    auth: {
                        oidc: {enable: true}
                    },
                    server: {
                        publicUrl: 'test://publicUrl'
                    }
                } as any
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
            const authApp = createAuthApp({
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as IOIDCClientService,
                config: {
                    auth: {
                        cookie: {
                            sameSite: 'sameSite',
                            secure: 'secure'
                        },
                        oidc: {enable: false}
                    }
                } as any
            });
            const expressMock: Mockify<Express> = {
                get: jest.fn(),
                post: jest.fn()
            };
            authApp.registerRoute((expressMock as unknown) as Express);
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
            expect(response.cookie).toHaveBeenCalledTimes(1);
            expect(response.cookie).toHaveBeenCalledWith('accessToken', '', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'sameSite',
                secure: 'secure',
                domain: 'host'
            });
        });

        it('Should clear access cookie and return logoutUrl inside redirectUrl when oidc service configure', async () => {
            const oidcClientServiceMock: Mockify<IOIDCClientService> = {
                getLogoutUrl: jest.fn()
            };
            const authApp = createAuthApp({
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as IOIDCClientService,
                config: {
                    auth: {
                        cookie: {
                            sameSite: 'sameSite',
                            secure: 'secure'
                        },
                        oidc: {enable: true}
                    }
                } as any
            });
            const expressMock: Mockify<Express> = {
                get: jest.fn(),
                post: jest.fn()
            };
            authApp.registerRoute((expressMock as unknown) as Express);
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
            expect(response.cookie).toHaveBeenCalledTimes(1);
            expect(response.cookie).toHaveBeenCalledWith('accessToken', '', {
                expires: expect.any(Date),
                httpOnly: true,
                sameSite: 'sameSite',
                secure: 'secure',
                domain: 'host'
            });
        });
    });

    describe('auth/refresh', () => {
        it('Should return if no refresh token provided in cookies on oidc service configured', async () => {
            const oidcClientServiceMock: Mockify<IOIDCClientService> = {};
            const authApp = createAuthApp({
                'core.app.helpers.initQueryContext': initQueryContext({}),
                'core.infra.oidc.oidcClientService': oidcClientServiceMock as IOIDCClientService,
                config: {
                    auth: {
                        cookie: {},
                        oidc: {enable: true}
                    }
                } as any
            });
            const expressMock: Mockify<Express> = {
                get: jest.fn(),
                post: jest.fn()
            };
            authApp.registerRoute((expressMock as unknown) as Express);
            const refreshHandler = expressMock.post.mock.calls.find(args => args[0] === '/auth/refresh')[1];
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
    });

    describe('auth/oidc/verify/*', () => {
        it('Should respond 401 when oidc not enable', async () => {
            const authApp = createAuthApp({
                config: {
                    auth: {
                        oidc: {enable: false}
                    }
                } as any
            });
            const expressMock: Mockify<Express> = {
                get: jest.fn(),
                post: jest.fn()
            };
            authApp.registerRoute((expressMock as unknown) as Express);
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
