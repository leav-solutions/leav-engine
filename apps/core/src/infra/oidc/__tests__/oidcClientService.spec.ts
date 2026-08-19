import createOIDCClientService, {type IOIDCClientService} from '../oidcClientService';
import {
    Configuration,
    authorizationCodeGrant,
    buildAuthorizationUrl,
    buildEndSessionUrl,
    calculatePKCECodeChallenge,
    randomPKCECodeVerifier,
    refreshTokenGrant,
} from 'openid-client';
import {type Mock} from 'vitest';
import {type IConfig} from '../../../_types/config';
import {type ISessionRepo} from '../../session/sessionRepo';
import type * as OpenidClient from 'openid-client';

vi.mock('openid-client', async importOriginal => ({
    ...(await importOriginal<typeof OpenidClient>()),
    authorizationCodeGrant: vi.fn(),
    buildAuthorizationUrl: vi.fn(),
    buildEndSessionUrl: vi.fn(),
    calculatePKCECodeChallenge: vi.fn(),
    randomPKCECodeVerifier: vi.fn(),
    refreshTokenGrant: vi.fn(),
}));

const authorizationCodeGrantMock = authorizationCodeGrant as Mock;
const buildAuthorizationUrlMock = buildAuthorizationUrl as Mock;
const buildEndSessionUrlMock = buildEndSessionUrl as Mock;
const calculatePKCECodeChallengeMock = calculatePKCECodeChallenge as Mock;
const randomPKCECodeVerifierMock = randomPKCECodeVerifier as Mock;
const refreshTokenGrantMock = refreshTokenGrant as Mock;

