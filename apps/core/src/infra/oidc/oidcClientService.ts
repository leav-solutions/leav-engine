// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type OidcClient} from './oidcClient';
import {type EndSessionParameters, generators, TokenSet} from 'openid-client';
import AuthenticationError from '../../errors/AuthenticationError';
import {type IConfig} from '../../_types/config';
import ms from 'ms';
import {type ISessionRepo} from '../session/sessionRepo';
import {logger} from '@leav/logger';

const AUTH_VERIFICATION_KEYS_HEADER = 'oidc_verificationKeys';
const ORIGINAL_URL_HEADER = 'oidc_originalUrl';
const TOKENS_HEADER = 'oidc_tokens';
const MAX_TIME_OIDC_ORIGINAL_URL_IN_MS = 1_000 * 60 * 60 * 24; // 24 hours

type AuthRedirectStoredData = [codeVerifier: string, redirectUri: string];

export interface IOIDCClientService {
    oidcClient?: OidcClient;
    getTokensFromCodes: (params: {authorizationCode: string; queryId: string}) => Promise<TokenSet>;
    getAuthorizationUrl: (params: {redirectUri: string; queryId: string}) => Promise<string>;
    getLogoutUrl: (params: {userId: string | null}) => Promise<string>;
    saveOIDCTokens: (params: {userId: string; tokens: TokenSet}) => Promise<void>;
    checkTokensValidity: (params: {userId: string}) => Promise<void> | never;
    saveOriginalUrl: (params: {originalUrl: string; queryId: string}) => Promise<void>;
    getOriginalUrl: (queryId: string) => Promise<string>;
}

interface IDeps {
    'core.infra.oidcClient'?: OidcClient;
    config?: IConfig;
    'core.infra.session'?: ISessionRepo;
}

