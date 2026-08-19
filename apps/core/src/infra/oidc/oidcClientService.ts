import {type OidcClient} from './oidcClient';
import {
    type TokenEndpointResponse,
    authorizationCodeGrant,
    buildAuthorizationUrl,
    buildEndSessionUrl,
    calculatePKCECodeChallenge,
    randomPKCECodeVerifier,
    refreshTokenGrant,
} from 'openid-client';
import AuthenticationError from '../../errors/AuthenticationError';
import {type IConfig} from '../../_types/config';
import ms from 'ms';
import {type ISessionRepo} from '../session/sessionRepo';
import {logger} from '@leav/logger';

const AUTH_VERIFICATION_KEYS_HEADER = 'oidc_verificationKeys';
const ORIGINAL_URL_HEADER = 'oidc_originalUrl';
const TOKENS_HEADER = 'oidc_tokens';
const MAX_TIME_OIDC_ORIGINAL_URL_IN_MS = 1_000 * 60 * 60 * 24; // 24 hours
// Refresh slightly early, to absorb the clock drift with the IdP and the time elapsed since the token was issued
const TOKEN_EXPIRY_LEEWAY_IN_S = 3;

type AuthRedirectStoredData = [codeVerifier: string];

// Extends the standard response with computed (expires_at) and Keycloak-specific (refresh_expires_in) fields
type OidcTokens = TokenEndpointResponse & {expires_at?: number; refresh_expires_in?: number};

export interface IOIDCClientService {
    oidcClient?: OidcClient;
    getTokensFromCodes: (params: {callbackUrl: URL; queryId: string}) => Promise<OidcTokens>;
    getAuthorizationUrl: (params: {redirectUri: string; queryId: string}) => Promise<string>;
    getLogoutUrl: (params: {userId: string | null}) => Promise<string>;
    saveOIDCTokens: (params: {userId: string; tokens: OidcTokens}) => Promise<void>;
    checkTokensValidity: (params: {userId: string}) => Promise<void> | never;
    getValidAccessToken: (params: {userId: string}) => Promise<string>;
    saveOriginalUrl: (params: {originalUrl: string; queryId: string}) => Promise<void>;
    getOriginalUrl: (queryId: string) => Promise<string>;
}

interface IDeps {
    'core.infra.oidcClient': OidcClient;
    config: IConfig;
    'core.infra.session': ISessionRepo;
}

