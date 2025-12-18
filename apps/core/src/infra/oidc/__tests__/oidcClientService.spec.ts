// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import createOIDCClientService from '../oidcClientService';
import {type OidcClient} from '../oidcClient';
import {type BaseClient, TokenSet} from 'openid-client';
import {type IConfig} from '../../../_types/config';
import {type ISessionRepo} from '../../session/sessionRepo';

describe('OIDCClientService', () => {
    const defaultConfig = {
        auth: {
            refreshTokenExpiration: '5',
            oidc: {
                verificationKeysExpiration: '10',
            },
        },
    } as IConfig;

    it('Should return oidcClient instance', () => {
        const oidcClientMock = {};

        const oidcClientService = createOIDCClientService({
            'core.infra.oidcClient': oidcClientMock as OidcClient,
            config: defaultConfig,
        });

        expect(oidcClientService.oidcClient).toBe(oidcClientMock);
    });

    describe('saveOIDCTokens', () => {
        it('Should store token in cache with expiration as string', async () => {
            const oidcClientMock = {};
            const sessionRepoMock: Mockify<ISessionRepo> = {
                storeData: jest.fn(),
            };

            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: defaultConfig,
            });

            await oidcClientService.saveOIDCTokens({
                userId: 'userId',
                tokens: new TokenSet({
                    access_token: 'access_token',
                    refresh_token: 'refresh_token',
                    expires_at: 42,
                }),
            });

            expect(sessionRepoMock.storeData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.storeData).toHaveBeenCalledWith({
                key: 'oidc_tokens:userId',
                data: '{"access_token":"access_token","refresh_token":"refresh_token","expires_at":42}',
                expiresIn: 60_000 + Number(defaultConfig.auth.refreshTokenExpiration),
            });
        });
    });

    describe('getTokensFromCodes', () => {
        const getTokensParams = {
            authorizationCode: '123456789AZERTY',
            queryId: 'queryId',
        };
        it('should get a set of tokens with the given authorization code', async () => {
            const oidcClientMock: Mockify<OidcClient> = {
                grant: jest.fn().mockResolvedValueOnce('grant return'),
                metadata: {client_id: 'client_id'},
            };

            const storedCacheKey = JSON.stringify(['codeVerifier', 'redirectUri']);
            const sessionRepoMock: Mockify<ISessionRepo> = {
                getData: jest.fn().mockResolvedValue([storedCacheKey]),
                deleteData: jest.fn().mockResolvedValue(null),
            };

            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: defaultConfig,
            });
            const expectedResponse = await oidcClientService.getTokensFromCodes(getTokensParams);

            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.getData).toHaveBeenCalledWith(['oidc_verificationKeys:queryId']);
            expect(sessionRepoMock.deleteData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.deleteData).toHaveBeenCalledWith(['oidc_verificationKeys:queryId']);
            expect(oidcClientMock.grant).toHaveBeenCalledTimes(1);
            expect(oidcClientMock.grant).toHaveBeenCalledWith({
                code: '123456789AZERTY',
                code_verifier: 'codeVerifier',
                grant_type: 'authorization_code',
                redirect_uri: 'redirectUri',
            });
            expect(expectedResponse).toEqual('grant return');
        });

        it('should throw an error if the cache is not found (possible Redis error)', async () => {
            const oidcClientMock = {};
            const sessionRepoMock: Mockify<ISessionRepo> = {
                getData: jest.fn().mockResolvedValue(undefined),
            };
            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: defaultConfig,
            });

            await expect(async () => oidcClientService.getTokensFromCodes(getTokensParams)).rejects.toThrow(
                'Unauthorized',
            );
            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if user didn't complete the login in time (code verifier is expired)", async () => {
            const oidcClientMock = {};
            const sessionRepoMock: Mockify<ISessionRepo> = {
                getData: jest.fn().mockResolvedValue([null]),
            };

            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: defaultConfig,
            });

            await expect(async () => oidcClientService.getTokensFromCodes(getTokensParams)).rejects.toThrow(
                'Unauthorized',
            );
            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
        });
    });

    describe('checkTokensValidity', () => {
        const userId = 'userId';
        const storedCacheKey = JSON.stringify(['codeVerifier', 'redirectUri']);

        it('should do nothing if access token is valid', async () => {
            const oidcClientMock: Mockify<BaseClient> = {refresh: jest.fn()};
            const sessionRepoMock: Mockify<ISessionRepo> = {
                getData: jest.fn(async () => [storedCacheKey]),
            };

            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: defaultConfig,
            });

            await oidcClientService.checkTokensValidity({userId});

            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.getData).toHaveBeenCalledWith(['oidc_tokens:userId']);
            expect(oidcClientMock.refresh).not.toHaveBeenCalled();
        });

        it('should throw an error if the cache is not found (possible Redis error)', async () => {
            const oidcClientMock = {};
            const sessionRepoMock: Mockify<ISessionRepo> = {
                getData: jest.fn().mockResolvedValue(null),
            };

            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: defaultConfig,
            });
            await expect(async () => oidcClientService.checkTokensValidity({userId})).rejects.toThrow(
                'OIDC session expired',
            );
            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if refresh token is expired in cache', async () => {
            const oidcClientMock = {};
            const sessionRepoMock: Mockify<ISessionRepo> = {
                getData: jest.fn().mockResolvedValue([null]),
            };

            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: defaultConfig,
            });
            await expect(async () => oidcClientService.checkTokensValidity({userId})).rejects.toThrow(
                'OIDC session expired',
            );
            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAuthorizationUrl', () => {
        const queryId = 'queryId';
        const redirectUri = 'redirectUri';

        it('should return an authorization url with the given redirect uri', async () => {
            const oidcClientMock: Mockify<BaseClient> = {
                authorizationUrl: jest.fn().mockResolvedValueOnce('authorizationUrl return'),
            };
            const sessionRepoMock: Mockify<ISessionRepo> = {
                storeData: jest.fn().mockResolvedValue(null),
            };

            const oidcClientService = createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock as OidcClient,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: defaultConfig,
            });

            const expectedResponse = await oidcClientService.getAuthorizationUrl({redirectUri, queryId});

            expect(sessionRepoMock.storeData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.storeData).toHaveBeenCalledWith(
                expect.objectContaining({
                    expiresIn: Number(defaultConfig.auth.oidc.verificationKeysExpiration),
                    key: 'oidc_verificationKeys:queryId',
                }),
            );
            expect(oidcClientMock.authorizationUrl).toHaveBeenCalledWith(
                expect.objectContaining({
                    redirect_uri: redirectUri,
                    code_challenge_method: 'S256',
                    response_type: 'code',
                    scope: 'openid',
                }),
            );
            expect(expectedResponse).toEqual('authorizationUrl return');
        });
    });

    describe('getLogoutUrl', () => {
        // TODO:
    });

    describe('saveOriginalUrl', () => {
        // TODO:
    });

    describe('getOriginalUrl', () => {
        // TODO:
    });
});
