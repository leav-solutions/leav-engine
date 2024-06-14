// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import createOIDCClientService from '../oidcClientService';
import {OidcClient} from '../oidcClient';
import {ICacheService, ICachesService, IStoreDataParams} from '../../cache/cacheService';
import {BaseClient, TokenSet} from 'openid-client';
import {IConfig} from '../../../_types/config';

describe('OIDCClientService', () => {
    it('Should return oidcClient instance', () => {
        const oidcClientMock = {};
        const cacheServiceMock: Mockify<ICachesService> = {
            getCache: jest.fn(() => ({}))
        };

        const oidcClientService = createOIDCClientService({
            'core.infra.oidcClient': oidcClientMock as OidcClient,
            'core.infra.cache.cacheService': cacheServiceMock as ICachesService
        });

        expect(oidcClientService.oidcClient).toBe(oidcClientMock);
    });

    describe('saveOIDCTokens', () => {
        it('Should store token in cache with expiration as string', async () => {
            const oidcClientMock = {};
            const cacheMock: Mockify<ICacheService> = {
                storeData: jest.fn()
            };
            const cacheServiceMock: Mockify<ICachesService> = {
                getCache: jest.fn(() => cacheMock)
            };
            const config = {
                auth: {
                    refreshTokenExpiration: '1'
                }
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.cache.cacheService': cacheServiceMock as ICachesService,
                config: config as IConfig
            });

            await oidcClientService.saveOIDCTokens({
                userId: 'userId',
                tokens: new TokenSet({
                    access_token: 'access_token',
                    refresh_token: 'refresh_token',
                    expires_at: 42
                })
            });

            expect(cacheMock.storeData).toHaveBeenCalledTimes(1);
            expect(cacheMock.storeData).toHaveBeenCalledWith({
                key: 'oidc_tokens:userId',
                data: '{"access_token":"access_token","refresh_token":"refresh_token","expires_at":42}',
                expiresIn: 60_000 + Number(config.auth.refreshTokenExpiration)
            });
        });
    });

    describe('getTokensFromCodes', () => {
        const getTokensParams = {
            authorizationCode: '123456789AZERTY',
            queryId: 'queryId'
        };
        it('should get a set of tokens with the given authorization code', async () => {
            const oidcClientMock: Mockify<OidcClient> = {
                grant: jest.fn().mockResolvedValueOnce('grant return'),
                metadata: {client_id: 'client_id'}
            };

            const storedCacheKey = JSON.stringify(['codeVerifier', 'redirectUri']);
            const cacheMock: Mockify<ICacheService> = {
                getData: jest.fn(() => [storedCacheKey]),
                deleteData: jest.fn()
            };
            const cacheServiceMock: Mockify<ICachesService> = {
                getCache: jest.fn(() => cacheMock)
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.cache.cacheService': cacheServiceMock as ICachesService
            });
            const expectedResponse = await oidcClientService.getTokensFromCodes(getTokensParams);

            expect(cacheMock.getData).toHaveBeenCalledTimes(1);
            expect(cacheMock.getData).toHaveBeenCalledWith(['oidc_redirect:queryId']);
            expect(cacheMock.deleteData).toHaveBeenCalledTimes(1);
            expect(cacheMock.deleteData).toHaveBeenCalledWith(['oidc_redirect:queryId']);
            expect(oidcClientMock.grant).toHaveBeenCalledTimes(1);
            expect(oidcClientMock.grant).toHaveBeenCalledWith({
                code: '123456789AZERTY',
                code_verifier: 'codeVerifier',
                grant_type: 'authorization_code',
                redirect_uri: 'redirectUri'
            });
            expect(expectedResponse).toEqual('grant return');
        });

        it('should throw an error if the cache is not found (possible Redis error)', async () => {
            const oidcClientMock = {};
            const cacheMock: Mockify<ICacheService> = {
                getData: jest.fn(() => undefined)
            };
            const cacheServiceMock: Mockify<ICachesService> = {
                getCache: jest.fn(() => cacheMock)
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.cache.cacheService': cacheServiceMock as ICachesService
            });

            await expect(async () => oidcClientService.getTokensFromCodes(getTokensParams)).rejects.toThrow(
                'Unauthorized'
            );
            expect(cacheMock.getData).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if user didn't complete the login in time (code verifier is expired)", async () => {
            const oidcClientMock = {};
            const cacheMock: Mockify<ICacheService> = {
                getData: jest.fn(() => [null])
            };
            const cacheServiceMock: Mockify<ICachesService> = {
                getCache: jest.fn(() => cacheMock)
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.cache.cacheService': cacheServiceMock as ICachesService
            });

            await expect(async () => oidcClientService.getTokensFromCodes(getTokensParams)).rejects.toThrow(
                'Unauthorized'
            );
            expect(cacheMock.getData).toHaveBeenCalledTimes(1);
        });
    });

    describe('checkTokensValidity', () => {
        const userId = 'userId';
        const storedCacheKey = JSON.stringify(['codeVerifier', 'redirectUri']);

        it('should do nothing if access token is valid', async () => {
            const oidcClientMock: Mockify<BaseClient> = {refresh: jest.fn()};
            const cacheMock: Mockify<ICacheService> = {
                getData: jest.fn(() => [storedCacheKey])
            };
            const cacheServiceMock: Mockify<ICachesService> = {
                getCache: jest.fn(() => cacheMock)
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.cache.cacheService': cacheServiceMock as ICachesService
            });

            await oidcClientService.checkTokensValidity({userId});

            expect(cacheMock.getData).toHaveBeenCalledTimes(1);
            expect(cacheMock.getData).toHaveBeenCalledWith(['oidc_tokens:userId']);
            expect(oidcClientMock.refresh).not.toHaveBeenCalled();
        });

        it('should throw an error if the cache is not found (possible Redis error)', async () => {
            const oidcClientMock = {};
            const cacheMock: Mockify<ICacheService> = {
                getData: jest.fn(() => undefined)
            };
            const cacheServiceMock: Mockify<ICachesService> = {
                getCache: jest.fn(() => cacheMock)
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.cache.cacheService': cacheServiceMock as ICachesService
            });
            await expect(async () => oidcClientService.checkTokensValidity({userId})).rejects.toThrow('Unauthorized');
            expect(cacheMock.getData).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if refresh token is expired in cache', async () => {
            const oidcClientMock = {};
            const cacheMock: Mockify<ICacheService> = {
                getData: jest.fn(() => [null])
            };
            const cacheServiceMock: Mockify<ICachesService> = {
                getCache: jest.fn(() => cacheMock)
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.cache.cacheService': cacheServiceMock as ICachesService
            });
            await expect(async () => oidcClientService.checkTokensValidity({userId})).rejects.toThrow('Unauthorized');
            expect(cacheMock.getData).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAuthorizationUrl', () => {
        const queryId = 'queryId';
        const redirectUri = 'redirectUri';

        it('should return an authorization url with the given redirect uri', async () => {
            const oidcClientMock: Mockify<BaseClient> = {
                authorizationUrl: jest.fn().mockResolvedValueOnce('authorizationUrl return')
            };
            const cacheMock: Mockify<ICacheService> = {
                storeData: jest.fn()
            };
            const cacheServiceMock: Mockify<ICachesService> = {
                getCache: jest.fn(() => cacheMock)
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.cache.cacheService': cacheServiceMock as ICachesService
            });

            const expectedResponse = await oidcClientService.getAuthorizationUrl({redirectUri, queryId});

            expect(cacheMock.storeData).toHaveBeenCalledTimes(1);
            expect(cacheMock.storeData).toHaveBeenCalledWith(
                expect.objectContaining({expiresIn: 600000, key: 'oidc_redirect:queryId'})
            );
            expect(oidcClientMock.authorizationUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    redirect_uri: redirectUri,
                    code_challenge_method: 'S256',
                    response_type: 'code',
                    scope: 'openid'
                })
            );
            expect(expectedResponse).toEqual('authorizationUrl return');
        });
    });
});