export default function ({
    'core.infra.oidcClient': oidcClient,
    'core.infra.session': sessionRepo,
    config,
}: IDeps): IOIDCClientService {
    const verificationKeysExpirationInMs = ms(config.auth.oidc.verificationKeysExpiration);
    const refreshTokenExpirationInMs = ms(config.auth.refreshTokenExpiration) + 1_000 * 60;

    // Single-flight refresh: dedupe concurrent refreshes for the same user, so a burst of parallel
    // requests arriving after the access token expired triggers a single refresh call to the IdP.
    const _refreshPromises = new Map<string, Promise<OidcTokens>>();

    const _buildAuthVerificationKeysCacheKey = (queryId: string) => `${AUTH_VERIFICATION_KEYS_HEADER}:${queryId}`;
    const _buildOriginalUrlCacheKey = (queryId: string) => `${ORIGINAL_URL_HEADER}:${queryId}`;
    const _buildTokensCacheKey = (userId: string) => `${TOKENS_HEADER}:${userId}`;

    const _getCodeVerifierByQueryId = async (queryId: string): Promise<AuthRedirectStoredData> => {
        const cacheContent = await sessionRepo.getData([_buildAuthVerificationKeysCacheKey(queryId)]);
        config.auth.debugLog &&
            logger.silly(`OIDC _getCodeVerifierByQueryId key=${_buildAuthVerificationKeysCacheKey(queryId)}`);
        if (cacheContent === undefined) {
            throw new AuthenticationError('Unauthorized', {retryAuthenticationFlow: true});
        }
        if (cacheContent[0] === null) {
            throw new AuthenticationError('Unauthorized', {retryAuthenticationFlow: true});
        }
        return JSON.parse(cacheContent[0]) as AuthRedirectStoredData;
    };

    const _writeCodeVerifierByQueryId = (queryId: string, data: AuthRedirectStoredData): Promise<void> => {
        config.auth.debugLog &&
            logger.silly(`OIDC _writeCodeVerifierByQueryId key=${_buildAuthVerificationKeysCacheKey(queryId)}`);
        return sessionRepo.storeData({
            key: _buildAuthVerificationKeysCacheKey(queryId),
            data: JSON.stringify(data),
            expiresIn: verificationKeysExpirationInMs,
        });
    };

    const _deleteCodeVerifierByQueryId = (queryId: string) => {
        config.auth.debugLog &&
            logger.silly(`OIDC _deleteCodeVerifierByQueryId key=${_buildAuthVerificationKeysCacheKey(queryId)}`);
        return sessionRepo.deleteData([_buildAuthVerificationKeysCacheKey(queryId)]);
    };

    const _getTokenSetByUserId = async (userId: string): Promise<OidcTokens> => {
        const cacheContent = await sessionRepo.getData([_buildTokensCacheKey(userId)]);
        config.auth.debugLog && logger.silly(`OIDC _getTokenSetByUserId key=${_buildTokensCacheKey(userId)}`);
        if (cacheContent === undefined) {
            throw new AuthenticationError('Unauthorized');
        }
        if (cacheContent[0] === null) {
            throw new AuthenticationError('Unauthorized');
        }
        return JSON.parse(cacheContent[0]);
    };

    // v6 no longer computes expires_at like the old TokenSet did, so we derive and persist it ourselves
    // from the relative expires_in returned by the token endpoint.
    const _normalizeTokens = (tokens: OidcTokens): OidcTokens => ({
        ...tokens,
        expires_at:
            typeof tokens.expires_at === 'number'
                ? tokens.expires_at
                : typeof tokens.expires_in === 'number'
                  ? Math.floor(Date.now() / 1_000) + tokens.expires_in
                  : undefined,
    });

    const _writeTokensSetByUserId = (userId: string, tokens: OidcTokens): Promise<void> => {
        const normalizedTokens = _normalizeTokens(tokens);
        // 0 means "never expires" (offline tokens), and Redis rejects a 0 ttl
        const expiresIn =
            Number.isFinite(normalizedTokens.refresh_expires_in) && normalizedTokens.refresh_expires_in > 0
                ? normalizedTokens.refresh_expires_in * 1_000
                : refreshTokenExpirationInMs;
        config.auth.debugLog &&
            logger.silly(`OIDC _writeTokensSetByUserId key=${_buildTokensCacheKey(userId)}, expires_in=${expiresIn}`);
        return sessionRepo.storeData({
            key: _buildTokensCacheKey(userId),
            data: JSON.stringify(normalizedTokens),
            expiresIn,
        });
    };

    const _deleteTokensSetByUserId = (userId: string): Promise<void> => {
        config.auth.debugLog && logger.silly(`OIDC _deleteTokensSetByUserId key=${_buildTokensCacheKey(userId)}`);
        return sessionRepo.deleteData([_buildTokensCacheKey(userId)]);
    };

    const _refreshTokenSet = (userId: string, tokenSet: OidcTokens): Promise<OidcTokens> => {
        const existing = _refreshPromises.get(userId);
        if (existing) {
            return existing;
        }

        const pending = (async () => {
            try {
                if (!tokenSet.refresh_token) {
                    throw new AuthenticationError('Unauthorized');
                }
                const newTokenSet = await refreshTokenGrant(oidcClient, tokenSet.refresh_token);
                // We overwrite rather than delete: in-flight requests (or another core instance)
                // may still be using the previous token set for a short period of time.
                await _writeTokensSetByUserId(userId, newTokenSet);
                return newTokenSet;
            } finally {
                _refreshPromises.delete(userId);
            }
        })();
        _refreshPromises.set(userId, pending);

        return pending;
    };

    // Reads the cached token set and refreshes it if the access token has expired.
    const _ensureValidTokenSet = async (userId: string): Promise<OidcTokens> => {
        const tokenSet = await _getTokenSetByUserId(userId);

        if (!_isTokenExpired(tokenSet)) {
            return tokenSet;
        }

        return _refreshTokenSet(userId, tokenSet);
    };

    const _writeOriginalUrlByQueryId = (queryId: string, originalUrl: string) =>
        sessionRepo.storeData({
            key: _buildOriginalUrlCacheKey(queryId),
            data: originalUrl,
            expiresIn: MAX_TIME_OIDC_ORIGINAL_URL_IN_MS,
        });

    const _getOriginalUrlByQueryId = async (queryId: string) => {
        const cacheContent = await sessionRepo.getData([_buildOriginalUrlCacheKey(queryId)]);
        return cacheContent?.[0] || config.server.publicUrl;
    };

    const _deleteOriginalUrlByQueryId = (queryId: string) =>
        sessionRepo.deleteData([_buildOriginalUrlCacheKey(queryId)]);

    const _isTokenExpired = (tokens: OidcTokens): boolean => {
        if (typeof tokens.expires_at === 'number') {
            return tokens.expires_at - TOKEN_EXPIRY_LEEWAY_IN_S < Math.floor(Date.now() / 1_000);
        }
        return false;
    };

    return {
        oidcClient,
        getTokensFromCodes: async ({callbackUrl, queryId}) => {
            const [codeVerifier] = await _getCodeVerifierByQueryId(queryId);
            // No need to await delete fn, it's just for clean up
            _deleteCodeVerifierByQueryId(queryId).catch(err => {
                logger.error(`Error deleting OIDC code verifier cache for queryId=${queryId}: ${err.message}`);
            });

            // redirect_uri is automatically derived by v6 from callbackUrl (via stripParams)
            // callbackUrl must include all Keycloak params (iss, session_state, code…)
            return authorizationCodeGrant(oidcClient, callbackUrl, {
                pkceCodeVerifier: codeVerifier,
            });
        },
        getAuthorizationUrl: async ({redirectUri, queryId}) => {
            const codeVerifier = randomPKCECodeVerifier();
            const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);

            await _writeCodeVerifierByQueryId(queryId, [codeVerifier]);

            const url = buildAuthorizationUrl(
                oidcClient,
                new URLSearchParams({
                    redirect_uri: redirectUri,
                    response_type: 'code',
                    scope: 'openid',
                    code_challenge: codeChallenge,
                    code_challenge_method: 'S256',
                }),
            );

            return url.href;
        },
        getLogoutUrl: async ({userId}) => {
            const params = new URLSearchParams({
                post_logout_redirect_uri: config.auth.oidc.postLogoutRedirectUri,
            });

            if (config.auth.oidc.skipLogoutConfirmationPage && userId) {
                try {
                    const tokenSet = await _getTokenSetByUserId(userId);
                    if (tokenSet.id_token) {
                        params.set('id_token_hint', tokenSet.id_token);
                    }
                } catch {
                    // Token might not be in cache (already expired), continue without id_token_hint
                }
            }

            // No need to await delete fn, it's just for clean up
            _deleteTokensSetByUserId(userId).catch(err => {
                logger.error(`Error deleting OIDC tokens for userId=${userId}: ${err.message}`);
            });

            return buildEndSessionUrl(oidcClient, params).href;
        },
        saveOIDCTokens: ({userId, tokens}) => _writeTokensSetByUserId(userId, tokens),
        checkTokensValidity: async ({userId}) => {
            try {
                await _ensureValidTokenSet(userId);
            } catch {
                throw new AuthenticationError('OIDC session expired');
            }
        },
        getValidAccessToken: async ({userId}) => {
            const {access_token} = await _ensureValidTokenSet(userId);

            if (!access_token) {
                throw new AuthenticationError('Unauthorized');
            }

            return access_token;
        },
        saveOriginalUrl: ({originalUrl, queryId}) => _writeOriginalUrlByQueryId(queryId, originalUrl),
        getOriginalUrl: async queryId => {
            const originalUrl = await _getOriginalUrlByQueryId(queryId);
            // No need to await delete fn, it's just for clean up
            _deleteOriginalUrlByQueryId(queryId).catch(err => {
                logger.error(`Error deleting originalUrl cache for queryId=${queryId}: ${err.message}`);
            });
            return originalUrl;
        },
    };
}