export default function ({
    'core.infra.oidcClient': oidcClient = null,
    'core.infra.session': sessionRepo = null,
    config = null,
}: IDeps = {}): IOIDCClientService {
    const verificationKeysExpirationInMs = ms(config.auth.oidc.verificationKeysExpiration);
    const refreshTokenExpirationInMs = ms(config.auth.refreshTokenExpiration) + 1_000 * 60;

    const _buildAuthVerificationKeysCacheKey = (queryId: string) => `${AUTH_VERIFICATION_KEYS_HEADER}:${queryId}`;
    const _buildOriginalUrlCacheKey = (queryId: string) => `${ORIGINAL_URL_HEADER}:${queryId}`;
    const _buildTokensCacheKey = (userId: string) => `${TOKENS_HEADER}:${userId}`;

    const _getCodeVerifierRedirectUriByQueryId = async (queryId: string): Promise<AuthRedirectStoredData> => {
        const cacheContent = await sessionRepo.getData([_buildAuthVerificationKeysCacheKey(queryId)]);
        config.auth.debugLog &&
            logger.silly(
                `OIDC _getCodeVerifierRedirectUriByQueryId key=${_buildAuthVerificationKeysCacheKey(queryId)}`,
            );
        if (cacheContent === undefined) {
            throw new AuthenticationError('Unauthorized', {retryAuthenticationFlow: true});
        }
        if (cacheContent[0] === null) {
            throw new AuthenticationError('Unauthorized', {retryAuthenticationFlow: true});
        }
        return JSON.parse(cacheContent[0]) as AuthRedirectStoredData;
    };

    const _writeCodeVerifierRedirectUriByQueryId = (queryId: string, data: AuthRedirectStoredData): Promise<void> => {
        config.auth.debugLog &&
            logger.silly(
                `OIDC _writeCodeVerifierRedirectUriByQueryId key=${_buildAuthVerificationKeysCacheKey(queryId)}`,
            );
        return sessionRepo.storeData({
            key: _buildAuthVerificationKeysCacheKey(queryId),
            data: JSON.stringify(data),
            expiresIn: verificationKeysExpirationInMs,
        });
    };

    const _deleteCodeVerifierRedirectUriByQueryId = (queryId: string) => {
        config.auth.debugLog &&
            logger.silly(
                `OIDC _deleteCodeVerifierRedirectUriByQueryId key=${_buildAuthVerificationKeysCacheKey(queryId)}`,
            );
        return sessionRepo.deleteData([_buildAuthVerificationKeysCacheKey(queryId)]);
    };

    const _getTokenSetByUserId = async (userId: string): Promise<TokenSet> => {
        const cacheContent = await sessionRepo.getData([_buildTokensCacheKey(userId)]);
        config.auth.debugLog && logger.silly(`OIDC _getTokenSetByUserId key=${_buildTokensCacheKey(userId)}`);
        if (cacheContent === undefined) {
            throw new AuthenticationError('Unauthorized');
        }
        if (cacheContent[0] === null) {
            throw new AuthenticationError('Unauthorized');
        }
        return new TokenSet(JSON.parse(cacheContent[0]));
    };

    const _writeTokensSetByUserId = (userId: string, tokens: TokenSet): Promise<void> => {
        config.auth.debugLog && logger.silly(`OIDC _writeTokensSetByUserId key=${_buildTokensCacheKey(userId)}`);
        return sessionRepo.storeData({
            key: _buildTokensCacheKey(userId),
            data: JSON.stringify(tokens),
            expiresIn: refreshTokenExpirationInMs,
        });
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

    return {
        oidcClient,
        getTokensFromCodes: async ({authorizationCode, queryId}) => {
            const [codeVerifier, redirectUri] = await _getCodeVerifierRedirectUriByQueryId(queryId);
            // No need to await delete fn, it's just for clean up
            _deleteCodeVerifierRedirectUriByQueryId(queryId);

            return oidcClient.grant({
                grant_type: 'authorization_code',
                code: authorizationCode,
                code_verifier: codeVerifier,
                redirect_uri: redirectUri,
            });
        },
        getAuthorizationUrl: async ({redirectUri, queryId}) => {
            const codeVerifier = generators.codeVerifier();

            await _writeCodeVerifierRedirectUriByQueryId(queryId, [codeVerifier, redirectUri]);

            return oidcClient.authorizationUrl({
                redirect_uri: redirectUri,
                response_type: 'code',
                scope: 'openid',
                code_challenge: generators.codeChallenge(codeVerifier),
                code_challenge_method: 'S256',
            });
        },
        getLogoutUrl: async ({userId}) => {
            const payload: EndSessionParameters = {
                post_logout_redirect_uri: config.auth.oidc.postLogoutRedirectUri,
            };

            if (config.auth.oidc.skipLogoutConfirmationPage && userId) {
                payload.id_token_hint = await _getTokenSetByUserId(userId);
            }

            return oidcClient.endSessionUrl(payload);
        },
        saveOIDCTokens: ({userId, tokens}) => _writeTokensSetByUserId(userId, tokens),
        checkTokensValidity: async ({userId}) => {
            try {
                const tokenSet = await _getTokenSetByUserId(userId);

                if (tokenSet.expired()) {
                    // FIXME: Many successive calls to this function can happen in parallel, we need to refactor to improve this behavior
                    const newTokenSet = await oidcClient.refresh(tokenSet);
                    // We do not delete the old token set, as it might be needed for a short period of time
                    // We had race condition on multiple refresh requests, so we need to make sure that the old token can be used
                    await _writeTokensSetByUserId(userId, newTokenSet);
                }
            } catch (err) {
                throw new AuthenticationError('OIDC session expired');
            }
        },
        saveOriginalUrl: ({originalUrl, queryId}) => _writeOriginalUrlByQueryId(queryId, originalUrl),
        getOriginalUrl: async queryId => {
            const originalUrl = await _getOriginalUrlByQueryId(queryId);
            // No need to await delete fn, it's just for clean up
            _deleteOriginalUrlByQueryId(queryId);
            return originalUrl;
        },
    };
}
