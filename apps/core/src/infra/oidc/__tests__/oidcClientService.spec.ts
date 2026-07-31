import createOIDCClientService, {type IOIDCClientService} from '../oidcClientService';
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
    } as unknown as IConfig;

    let oidcClientMock: Mockify<OidcClient & BaseClient>;
    let sessionRepoMock: Mockify<ISessionRepo>;
    let oidcClientService: IOIDCClientService;

    beforeEach(() => {
        oidcClientMock = {
            grant: vi.fn(),
            refresh: vi.fn(),
            authorizationUrl: vi.fn(),
            metadata: {client_id: 'client_id'},
        };
        sessionRepoMock = {
            getData: vi.fn(),
            storeData: vi.fn(),
            deleteData: vi.fn(),
        };
        oidcClientService = createOIDCClientService({
            'core.infra.oidcClient': oidcClientMock as OidcClient,
            'core.infra.session': sessionRepoMock as ISessionRepo,
            config: defaultConfig,
        });
    });

    it('Should return oidcClient instance', () => {
        expect(oidcClientService.oidcClient).toBe(oidcClientMock);
    });

    describe('saveOIDCTokens', () => {
        it('Should store token in cache with expiration as string', async () => {
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
            const storedCacheKey = JSON.stringify(['codeVerifier', 'redirectUri']);
            sessionRepoMock.getData.mockResolvedValue([storedCacheKey]);
            sessionRepoMock.deleteData.mockResolvedValue(null);
            oidcClientMock.grant.mockResolvedValueOnce('grant return');

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
            sessionRepoMock.getData.mockResolvedValue(undefined);

            await expect(async () => oidcClientService.getTokensFromCodes(getTokensParams)).rejects.toThrow(
                'Unauthorized',
            );
            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
        });

        it("should throw an error if user didn't complete the login in time (code verifier is expired)", async () => {
            sessionRepoMock.getData.mockResolvedValue([null]);

            await expect(async () => oidcClientService.getTokensFromCodes(getTokensParams)).rejects.toThrow(
                'Unauthorized',
            );
            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
        });
    });

    describe('checkTokensValidity', () => {
        const userId = 'userId';

        it('should do nothing if access token is valid', async () => {
            const storedCacheKey = JSON.stringify(['codeVerifier', 'redirectUri']);
            sessionRepoMock.getData.mockResolvedValue([storedCacheKey]);

            await oidcClientService.checkTokensValidity({userId});

            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.getData).toHaveBeenCalledWith(['oidc_tokens:userId']);
            expect(oidcClientMock.refresh).not.toHaveBeenCalled();
        });

        it('should throw an error if the cache is not found (possible Redis error)', async () => {
            sessionRepoMock.getData.mockResolvedValue(null);

            await expect(async () => oidcClientService.checkTokensValidity({userId})).rejects.toThrow(
                'OIDC session expired',
            );
            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
        });

        it('should throw an error if refresh token is expired in cache', async () => {
            sessionRepoMock.getData.mockResolvedValue([null]);

            await expect(async () => oidcClientService.checkTokensValidity({userId})).rejects.toThrow(
                'OIDC session expired',
            );
            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
        });
    });

    describe('getValidAccessToken', () => {
        const userId = 'userId';

        it('should return the cached access token without refreshing when still valid', async () => {
            const validTokenSet = JSON.stringify({access_token: 'valid_token', expires_at: 9_999_999_999});
            sessionRepoMock.getData.mockResolvedValue([validTokenSet]);

            await expect(oidcClientService.getValidAccessToken({userId})).resolves.toEqual('valid_token');
            expect(oidcClientMock.refresh).not.toHaveBeenCalled();
        });

        it('should refresh and return the new access token when the cached one has expired', async () => {
            const expiredTokenSet = JSON.stringify({access_token: 'expired_token', expires_at: 1});
            sessionRepoMock.getData.mockResolvedValue([expiredTokenSet]);
            oidcClientMock.refresh.mockResolvedValue(
                new TokenSet({access_token: 'fresh_token', expires_at: 9_999_999_999}),
            );

            await expect(oidcClientService.getValidAccessToken({userId})).resolves.toEqual('fresh_token');
            expect(oidcClientMock.refresh).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.storeData).toHaveBeenCalledTimes(1);
        });

        it('should throw when the refresh fails', async () => {
            const expiredTokenSet = JSON.stringify({access_token: 'expired_token', expires_at: 1});
            sessionRepoMock.getData.mockResolvedValue([expiredTokenSet]);
            oidcClientMock.refresh.mockRejectedValue(new Error('IdP unreachable'));

            await expect(oidcClientService.getValidAccessToken({userId})).rejects.toThrow('IdP unreachable');
            expect(oidcClientMock.refresh).toHaveBeenCalledTimes(1);
        });

        it('should dedupe concurrent refreshes into a single refresh call (single-flight)', async () => {
            const expiredTokenSet = JSON.stringify({access_token: 'expired_token', expires_at: 1});
            sessionRepoMock.getData.mockResolvedValue([expiredTokenSet]);
            oidcClientMock.refresh.mockResolvedValue(
                new TokenSet({access_token: 'fresh_token', expires_at: 9_999_999_999}),
            );

            const results = await Promise.all([
                oidcClientService.getValidAccessToken({userId}),
                oidcClientService.getValidAccessToken({userId}),
                oidcClientService.getValidAccessToken({userId}),
            ]);

            expect(results).toEqual(['fresh_token', 'fresh_token', 'fresh_token']);
            expect(oidcClientMock.refresh).toHaveBeenCalledTimes(1);
        });

        it('should throw Unauthorized when the cache is missing (session over)', async () => {
            sessionRepoMock.getData.mockResolvedValue([null]);

            await expect(async () => oidcClientService.getValidAccessToken({userId})).rejects.toThrow('Unauthorized');
        });
    });

    describe('getAuthorizationUrl', () => {
        const queryId = 'queryId';
        const redirectUri = 'redirectUri';

        it('should return an authorization url with the given redirect uri', async () => {
            sessionRepoMock.storeData.mockResolvedValue(null);
            oidcClientMock.authorizationUrl.mockResolvedValueOnce('authorizationUrl return');

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
        it.todo('TODO');
    });

    describe('saveOriginalUrl', () => {
        it.todo('TODO');
    });

    describe('getOriginalUrl', () => {
        it.todo('TODO');
    });
});