describe('OIDCClientService', () => {
    const defaultConfig = {
        auth: {
            refreshTokenExpiration: '5',
            oidc: {
                verificationKeysExpiration: '10',
                postLogoutRedirectUri: 'https://example.com/postLogout',
            },
        },
    } as unknown as IConfig;

    const oidcClientMock = new Configuration({issuer: 'https://mock.example.com'}, 'client_id');
    let sessionRepoMock: Mockify<ISessionRepo>;
    let oidcClientService: IOIDCClientService;

    beforeEach(() => {
        vi.clearAllMocks();
        sessionRepoMock = {
            getData: vi.fn(),
            storeData: vi.fn(),
            deleteData: vi.fn(),
        };
        oidcClientService = createOIDCClientService({
            'core.infra.oidcClient': oidcClientMock,
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
                tokens: {
                    access_token: 'access_token',
                    refresh_token: 'refresh_token',
                    expires_at: 42,
                    token_type: 'bearer',
                },
            });

            expect(sessionRepoMock.storeData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.storeData).toHaveBeenCalledWith({
                key: 'oidc_tokens:userId',
                data: '{"access_token":"access_token","refresh_token":"refresh_token","expires_at":42,"token_type":"bearer"}',
                expiresIn: 60_000 + Number(defaultConfig.auth.refreshTokenExpiration),
            });
        });

        it('Should derive expires_at from expires_in when the token endpoint only returned the relative value', async () => {
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2026-01-01T00:00:00Z'));

            try {
                await oidcClientService.saveOIDCTokens({
                    userId: 'userId',
                    tokens: {access_token: 'access_token', expires_in: 300, token_type: 'bearer'},
                });
            } finally {
                vi.useRealTimers();
            }

            expect(sessionRepoMock.storeData).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: JSON.stringify({
                        access_token: 'access_token',
                        expires_in: 300,
                        token_type: 'bearer',
                        expires_at: 1_767_225_600 + 300,
                    }),
                }),
            );
        });

        it('Should use refresh_expires_in as the cache ttl when Keycloak returned it', async () => {
            await oidcClientService.saveOIDCTokens({
                userId: 'userId',
                tokens: {access_token: 'access_token', expires_at: 42, refresh_expires_in: 1_800, token_type: 'bearer'},
            });

            expect(sessionRepoMock.storeData).toHaveBeenCalledWith(expect.objectContaining({expiresIn: 1_800_000}));
        });

        it('Should fall back to the configured ttl when refresh_expires_in is 0 (offline token)', async () => {
            await oidcClientService.saveOIDCTokens({
                userId: 'userId',
                tokens: {access_token: 'access_token', expires_at: 42, refresh_expires_in: 0, token_type: 'bearer'},
            });

            expect(sessionRepoMock.storeData).toHaveBeenCalledWith(
                expect.objectContaining({
                    expiresIn: 60_000 + Number(defaultConfig.auth.refreshTokenExpiration),
                }),
            );
        });
    });

    describe('getTokensFromCodes', () => {
        const getTokensParams = {
            callbackUrl: new URL('https://example.com/auth/oidc/verify/identifier?code=123456789AZERTY'),
            queryId: 'queryId',
        };

        it('should get a set of tokens with the given callback url', async () => {
            sessionRepoMock.getData.mockResolvedValue([JSON.stringify(['codeVerifier'])]);
            sessionRepoMock.deleteData.mockResolvedValue(null);
            authorizationCodeGrantMock.mockResolvedValueOnce({access_token: 'grant return'});

            const expectedResponse = await oidcClientService.getTokensFromCodes(getTokensParams);

            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.getData).toHaveBeenCalledWith(['oidc_verificationKeys:queryId']);
            expect(sessionRepoMock.deleteData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.deleteData).toHaveBeenCalledWith(['oidc_verificationKeys:queryId']);
            expect(authorizationCodeGrantMock).toHaveBeenCalledTimes(1);
            expect(authorizationCodeGrantMock).toHaveBeenCalledWith(oidcClientMock, getTokensParams.callbackUrl, {
                pkceCodeVerifier: 'codeVerifier',
            });
            expect(expectedResponse).toEqual({access_token: 'grant return'});
        });

        it('should still read entries written before the redirect uri was dropped from the cache', async () => {
            sessionRepoMock.getData.mockResolvedValue([JSON.stringify(['codeVerifier', 'redirectUri'])]);
            sessionRepoMock.deleteData.mockResolvedValue(null);
            authorizationCodeGrantMock.mockResolvedValueOnce({access_token: 'grant return'});

            await oidcClientService.getTokensFromCodes(getTokensParams);

            expect(authorizationCodeGrantMock).toHaveBeenCalledWith(oidcClientMock, getTokensParams.callbackUrl, {
                pkceCodeVerifier: 'codeVerifier',
            });
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
            const storedCacheKey = JSON.stringify({access_token: 'access_token', expires_at: 9_999_999_999});
            sessionRepoMock.getData.mockResolvedValue([storedCacheKey]);

            await oidcClientService.checkTokensValidity({userId});

            expect(sessionRepoMock.getData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.getData).toHaveBeenCalledWith(['oidc_tokens:userId']);
            expect(refreshTokenGrantMock).not.toHaveBeenCalled();
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
            expect(refreshTokenGrantMock).not.toHaveBeenCalled();
        });

        it('should refresh when the cached token is about to expire, within the leeway', async () => {
            const aboutToExpire = JSON.stringify({
                access_token: 'stale_token',
                refresh_token: 'refresh_token',
                expires_at: Math.floor(Date.now() / 1_000) + 1,
            });
            sessionRepoMock.getData.mockResolvedValue([aboutToExpire]);
            refreshTokenGrantMock.mockResolvedValue({access_token: 'fresh_token', expires_at: 9_999_999_999});

            await expect(oidcClientService.getValidAccessToken({userId})).resolves.toEqual('fresh_token');
            expect(refreshTokenGrantMock).toHaveBeenCalledTimes(1);
        });

        it('should refresh and return the new access token when the cached one has expired', async () => {
            const expiredTokenSet = JSON.stringify({
                access_token: 'expired_token',
                refresh_token: 'refresh_token',
                expires_at: 1,
            });
            sessionRepoMock.getData.mockResolvedValue([expiredTokenSet]);
            refreshTokenGrantMock.mockResolvedValue({access_token: 'fresh_token', expires_at: 9_999_999_999});

            await expect(oidcClientService.getValidAccessToken({userId})).resolves.toEqual('fresh_token');
            expect(refreshTokenGrantMock).toHaveBeenCalledTimes(1);
            expect(refreshTokenGrantMock).toHaveBeenCalledWith(oidcClientMock, 'refresh_token');
            expect(sessionRepoMock.storeData).toHaveBeenCalledTimes(1);
        });

        it('should throw when the refresh fails', async () => {
            const expiredTokenSet = JSON.stringify({
                access_token: 'expired_token',
                refresh_token: 'refresh_token',
                expires_at: 1,
            });
            sessionRepoMock.getData.mockResolvedValue([expiredTokenSet]);
            refreshTokenGrantMock.mockRejectedValue(new Error('IdP unreachable'));

            await expect(oidcClientService.getValidAccessToken({userId})).rejects.toThrow('IdP unreachable');
            expect(refreshTokenGrantMock).toHaveBeenCalledTimes(1);
        });

        it('should throw Unauthorized without calling the IdP when the expired token set has no refresh token', async () => {
            const expiredTokenSet = JSON.stringify({access_token: 'expired_token', expires_at: 1});
            sessionRepoMock.getData.mockResolvedValue([expiredTokenSet]);

            await expect(oidcClientService.getValidAccessToken({userId})).rejects.toThrow('Unauthorized');
            expect(refreshTokenGrantMock).not.toHaveBeenCalled();
        });

        it('should dedupe concurrent refreshes into a single refresh call (single-flight)', async () => {
            const expiredTokenSet = JSON.stringify({
                access_token: 'expired_token',
                refresh_token: 'refresh_token',
                expires_at: 1,
            });
            sessionRepoMock.getData.mockResolvedValue([expiredTokenSet]);
            refreshTokenGrantMock.mockResolvedValue({access_token: 'fresh_token', expires_at: 9_999_999_999});

            const results = await Promise.all([
                oidcClientService.getValidAccessToken({userId}),
                oidcClientService.getValidAccessToken({userId}),
                oidcClientService.getValidAccessToken({userId}),
            ]);

            expect(results).toEqual(['fresh_token', 'fresh_token', 'fresh_token']);
            expect(refreshTokenGrantMock).toHaveBeenCalledTimes(1);
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
            randomPKCECodeVerifierMock.mockReturnValue('codeVerifier');
            calculatePKCECodeChallengeMock.mockResolvedValue('codeChallenge');
            buildAuthorizationUrlMock.mockReturnValue(new URL('https://example.com/authorizationUrl'));

            const expectedResponse = await oidcClientService.getAuthorizationUrl({redirectUri, queryId});

            expect(sessionRepoMock.storeData).toHaveBeenCalledTimes(1);
            expect(sessionRepoMock.storeData).toHaveBeenCalledWith(
                expect.objectContaining({
                    expiresIn: Number(defaultConfig.auth.oidc.verificationKeysExpiration),
                    key: 'oidc_verificationKeys:queryId',
                    data: JSON.stringify(['codeVerifier']),
                }),
            );

            expect(buildAuthorizationUrlMock).toHaveBeenCalledTimes(1);
            const [calledClient, calledParams] = buildAuthorizationUrlMock.mock.calls[0];
            expect(calledClient).toBe(oidcClientMock);
            expect(calledParams.get('redirect_uri')).toEqual(redirectUri);
            expect(calledParams.get('response_type')).toEqual('code');
            expect(calledParams.get('scope')).toEqual('openid');
            expect(calledParams.get('code_challenge')).toEqual('codeChallenge');
            expect(calledParams.get('code_challenge_method')).toEqual('S256');

            expect(expectedResponse).toEqual('https://example.com/authorizationUrl');
        });
    });

    describe('getLogoutUrl', () => {
        const withSkipLogoutConfirmationPage = () =>
            createOIDCClientService({
                'core.infra.oidcClient': oidcClientMock,
                'core.infra.session': sessionRepoMock as ISessionRepo,
                config: {
                    ...defaultConfig,
                    auth: {
                        ...defaultConfig.auth,
                        oidc: {...defaultConfig.auth.oidc, skipLogoutConfirmationPage: true},
                    },
                } as IConfig,
            });

        beforeEach(() => {
            sessionRepoMock.deleteData.mockResolvedValue(null);
            buildEndSessionUrlMock.mockReturnValue(new URL('https://example.com/logout'));
        });

        it('should build the end session url and clear the cached tokens', async () => {
            const result = await oidcClientService.getLogoutUrl({userId: 'userId'});

            expect(buildEndSessionUrlMock).toHaveBeenCalledTimes(1);
            const [calledClient, calledParams] = buildEndSessionUrlMock.mock.calls[0];
            expect(calledClient).toBe(oidcClientMock);
            expect(calledParams.get('post_logout_redirect_uri')).toEqual(defaultConfig.auth.oidc.postLogoutRedirectUri);
            expect(calledParams.has('id_token_hint')).toBe(false);
            expect(sessionRepoMock.deleteData).toHaveBeenCalledWith(['oidc_tokens:userId']);
            expect(result).toEqual('https://example.com/logout');
        });

        it('should pass the cached id_token as id_token_hint when skipping the confirmation page', async () => {
            sessionRepoMock.getData.mockResolvedValue([JSON.stringify({id_token: 'id_token'})]);

            await withSkipLogoutConfirmationPage().getLogoutUrl({userId: 'userId'});

            expect(buildEndSessionUrlMock.mock.calls[0][1].get('id_token_hint')).toEqual('id_token');
        });

        it('should still build the url when the token set is no longer in cache', async () => {
            sessionRepoMock.getData.mockResolvedValue([null]);

            const result = await withSkipLogoutConfirmationPage().getLogoutUrl({userId: 'userId'});

            expect(buildEndSessionUrlMock.mock.calls[0][1].has('id_token_hint')).toBe(false);
            expect(result).toEqual('https://example.com/logout');
        });
    });

    describe('saveOriginalUrl', () => {
        it.todo('TODO');
    });

    describe('getOriginalUrl', () => {
        it.todo('TODO');
    });
});
